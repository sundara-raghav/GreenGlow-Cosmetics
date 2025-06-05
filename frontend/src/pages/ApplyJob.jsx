import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { CartContext } from '../context/CartContext';
import Loading from '../components/Loading';
import JobCard from '../components/JobCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import money from '../assets/money_icon.svg';
import man from '../assets/person_icon.svg';
import suitcase from '../assets/suitcase_icon.svg';
import logo from '../assets/logo.jpg';
import moment from 'moment';

// Rating component to display stars
const StarRating = ({ rating }) => {
  const maxStars = 5;
  const filledStars = Math.round(rating); // Round to nearest integer for simplicity

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${
            index < filledStars ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      <span className="ml-2 text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
};

const ApplyJob = () => {
  const { id } = useParams();
  const [jobData, setJobData] = useState(null);
  const { jobs, user: contextUser, loggedInUser } = useContext(AppContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Determine if user is signed in as customer (role 'client')
  const isCustomer = (contextUser && contextUser.role === 'client' && contextUser.email);

  const fetchJob = () => {
    // Support both MongoDB _id and legacy id
    const data = jobs.filter((job) => (job.id === id || job._id === id));
    if (data.length !== 0) {
      setJobData(data[0]);
      // console.log(data[0]);
    }
  };

  useEffect(() => {
    if (jobs.length > 0) {
      fetchJob();
    }
  }, [id, jobs]);

  const handleBuyNow = () => {
    if (!loggedInUser) {
      navigate('/customer-login');
      return;
    }
    addToCart(jobData);
    navigate('/cart');
  };

  return jobData ? (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto">
        <div className="bg-white text-black rounded-lg w-full">
          <div className="flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl">
            <div className="flex flex-col md:flex-row items-center">
              <img
                className="w-40 h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4"
                src={logo}
                width={80}
                height={80}
                alt=""
              />
              <div className="ml-7 text-center md:text-left text-neutral-700">
                <h1 className="text-2xl sm:text-4xl font-medium">{jobData.product}</h1>
                <div className="flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2">
                  <span className="flex items-center gap-1">
                    <img src={suitcase} alt="" />
                    {jobData.companyId.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={money} alt="" />
                    {jobData.price}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={man} alt="" />
                    {jobData.discount}
                  </span>
                </div>
                {/* Add Rating Display */}
                <div className="mt-2">
                  <StarRating rating={jobData.rating || 4.2} /> {/* Fallback rating if not provided */}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center">
              <button
                className={`bg-blue-600 p-2.5 px-10 text-white rounded ${!loggedInUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleBuyNow}
                disabled={!loggedInUser}
              >
                Buy Now
              </button>
              <p className="mt-1 text-gray-600">Posted {moment(jobData.date).fromNow()}</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start">
            <div className="w-full lg:w-2/3">
              <h2 className="font-bold text-2xl mb-4">Product description</h2>
              <div className="rich-text" dangerouslySetInnerHTML={{ __html: jobData.description }}></div>
              <button
                className="bg-blue-600 p-2.5 px-10 text-white rounded mt-10"
                onClick={() => addToCart(jobData)}
              >
                Add Cart
              </button>
            </div>
            <div className="w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5">
              <h2>More Products from {jobData.companyId.name}</h2>
              {jobs
                .filter((job) => (job.id !== jobData.id && job._id !== jobData._id) && ((job.companyId && (job.companyId.id === jobData.companyId.id || job.companyId._id === jobData.companyId._id))))
                .slice(0, 4)
                .map((job, index) => (
                  <JobCard key={index} job={job} />
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default ApplyJob;