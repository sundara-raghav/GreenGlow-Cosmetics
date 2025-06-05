// src/components/JobCard.jsx
import React, { useContext, useState } from 'react';
import logo from '../assets/logo.jpg'
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Import Navbar as default
import { CartContext } from '../context/CartContext';
import { AppContext } from '../context/AppContext';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user: contextUser, loggedInUser } = useContext(AppContext);
  const [added, setAdded] = useState(false);

  // Determine if user is signed in - check both loggedInUser and contextUser
  const isLoggedIn = !!loggedInUser || (contextUser && contextUser.email);
  
  // Debug login state
  console.log('JobCard - Login state:', { isLoggedIn, loggedInUser, contextUser });

  const handleAction = () => {
    if (!isLoggedIn) {
      navigate('/customer-login');
    } else {
      // Navigate to product detail page
      navigate(`/apply-job/${job._id || job.id}`);
      scrollTo(0, 0);
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      navigate('/customer-login');
      return;
    }
    // Add to cart and go directly to checkout
    addToCart(job);
    navigate('/cart');
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/customer-login');
      return;
    }
    addToCart(job);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="p-6 shadow rounded">
      <div className="flex justify-between items-center">
        <img className="h-24 w-24 object-cover rounded border" src={job.image || logo} alt={job.product} />
      </div>
      <h4 className="font-medium text-xl mt-2">{job.product}</h4>
      <div className="flex items-center gap-3 mt-2 text-xs">
        <span className="bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">Rs.{job.price}</span>
        <span className="bg-red-50 border border-red-200 px-4 py-1.5 rounded">{job.discount}%</span>
      </div>
      <p className="text-grey-500 text-sm mt-4">{job.usage}</p>
      <div className="mt-4 flex gap-2 text-sm flex-wrap">
        {isLoggedIn ? (
          <>
            <button 
              onClick={handleBuyNow} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex-1"
            >
              Buy Now
            </button>
            <button 
              onClick={handleAddToCart} 
              className={`${added ? 'bg-green-700' : 'bg-green-600'} text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex-1 flex items-center justify-center`}
            >
              {added ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
            <button 
              onClick={handleAction} 
              className="text-gray-700 border border-gray-400 rounded px-4 py-2 hover:bg-gray-100 transition-colors w-full mt-2"
            >
              View Details
            </button>
          </>
        ) : (
          <button 
            onClick={() => navigate('/customer-login')} 
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors w-full"
          >
            Sign in to Buy
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;