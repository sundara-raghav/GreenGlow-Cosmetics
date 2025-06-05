import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

// Register the components needed for a line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export function adminLogin(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

const AdminDashboard = () => {
  const { jobs, addJob, deleteJob, approveProduct, pendingProducts, fetchJobs, userRole, setUserRole, user, setUser, setShowRecruiterLogin } = useContext(AppContext);
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState({
    product: '', price: '', category: '', ingredients: '', usage: '', discount: '', description: '', stock: ''
  });
  const [newSeller, setNewSeller] = useState({
    name: '', email: '', phone: '', address: '', businessName: '', businessType: '', password: 'seller123'
  });
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Set user role to admin when component mounts
  useEffect(() => {
    setUserRole && setUserRole('admin');
    fetchJobs && fetchJobs();
    fetchSellers();
    fetchOrders();
    fetchCustomers();
  }, [setUserRole, fetchJobs]);
  
  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:4242/admin/users');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data || []);
      } else {
        console.error('Error fetching customers:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Logout function
  const handleLogout = () => {
    setUser(null);
    setUserRole('client');
    setShowRecruiterLogin(false);
    navigate('/');
  };

  // Fetch sellers
  const fetchSellers = async () => {
    try {
      const response = await fetch('http://localhost:4242/sellers');
      const data = await response.json();
      if (response.ok) {
        setSellers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:4242/orders');
      const data = await response.json();
      if (response.ok) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSellerInputChange = (e) => {
    const { name, value } = e.target;
    setNewSeller((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    
    try {
      const product = {
        product: newProduct.product,
        price: parseFloat(newProduct.price) || 0,
        category: newProduct.category,
        ingredients: newProduct.ingredients,
        usage: newProduct.usage,
        discount: newProduct.discount || '0% off',
        description: newProduct.description,
        stock: parseInt(newProduct.stock) || 0,
        companyId: {
          _id: "670e4d25ca9fda8f1bf359b9",
          name: "GreenGlow Cosmetics",
          email: "contact@greenglowcosmetics.com",
          image: '',
        },
        date: Date.now(),
        status: 'approved', // Admin-added products are automatically approved
      };
      
      await addJob(product);
      
      setNewProduct({
        product: '',
        price: '',
        category: '',
        ingredients: '',
        usage: '',
        discount: '',
        description: '',
        stock: '',
      });
      setSuccessMessage('Product added successfully!');
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product: ' + err.message);
    }
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    try {
      // Always send password (default or as set by admin)
      const response = await fetch('http://localhost:4242/add-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeller),
      });
      const data = await response.json();
      if (response.ok) {
        setNewSeller({
          name: '', email: '', phone: '', address: '', businessName: '', businessType: '', password: 'seller123'
        });
        setSuccessMessage('Seller added successfully!');
        fetchSellers(); // Refresh sellers list
      } else {
        setError(data.error || 'Failed to add seller');
      }
    } catch (err) {
      console.error('Error adding seller:', err);
      setError('Failed to add seller: ' + err.message);
    }
  };

  const handleDeleteSeller = async (id) => {
    if (window.confirm('Are you sure you want to delete this seller?')) {
      try {
        const response = await fetch(`http://localhost:4242/delete-seller/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setSuccessMessage('Seller deleted successfully!');
          fetchSellers(); // Refresh sellers list
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to delete seller');
        }
      } catch (err) {
        console.error('Error deleting seller:', err);
        setError('Failed to delete seller: ' + err.message);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4242/update-order-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setSuccessMessage('Order status updated successfully!');
        fetchOrders(); // Refresh orders list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteJob(id);
        setSuccessMessage('Product deleted successfully!');
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product: ' + err.message);
      }
    }
  };
  
  const handleApproveProduct = async (id) => {
    try {
      setError(null);
      setSuccessMessage('');
      
      const result = await approveProduct(id);
      
      if (result.success) {
        setSuccessMessage('Product approved successfully!');
        fetchJobs(); // Refresh the product list
      } else {
        setError(result.error || 'Failed to approve product');
      }
    } catch (err) {
      console.error('Error approving product:', err);
      setError('Failed to approve product: ' + err.message);
    }
  };

  const jobsArray = Array.isArray(jobs) ? jobs : [];

  const totalProducts = jobsArray.length;
  const totalSales = jobsArray.reduce((sum, job) => sum + ((job.price || 0) * (job.stock || 1)), 0);
  const lowStockProducts = jobsArray.filter((job) => (job.stock || 0) < 5).length;
  const outOfStockProducts = jobsArray.filter((job) => (job.stock || 0) === 0).length;

  const chartData = {
    labels: jobsArray.length > 0 ? jobsArray.map((job) => job.product || 'Unnamed Product') : ['No Data'],
    datasets: [
      {
        label: 'Estimated Sales (Rs)',
        data: jobsArray.length > 0 ? jobsArray.map((job) => (job.price || 0) * (job.stock || 1)) : [0],
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Used for point background
        borderColor: 'rgba(75, 192, 192, 1)', // Line color
        borderWidth: 2, // Adjusted for line thickness
        fill: false, // No fill under the line
        tension: 0.4, // Smooths the line
        pointRadius: 5, // Size of data points
        pointHoverRadius: 8, // Size of points on hover
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Product Sales Analytics' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Sales ($)' } },
      x: { title: { display: true, text: 'Products' } },
    },
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-700 text-white p-6 fixed h-full shadow-xl">
        <h2 className="text-3xl font-extrabold mb-10 tracking-wide text-center">GreenGlow Cosmetics</h2>
        <ul className="space-y-4">
          <li>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`block w-full text-left p-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white scale-105' : 'hover:bg-blue-500 hover:text-white bg-blue-800/60'}`}
            >
              <span className="mr-2">📊</span> Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('sellers')} 
              className={`block w-full text-left p-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-sm ${activeTab === 'sellers' ? 'bg-blue-600 text-white scale-105' : 'hover:bg-blue-500 hover:text-white bg-blue-800/60'}`}
            >
              <span className="mr-2">🧑‍💼</span> Manage Sellers
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('pending')} 
              className={`block w-full text-left p-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-sm ${activeTab === 'pending' ? 'bg-blue-600 text-white scale-105' : 'hover:bg-blue-500 hover:text-white bg-blue-800/60'}`}
            >
              <span className="mr-2">⏳</span> Pending Approvals
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('/admin-orders')} 
              className={`block w-full text-left p-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-sm hover:bg-blue-500 hover:text-white bg-blue-800/60`}
            >
              <span className="mr-2">🛒</span> Manage Orders
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('customers')} 
              className={`block w-full text-left p-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-sm ${activeTab === 'customers' ? 'bg-blue-600 text-white scale-105' : 'hover:bg-blue-500 hover:text-white bg-blue-800/60'}`}
            >
              <span className="mr-2">👥</span> Customers
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('add')} 
              className={`block w-full text-left p-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-sm ${activeTab === 'add' ? 'bg-blue-600 text-white scale-105' : 'hover:bg-blue-500 hover:text-white bg-blue-800/60'}`}
            >
              <span className="mr-2">➕</span> Add Product
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('manage')} 
              className={`block w-full text-left p-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-sm ${activeTab === 'manage' ? 'bg-blue-600 text-white scale-105' : 'hover:bg-blue-500 hover:text-white bg-blue-800/60'}`}
            >
              <span className="mr-2">🗂️</span> Manage Products
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`block w-full text-left p-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-sm ${activeTab === 'analytics' ? 'bg-blue-600 text-white scale-105' : 'hover:bg-blue-500 hover:text-white bg-blue-800/60'}`}
            >
              <span className="mr-2">📈</span> Analytics
            </button>
          </li>
        </ul>
        {/* Logout Button */}
        <div className="mt-10 pt-6 border-t border-blue-400">
          <button 
            onClick={handleLogout}
            className="w-full text-left p-3 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all duration-200 mt-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 ml-64 p-8">
        {/* Header with greeting and logout */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {userRole === 'admin' && user && user.firstName
              ? `Hello ${user.firstName}`
              : 'Admin Dashboard'}
          </h2>
          {/* <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button> */}
        </div>
        
        {/* Seller Management */}
        {activeTab === 'sellers' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Manage Sellers</h3>
            {/* Add Seller Form */}
            <form onSubmit={handleAddSeller} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-gray-700">Name</label>
                <input type="text" name="name" value={newSeller.name} onChange={handleSellerInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input type="email" name="email" value={newSeller.email} onChange={handleSellerInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-700">Phone</label>
                <input type="tel" name="phone" value={newSeller.phone} onChange={handleSellerInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700">Business Name</label>
                <input type="text" name="businessName" value={newSeller.businessName} onChange={handleSellerInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-700">Business Type</label>
                <input type="text" name="businessType" value={newSeller.businessType} onChange={handleSellerInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700">Password (set by admin)</label>
                <input type="text" name="password" value={newSeller.password} onChange={handleSellerInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700">Address</label>
                <textarea name="address" value={newSeller.address} onChange={handleSellerInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200">Add Seller</button>
              </div>
            </form>
            {/* Sellers List */}
            <div className="bg-white rounded-lg shadow-md">
              {sellers.length === 0 ? (
                <p className="text-gray-600">No sellers found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3">S.No</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Business Name</th>
                        <th className="p-3">Business Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date Added</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((seller, idx) => (
                        <tr key={seller._id} className="border-b">
                          <td className="p-3">{idx + 1}</td>
                          <td className="p-3">{seller.name}</td>
                          <td className="p-3">{seller.email}</td>
                          <td className="p-3">{seller.businessName}</td>
                          <td className="p-3">{seller.businessType || 'N/A'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              seller.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {seller.status}
                            </span>
                          </td>
                          <td className="p-3">{new Date(seller.dateAdded).toLocaleDateString()}</td>
                          <td className="p-3">
                            <button 
                              onClick={() => handleDeleteSeller(seller._id)} 
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Customers Management */}
        {activeTab === 'customers' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Customer Management</h3>
            {customers.length === 0 ? (
              <p className="text-gray-600">No customers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3">S.No</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Registration Date</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer, idx) => {
                      // Find orders for this customer
                      const customerOrders = orders.filter(
                        order => order.customerInfo?.email === customer.email
                      );
                      
                      return (
                        <tr key={customer._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{idx + 1}</td>
                          <td className="p-3 font-medium">{customer.name || 'N/A'}</td>
                          <td className="p-3">{customer.email}</td>
                          <td className="p-3">
                            {customer.createdAt 
                              ? new Date(customer.createdAt).toLocaleDateString() 
                              : 'N/A'}
                          </td>
                          <td className="p-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {customerOrders.length}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="p-3">
                            <button 
                              onClick={() => {
                                setSelectedCustomer({
                                  ...customer,
                                  orders: customerOrders
                                });
                                setShowCustomerModal(true);
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200 mr-2"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Order Management</h3>
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Payment Status</th>
                      <th className="p-3">Order Date</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{order._id.slice(-8)}</td>
                        <td className="p-3 font-medium">{order.customerInfo?.name || 'N/A'}</td>
                        <td className="p-3">₹{order.totalAmount?.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="p-3 flex items-center">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="text-sm border rounded px-2 py-1 mr-2"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Add Product Form */}
        {activeTab === 'add' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Product Name</label>
                <input type="text" name="product" value={newProduct.product} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-700">Price (Rs)</label>
                <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" step="0.01" required />
              </div>
              <div>
                <label className="block text-gray-700">Category</label>
                <input type="text" name="category" value={newProduct.category} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-700">Ingredients</label>
                <input type="text" name="ingredients" value={newProduct.ingredients} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-700">Usage</label>
                <input type="text" name="usage" value={newProduct.usage} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-gray-700">Discount (% off)</label>
                <input type="text" name="discount" value={newProduct.discount} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 10% off" />
              </div>
              <div>
                <label className="block text-gray-700">Stock</label>
                <input type="number" name="stock" value={newProduct.stock} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700">Description</label>
                <textarea name="description" value={newProduct.description} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" required />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200">Add Product</button>
              </div>
            </form>
          </section>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Sales Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg"><h4 className="text-gray-600">Total Products</h4><p className="text-2xl font-bold">{totalProducts}</p></div>
              <div className="p-4 bg-green-50 rounded-lg"><h4 className="text-gray-600">Total Sales (Estimated)</h4><p className="text-2xl font-bold">₹{totalSales ? totalSales.toLocaleString() : '0'}</p></div>
              <div className="p-4 bg-yellow-50 rounded-lg"><h4 className="text-gray-600">Low Stock Products</h4><p className="text-2xl font-bold">{lowStockProducts}</p></div>
              <div className="p-4 bg-red-50 rounded-lg"><h4 className="text-gray-600">Out of Stock Products</h4><p className="text-2xl font-bold">{outOfStockProducts}</p></div>
            </div>
            <div className="h-96">
              {jobsArray.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p className="text-gray-600 text-center">No data available to display chart.</p>}
            </div>
          </section>
        )}

        {/* Manage Products */}
        {activeTab === 'manage' && (
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Manage Products</h3>
            {jobsArray.length === 0 ? (
              <p className="text-gray-600">No products available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3">S.No</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price (Rs)</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsArray.filter(job => !job.deleted).map((job, idx) => (
                      <tr key={job._id || job.id} className="border-b">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3">{job.product || 'N/A'}</td>
                        <td className="p-3">{job.category || 'N/A'}</td>
                        <td className="p-3">Rs.{Number(job.price || 0).toFixed(2)}</td>
                        <td className="p-3">{job.discount || 'None'}</td>
                        <td className="p-3">{job.stock || 0}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            job.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status === 'approved' ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => handleDeleteProduct(job._id || job.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Manage Sellers */}
        {activeTab === 'sellers' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Manage Sellers</h3>
            
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-4 text-gray-700">Add New Seller</h4>
              <form onSubmit={handleAddSeller} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newSeller.name} 
                    onChange={handleSellerInputChange} 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={newSeller.email} 
                    onChange={handleSellerInputChange} 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={newSeller.phone} 
                    onChange={handleSellerInputChange} 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Business Name</label>
                  <input 
                    type="text" 
                    name="businessName" 
                    value={newSeller.businessName} 
                    onChange={handleSellerInputChange} 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Business Type</label>
                  <input 
                    type="text" 
                    name="businessType" 
                    value={newSeller.businessType} 
                    onChange={handleSellerInputChange} 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Password</label>
                  <input 
                    type="text" 
                    name="password" 
                    value={newSeller.password} 
                    onChange={handleSellerInputChange} 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700">Address</label>
                  <textarea 
                    name="address" 
                    value={newSeller.address} 
                    onChange={handleSellerInputChange} 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    rows="2"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="submit" 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                  >
                    Add Seller
                  </button>
                </div>
              </form>
            </div>
            
            <h4 className="text-lg font-medium mb-4 text-gray-700">Seller List</h4>
            {sellers.length === 0 ? (
              <p className="text-gray-600">No sellers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3">S.No</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Business Name</th>
                      <th className="p-3">Business Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map((seller, idx) => (
                      <tr key={seller._id} className="border-b">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3">{seller.name}</td>
                        <td className="p-3">{seller.email}</td>
                        <td className="p-3">{seller.businessName}</td>
                        <td className="p-3">{seller.businessType}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            seller.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {seller.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => handleDeleteSeller(seller._id)} 
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Pending Approvals */}
        {activeTab === 'pending' && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Pending Product Approvals</h3>
            {pendingProducts.length === 0 ? (
              <p className="text-gray-600">No pending products for approval.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3">S.No</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price (Rs)</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Seller</th>
                      <th className="p-3">Date Added</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProducts.map((job, idx) => (
                      <tr key={job._id || job.id} className="border-b">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3">{job.product || 'N/A'}</td>
                        <td className="p-3">{job.category || 'N/A'}</td>
                        <td className="p-3">Rs.{Number(job.price || 0).toFixed(2)}</td>
                        <td className="p-3">{job.discount || 'None'}</td>
                        <td className="p-3">{job.stock || 0}</td>
                        <td className="p-3">{job.companyId?.name || 'N/A'}</td>
                        <td className="p-3">{job.date ? new Date(job.date).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3 flex gap-2">
                          <button onClick={() => handleApproveProduct(job._id || job.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200">Approve</button>
                          <button onClick={() => handleDeleteProduct(job._id || job.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-700">Order Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                    <p className="mb-2"><span className="font-medium">Date:</span> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                    <p className="mb-2">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Payment Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </p>
                    <p className="mb-2"><span className="font-medium">Total Amount:</span> ₹{selectedOrder.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-700">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><span className="font-medium">Name:</span> {selectedOrder.customerInfo?.name || 'N/A'}</p>
                    <p className="mb-2"><span className="font-medium">Email:</span> {selectedOrder.customerInfo?.email || 'N/A'}</p>
                    <p className="mb-2"><span className="font-medium">Phone:</span> {selectedOrder.customerInfo?.phone || 'N/A'}</p>
                  </div>

                  <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-700">Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                    <p>{selectedOrder.shippingAddress?.city || 'N/A'}, {selectedOrder.shippingAddress?.state || 'N/A'} {selectedOrder.shippingAddress?.zip || 'N/A'}</p>
                    <p>{selectedOrder.shippingAddress?.country || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold mb-2 text-gray-700">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3">Product</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">
                          <div className="flex items-center">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded mr-3" />
                            )}
                            <div>
                              <p className="font-medium">{item.name || item.product}</p>
                              {item.category && <p className="text-sm text-gray-500">{item.category}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">₹{item.price?.toLocaleString()}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3">₹{(item.price * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="p-3 text-right font-semibold">Total:</td>
                      <td className="p-3 font-bold">₹{selectedOrder.totalAmount?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    // Implement print functionality
                    window.print();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Customer Details</h3>
                <button 
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2"><span className="font-medium">Name:</span> {selectedCustomer.name || 'N/A'}</p>
                    <p className="mb-2"><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                    <p className="mb-2"><span className="font-medium">Registration Date:</span> {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="mb-2"><span className="font-medium">Total Orders:</span> {selectedCustomer.orders?.length || 0}</p>
                    <p className="mb-2">
                      <span className="font-medium">Status:</span> 
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold mb-2 text-gray-700">Order History</h4>
              {selectedCustomer.orders?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orders.map((order) => (
                        <tr key={order._id} className="border-b">
                          <td className="p-3 font-mono text-sm">{order._id.slice(-8)}</td>
                          <td className="p-3">{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td className="p-3">₹{order.totalAmount?.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button 
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowCustomerModal(false);
                                setShowOrderModal(true);
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200"
                            >
                              View Order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No orders found for this customer.</p>
              )}

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowCustomerModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
