import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { userRole, loggedInUser } = useContext(AppContext);

  useEffect(() => {
    // Redirect if not admin
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Header */}
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a href="/admin" className="text-xl font-bold">GreenGlow Cosmetics Admin</a>
              
              <div className="hidden md:flex space-x-4 ml-6">
                <a href="/admin" className="hover:text-blue-200 transition-colors">Dashboard</a>
                <a href="/admin-orders" className="hover:text-blue-200 transition-colors">Orders</a>
                <a href="/" className="hover:text-blue-200 transition-colors">View Store</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {loggedInUser ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden md:inline">
                    Welcome, {loggedInUser.name || 'Admin'}
                  </span>
                </div>
              ) : (
                <span>Admin Panel</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2024 GreenGlow Cosmetics Admin Panel. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;