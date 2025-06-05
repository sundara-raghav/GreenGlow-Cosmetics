import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { loggedInUser, setLoggedInUser, userRole } = useContext(AppContext);

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-xl font-bold">GreenGlow Cosmetics Admin</Link>
            
            <div className="hidden md:flex space-x-4 ml-6">
              <Link to="/admin" className="hover:text-blue-200 transition-colors">Dashboard</Link>
              <Link to="/admin-orders" className="hover:text-blue-200 transition-colors">Orders</Link>
              <Link to="/" className="hover:text-blue-200 transition-colors">View Store</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {loggedInUser ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:inline">
                  Welcome, {loggedInUser.name || 'Admin'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;