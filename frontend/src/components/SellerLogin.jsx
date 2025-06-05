import React, { useEffect, useState } from 'react';
import man from '../assets/person_icon.svg';
import lock from '../assets/lock_icon.svg';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const SellerLogin = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { setUserRole } = useContext(AppContext);

  const SELLER_USERNAME = 'seller';
  const SELLER_PASSWORD = 'seller@2025';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setUserRole('seller');
      navigate('/seller');
    }
  }, [isLoggedIn, navigate, setUserRole]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !password) {
      setError('Please enter both username and password');
      return;
    }
    if (name === SELLER_USERNAME && password === SELLER_PASSWORD) {
      setError('');
      setIsLoggedIn(true);
    } else {
      setError('Invalid Seller Credentials!');
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <form
        className="relative bg-white p-10 rounded-xl text-slate-500"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl text-neutral-700 font-medium">
          Seller Login
        </h1>
        <p className="text-sm">Welcome back! Please sign in to continue</p>
        <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
          <img src={man} alt="username icon" />
          <input
            className="outline-none text-sm"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seller username"
            required
          />
        </div>
        <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
          <img src={lock} alt="password icon" />
          <input
            className="outline-none text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 mt-3 w-full text-white py-2 rounded-full"
        >
          Login
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Use seller / seller@2025 to login
        </p>
      </form>
    </div>
  );
};

export default SellerLogin;