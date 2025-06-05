import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const RecruiterLogin = ({ loginType = 'admin' }) => {
  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserRole, setUser, setShowRecruiterLogin } = useContext(AppContext);

  // Admin Credentials
  const ADMIN_USERNAME = 'sarvam';
  const ADMIN_PASSWORD = 'sarvam@2025';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      if (loginType === 'admin') {
        setUserRole('admin');
      } else {
        setUserRole('seller');
      }
      // Close the login modal
      setShowRecruiterLogin(false);
      // Navigate to appropriate dashboard
      navigate(loginType === 'admin' ? '/admin' : '/seller');
    }
  }, [isLoggedIn, navigate, loginType, setUserRole, setShowRecruiterLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (loginType === 'admin') {
        if (name === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          setIsLoggedIn(true);
          setUser({ firstName: 'Admin', lastName: '', role: 'admin' });
        } else {
          setError('Invalid Admin Credentials!');
        }
      } else if (loginType === 'seller') {
        // Seller login: check with backend
        const response = await fetch('http://localhost:4242/seller-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: name, password }),
        });
        const data = await response.json();
        if (response.ok) {
          setIsLoggedIn(true);
          setUser(data.seller); // Store seller info in context
        } else {
          setError(data.error || 'Invalid Seller Credentials!');
        }
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowRecruiterLogin(false);
    setError('');
    setName('');
    setPassword('');
  };

  return (
    <form
      className="relative bg-white p-10 rounded-xl text-slate-500 w-96 shadow-2xl"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close login form"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <h1 className="text-center text-2xl text-neutral-700 font-medium mb-2">
        {loginType === 'admin' ? 'Admin' : 'Seller'} {state}
      </h1>
      <p className="text-sm text-center mb-6">Welcome back! Please sign in to continue</p>
      
      <div className="border px-4 py-3 flex items-center gap-3 rounded-lg mt-5 focus-within:border-blue-500 transition-colors">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <input
          className="outline-none text-sm w-full"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={loginType === 'admin' ? 'Admin username' : 'Seller email'}
          required
          autoComplete="username"
        />
      </div>
      
      <div className="border px-4 py-3 flex items-center gap-3 rounded-lg mt-4 focus-within:border-blue-500 transition-colors">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <input
          className="outline-none text-sm w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete="current-password"
        />
      </div>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      <button
        type="submit"
        className="bg-blue-600 mt-5 w-full text-white py-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        {loginType === 'admin' ? (
          <p className="text-xs text-gray-600 text-center">
            <strong>Admin credentials:</strong><br />
            Username: sarvam<br />
            Password: sarvam@2025
          </p>
        ) : (
          <p className="text-xs text-gray-600 text-center">
            <strong>Seller Login:</strong><br />
            Use your registered email and password provided by admin
          </p>
        )}
      </div>
    </form>
  );
};

export default RecruiterLogin;