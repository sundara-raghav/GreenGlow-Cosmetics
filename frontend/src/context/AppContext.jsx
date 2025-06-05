import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AppContext = createContext();

// Sample product data to use when API is not available
const sampleProducts = [
  {
    id: '1',
    product: 'Natural Honey',
    category: 'Food',
    price: 350,
    ingredients: 'Pure honey from Kolli Hills',
    usage: 'Can be used as a natural sweetener or for health benefits',
    discount: '10% off',
    description: 'Pure, unprocessed honey collected from the pristine forests of Kolli Hills.',
    stock: 25,
    companyId: {
      _id: "670e4d25ca9fda8f1bf359b9",
      name: "Sarvam",
      email: "sarvam@demo.com",
      image: '',
    },
    date: Date.now(),
    status: 'approved'
  },
  {
    id: '2',
    product: 'Herbal Soap',
    category: 'Personal Care',
    price: 120,
    ingredients: 'Natural herbs, coconut oil, essential oils',
    usage: 'For daily bathing and skin care',
    discount: '5% off',
    description: 'Handmade herbal soap with natural ingredients from Kolli Hills.',
    stock: 50,
    companyId: {
      _id: "670e4d25ca9fda8f1bf359b9",
      name: "Sarvam",
      email: "sarvam@demo.com",
      image: '',
    },
    date: Date.now(),
    status: 'approved'
  }
];

export const AppContextProvider = (props) => {
  const [searchFilter, setSearchFilter] = useState({ product: '' });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState(sampleProducts); // Initialize with sample data
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [userRole, setUserRole] = useState('client'); // 'client', 'admin', or 'seller'
  const [user, setUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user details

  // Fetch products from MongoDB API
  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:4242/products');
      if (response.data && Array.isArray(response.data.data)) {
        // Filter products based on status for client view
        if (userRole === 'client') {
          const approvedProducts = response.data.data.filter(product => product.status === 'approved');
          setJobs(approvedProducts);
        } else if (userRole === 'admin') {
          setJobs(response.data.data);
          // Set pending products for admin review
          const pending = response.data.data.filter(product => product.status === 'pending');
          setPendingProducts(pending);
        } else if (userRole === 'seller') {
          // For seller, show only their products
          if (user && user._id) {
            const sellerProducts = response.data.data.filter(
              product => product.companyId && product.companyId._id === user._id
            );
            setJobs(sellerProducts);
          } else {
            setJobs([]);
          }
        }
      } else {
        console.log('No products found or invalid data format');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addJob = async (newProduct) => {
    try {
      // For sellers, products are added with pending status
      const productToAdd = {
        ...newProduct,
        status: userRole === 'admin' ? 'approved' : 'pending'
      };
      
      const response = await fetch('http://localhost:4242/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToAdd),
      });
      const data = await response.json();
      
      if (response.ok) {
        setJobs((prevJobs) => [...prevJobs, { ...productToAdd, id: data.id }]);
        return { success: true, data };
      } else {
        throw new Error(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteJob = async (id) => {
    try {
      const response = await fetch(`http://localhost:4242/delete-product/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
        return { success: true };
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  };

  const approveProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:4242/approve-product/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      
      if (response.ok) {
        // Update local state
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === id ? { ...job, status: 'approved' } : job
          )
        );
        setPendingProducts(prevPending => 
          prevPending.filter(product => product.id !== id)
        );
        return { success: true };
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch products when component mounts
  useEffect(() => {
    fetchJobs();
  }, [userRole]);

  // Load logged-in user from localStorage on app initialization
  useEffect(() => {
    // Debugging log to check localStorage on app initialization
    console.log('Initializing AppContext, checking localStorage for loggedInUser');
    const storedUser = localStorage.getItem('loggedInUser');
    
    // Also check for 'user' key for backward compatibility
    const oldStoredUser = localStorage.getItem('user');
    
    if (storedUser) {
      console.log('Found loggedInUser in localStorage:', storedUser);
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);
      // Also set user and userRole for compatibility
      setUser(parsedUser);
      setUserRole(parsedUser.role || 'client');
    } else if (oldStoredUser) {
      // Migrate from old storage format
      console.log('Found user in localStorage (old format):', oldStoredUser);
      const parsedUser = JSON.parse(oldStoredUser);
      const migratedUser = {
        ...parsedUser,
        role: 'client',
        name: parsedUser.name || parsedUser.email?.split('@')[0] || 'Customer'
      };
      setLoggedInUser(migratedUser);
      setUser(migratedUser);
      setUserRole('client');
      // Update to new format
      localStorage.setItem('loggedInUser', JSON.stringify(migratedUser));
      localStorage.removeItem('user');
    }
  }, []);

  // Function to log out the user
  const logout = () => {
    console.log('Logging out user');
    // Clear all user states
    setLoggedInUser(null);
    setUser(null);
    setUserRole('client');
    
    // Clear localStorage
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('user'); // Also remove old format if exists
  };

  // Function to refresh user data from the server
  const refreshUserData = async (email) => {
    if (!email) return;
    
    try {
      const response = await fetch(`http://localhost:4242/user/${email}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          const refreshedUser = {
            ...data.user,
            role: data.user.role || 'client'
          };
          
          // Update states
          setLoggedInUser(refreshedUser);
          setUser(refreshedUser);
          setUserRole(refreshedUser.role);
          
          // Update localStorage
          localStorage.setItem('loggedInUser', JSON.stringify(refreshedUser));
          
          return refreshedUser;
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
    return null;
  };

  const login = (userData) => {
    console.log('Logging in user:', userData);
    // Ensure the user has a role
    const userWithRole = {
      ...userData,
      role: userData.role || 'client'
    };
    
    // Update both user states for compatibility
    setLoggedInUser(userWithRole);
    setUser(userWithRole);
    setUserRole(userWithRole.role);
    
    // Store in localStorage
    localStorage.setItem('loggedInUser', JSON.stringify(userWithRole));
    
    // Refresh user data from server to get latest info
    if (userData.email) {
      refreshUserData(userData.email);
    }
  };

  const value = {
    setSearchFilter,
    searchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    addJob,
    deleteJob,
    approveProduct,
    showRecruiterLogin,
    setShowRecruiterLogin,
    pendingProducts,
    userRole,
    setUserRole,
    fetchJobs,
    user, // Provide user in context
    setUser,
    loggedInUser,
    setLoggedInUser,
    login,
    logout,
    refreshUserData, // Add the refresh function
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};