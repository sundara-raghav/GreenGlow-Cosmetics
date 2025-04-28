import React, { useEffect, useState } from 'react';
import man from '../assets/person_icon.svg';
import lock from '../assets/lock_icon.svg';
import { useNavigate } from 'react-router-dom';

const RecruiterLogin = () => {
  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const ADMIN_USERNAME = 'sarvam';
  const ADMIN_PASSWORD = 'sarvam@2025';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !password) {
      setError('Please enter both username and password');
      return;
    }
    if (name === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setError('');
      setIsLoggedIn(true); 
      navigate('/admin'); 
    } else {
      setError('Invalid Credentials! Only Admin can Login');
    }
  };

  
  if (isLoggedIn) {
    return null;
  }

  useEffect(()=>{
    document.body.style.overflow='hidden'
    return()=>{
         document.body.style.overflow='unset'
    }
  },[])
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <form
        className="relative bg-white p-10 rounded-xl text-slate-500"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl text-neutral-700 font-medium">
          Admin {state}
        </h1>
        <p className="text-sm">Welcome back! Please sign in to continue</p>
        <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
          <img src={man} alt="username icon" />
          <input
            className="outline-none text-sm"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="username"
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
          {state === 'Login' ? 'login' : 'create account'}
        </button>
      </form>
    </div>
  );
};

export default RecruiterLogin;