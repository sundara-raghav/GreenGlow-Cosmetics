import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import cross from '../assets/cross_icon.svg';
import { ProductCategories, ProductPrice } from '../assets/assets';
import JobCard from './JobCard';
import left from '../assets/left_arrow_icon.svg';
import right from '../assets/right_arrow_icon.svg';
import axios from 'axios';
import { FaFilter, FaTags, FaMoneyBillWave, FaBoxOpen } from 'react-icons/fa';

const JobListing = () => {
  const { isSearched, searchFilter, setSearchFilter } = useContext(AppContext);
  const [showFilter, setShowFilter] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define price ranges for filtering
  const priceRanges = [
    { label: '0 - 50', min: 0, max: 50 },
    { label: '51 - 100', min: 51, max: 100 },
    { label: '101 - 150', min: 101, max: 150 },
    { label: '151 - 200', min: 151, max: 200 },
    { label: '201+', min: 201, max: Infinity },
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handlePriceRangeChange = (rangeLabel) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeLabel)
        ? prev.filter((r) => r !== rangeLabel)
        : [...prev, rangeLabel]
    );
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:4242/products');
        // Only show approved products to clients
        const approvedProducts = response.data.data.filter(product => product.status === 'approved');
        setJobs(approvedProducts || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Reset currentPage only if filters actually change the result set
  useEffect(() => {
    const jobsArray = Array.isArray(jobs) ? jobs : [];
    // Normalize category comparison for case and whitespace
    const matchesCategory = (job) => {
      if (selectedCategories.length === 0) return true;
      if (!job.category) return false;
      return selectedCategories.some(
        (cat) => cat.trim().toLowerCase() === job.category.trim().toLowerCase()
      );
    };
    const matchesPriceRange = (job) => {
      if (selectedPriceRanges.length === 0) return true;
      const price = Number(job.price);
      return selectedPriceRanges.some((rangeLabel) => {
        const range = priceRanges.find((r) => r.label === rangeLabel);
        return range && price >= range.min && price <= range.max;
      });
    };
    const matchesProduct = (job) =>
      searchFilter.product === '' || (job.product && job.product.toLowerCase().includes(searchFilter.product.toLowerCase()));

    const newFilteredJobs = jobsArray
      .slice()
      .reverse()
      .filter((job) => matchesCategory(job) && matchesProduct(job) && matchesPriceRange(job));
    setFilteredJobs(newFilteredJobs);
    // Only reset to page 1 if the filtered jobs length changes
    if (newFilteredJobs.length !== filteredJobs.length) {
      setCurrentPage(1);
    }
  }, [jobs, selectedCategories, selectedPriceRanges, searchFilter]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-1/4 bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 px-4 py-6 rounded-2xl shadow-xl mb-6 lg:mb-0 mr-0 lg:mr-8">
        <div className="flex items-center mb-6">
          <FaFilter className="text-purple-600 text-2xl mr-2" />
          <h3 className="font-bold text-xl text-gray-800">Filters</h3>
        </div>
        {isSearched && searchFilter.product !== '' && (
          <div className="mb-6">
            <h4 className="font-semibold text-md mb-2 flex items-center"><FaBoxOpen className="mr-2 text-blue-500" />Current Search</h4>
            <div className="text-gray-600">
              {searchFilter.product && (
                <span className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded shadow">
                  {searchFilter.product}
                  <img
                    onClick={() => setSearchFilter((prev) => ({ ...prev, product: '' }))}
                    className="cursor-pointer w-4 h-4"
                    src={cross}
                    alt=""
                  />
                </span>
              )}
            </div>
          </div>
        )}
        <button onClick={() => setShowFilter((prev) => !prev)} className="px-6 py-1.5 rounded border border-gray-400 lg:hidden font-semibold text-purple-700 mb-4">
          {showFilter ? 'Close' : 'Filters'}
        </button>
        <div className={showFilter ? '' : 'max-lg:hidden'}>
          <h4 className="font-semibold text-md py-4 flex items-center"><FaTags className="mr-2 text-pink-500" />Categories</h4>
          <ul className="space-y-3 text-gray-700">
            {ProductCategories.map((category, index) => (
              <li className="flex gap-3 items-center pt-2" key={index}>
                <input className="scale-125 accent-purple-600" type="checkbox" onChange={() => handleCategoryChange(category)} checked={selectedCategories.includes(category)} />
                <span className="font-medium">{category}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={showFilter ? '' : 'max-lg:hidden'}>
          <h4 className="font-semibold text-md py-4 pt-10 flex items-center"><FaMoneyBillWave className="mr-2 text-green-500" />Price Range</h4>
          <ul className="space-y-3 text-gray-700">
            {priceRanges.map((range, index) => (
              <li className="flex gap-3 items-center pt-2" key={index}>
                <input
                  className="scale-125 accent-green-600"
                  type="checkbox"
                  onChange={() => handlePriceRangeChange(range.label)}
                  checked={selectedPriceRanges.includes(range.label)}
                />
                <span className="font-medium">{range.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Product Listing */}
      <section className="w-full lg:w-3/4 text-gray-800 max-lg:px-4">
        <h3 className="font-extrabold text-3xl py-2 text-purple-800 drop-shadow-sm" id="product-list">Latest Products</h3>
        <p className="mb-8 text-gray-500">Get your desired products</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-lg py-12">
              No match / product found.
            </div>
          ) : (
            filteredJobs.slice((currentPage - 1) * 6, currentPage * 6).map((job, index) => (
              <div className="rounded-2xl shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300 border border-gray-100" key={job.id || job._id || index}>
                <JobCard job={job} />
              </div>
            ))
          )}
        </div>
        {filteredJobs.length > 0 && (
          <div className="flex items-center justify-center space-x-2 mt-10">
            <a href="#job-list">
              <img onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} src={left} alt="" className="w-8 h-8 hover:scale-110 transition-transform" />
            </a>
            {Array.from({ length: Math.ceil(filteredJobs.length / 6) }).map((_, index) => (
              <a href="#job-list" key={index}>
                <button
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full font-bold text-lg shadow ${currentPage === index + 1 ? 'bg-purple-200 text-purple-800' : 'text-gray-500 bg-white hover:bg-purple-50'}`}
                >
                  {index + 1}
                </button>
              </a>
            ))}
            <a href="#job-list">
              <img onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredJobs.length / 6)))} src={right} alt="" className="w-8 h-8 hover:scale-110 transition-transform" />
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default JobListing;