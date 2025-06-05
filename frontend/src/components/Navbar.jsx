import React, { useContext } from 'react'
import logo from '../assets/logo.jpg'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { CartContext } from '../context/CartContext'

const Navbar = () => {
  const navigate = useNavigate();
  const { setShowRecruiterLogin, setUser, setUserRole, user: contextUser, loggedInUser, logout } = useContext(AppContext);
  const { cartItems } = useContext(CartContext);
  
  // Debug logged in user
  console.log('Navbar - loggedInUser:', loggedInUser);

  const handleCustomerLogin = () => {
    // TODO: Open custom customer sign-in/sign-up modal or page
    navigate('/customer-login');
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole('client');
    setShowRecruiterLogin(false);
    logout();
    navigate('/');
  };

  // Use context user if available, otherwise use Clerk user
  const currentUser = contextUser;

  return (
    <div className='shadow py-4 bg-white'>
      <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
        <img 
          onClick={() => navigate('/')} 
          src={logo} 
          className='w-50 h-20 cursor-pointer' 
          alt="GreenGlow Cosmetics Logo"
        />
        
        {(loggedInUser || (contextUser && contextUser.email)) ? (
          <div className='flex items-center gap-3'>
            <div className="flex flex-col items-end mr-2">
              <p className='font-medium text-gray-800'>
                Hello, {
                  (loggedInUser?.name || contextUser?.name || 
                   loggedInUser?.email?.split('@')[0] || 
                   contextUser?.email?.split('@')[0] || 
                   'Customer')
                }
              </p>
              <div className="flex space-x-4">
                <Link to="/cart" className="text-sm text-blue-600 hover:underline flex items-center">
                  My Cart 
                  {cartItems.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                <Link to="/my-orders" className="text-sm text-purple-600 hover:underline">
                  My Orders
                </Link>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className='flex gap-4 max-sm:text-xs items-center'>
            <button 
              onClick={handleCustomerLogin} 
              className='bg-green-500 text-white px-6 sm:px-9 py-2 rounded-full hover:bg-green-600 transition-colors font-medium'
            >
              Customer Login
            </button>
            <span className='text-gray-400'>|</span>
            <button 
              onClick={() => setShowRecruiterLogin(true)} 
              className='bg-blue-500 text-white px-6 sm:px-9 py-2 rounded-full hover:bg-blue-600 transition-colors font-medium'
            >
              Admin/Seller Login
            </button>  
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;