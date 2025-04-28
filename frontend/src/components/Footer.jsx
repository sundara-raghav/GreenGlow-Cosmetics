import React, { useState } from 'react';
import logo from '../assets/logo.jpg';
import { FaWhatsapp } from 'react-icons/fa';
import { FaInstagram } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (!email) {
      setError('Please enter an email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isChecked) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    try {
      // Example: Send data to an API
      const response = await fetch('https://api.example.com/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Thank you for subscribing!');
        setEmail('');
        setIsChecked(false);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="flex items-center bg-gradient-to-r from-blue-700 to-blue-950 h-70 w-full text-white">
      <img className="p-4 ml-30 h-30 w-50 rounded" src={logo} alt="Logo" />
      <div className="flex flex-col items-center justify-between p-10 ml-30">
        <p className="text-xl font-bold">Follow us on</p>
        <div className="flex items-center justify-center p-3">
          <FaWhatsapp />
          <p className="p-2">6347287890</p>
        </div>
        <div className="flex items-center justify-center p-3">
          <FaInstagram />
          <p className="p-2">Sarvam_Products</p>
        </div>
        <div className="flex items-center justify-center p-3">
          <IoMail />
          <p className="p-2">sarvam@ac.in</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center pl-15">
        <p className="text-xl font-bold">Address</p>
        <p className="p-2">Nanjanapuram</p>
        <p className="p-2">15, Long hills</p>
        <p className="p-2">Kolli hills-637411</p>
      </div>
      <div className="flex flex-col items-center justify-center p-15">
        <p className="font-bold text-xl p-5">Be the first person to get optimized order</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            className="border-0 border-b-2 border-gray-800 bg-transparent outline-none p-1 text-base w-52 focus:border-blue-500 placeholder:text-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex items-center justify-center p-3">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <p className="text-gray-400 pl-6">I agree to the terms and conditions</p>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}
          <button
            className="text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-400/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            type="submit"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Footer;