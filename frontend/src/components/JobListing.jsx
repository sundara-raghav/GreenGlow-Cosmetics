import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import cross from '../assets/cross_icon.svg';
import { ProductCategories, ProductPrice } from '../assets/assets';
import JobCard from './JobCard';
import left from '../assets/left_arrow_icon.svg';
import right from '../assets/right_arrow_icon.svg';

const JobListing = () => {
  const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);
  const [showFilter, setShowFilter] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState(jobs);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handlePriceChange = (price) => {
    setSelectedPrice((prev) =>
      prev.includes(price) ? prev.filter((c) => c !== price) : [...prev, price]
    );
  };

  useEffect(() => {
    const matchesCategory = (job) => selectedCategories.length === 0 || selectedCategories.includes(job.category);
    const matchesPrice = (job) => selectedPrice.length === 0 || selectedPrice.includes(String(job.price)); // Convert price to string
    const matchesProduct = (job) =>
      searchFilter.product === '' || job.product.toLowerCase().includes(searchFilter.product.toLowerCase());

    const newFilteredJobs = jobs
      .slice()
      .reverse()
      .filter((job) => matchesCategory(job) && matchesPrice(job) && matchesProduct(job));
    setFilteredJobs(newFilteredJobs);
    setCurrentPage(1);
  }, [jobs, selectedCategories, selectedPrice, searchFilter]);

  return (
    <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8">
      <div className="w-full lg:w-1/4 bg-white px-4">
        {isSearched && searchFilter.product !== '' && (
          <>
            <h3 className="font-medium text-lg mb-4">Current Search</h3>
            <div className="mb-4 text-gray-600">
              {searchFilter.product && (
                <span className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
                  {searchFilter.product}
                  <img
                    onClick={() => setSearchFilter((prev) => ({ ...prev, product: '' }))}
                    className="cursor-pointer"
                    src={cross}
                    alt=""
                  />
                </span>
              )}
            </div>
          </>
        )}
        <button onClick={() => setShowFilter((prev) => !prev)} className="px-6 py-1.5 rounded border border-gray-400 lg:hidden">
          {showFilter ? 'Close' : 'Filters'}
        </button>
        <div className={showFilter ? '' : 'max-lg:hidden'}>
          <h4 className="font-medium text-lg py-4">Search by Categories</h4>
          <ul className="space-y-4 text-gray-600">
            {ProductCategories.map((category, index) => (
              <li className="flex gap-3 items-center pt-3" key={index}>
                <input className="scale-125" type="checkbox" onChange={() => handleCategoryChange(category)} checked={selectedCategories.includes(category)} />
                {category}
              </li>
            ))}
          </ul>
        </div>
        <div className={showFilter ? '' : 'max-lg:hidden'}>
          <h4 className="font-medium text-lg py-4 pt-14">Search by Price</h4>
          <ul className="space-y-4 text-gray-600">
            {ProductPrice.map((price, index) => (
              <li className="flex gap-3 items-center pt-3" key={index}>
                <input className="scale-125" type="checkbox" onChange={() => handlePriceChange(price)} checked={selectedPrice.includes(price)} />
                {price}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <section className="w-full lg:w-3/4 text-gray-800 max-lg:px-4">
        <h3 className="font-medium text-3xl py-2" id="product-list">Latest Products</h3>
        <p className="mb-8">Get your desired products</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.slice((currentPage - 1) * 6, currentPage * 6).map((job, index) => (
            <JobCard key={job.id} job={job} /> // Use job.id
          ))}
        </div>
        {filteredJobs.length > 0 && (
          <div className="flex items-center justify-center space-x-2 mt-10">
            <a href="#job-list">
              <img onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} src={left} alt="" />
            </a>
            {Array.from({ length: Math.ceil(filteredJobs.length / 6) }).map((_, index) => (
              <a href="#job-list" key={index}>
                <button
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded ${currentPage === index + 1 ? 'bg-blue-100 text-blue-500' : 'text-gray-500'}`}
                >
                  {index + 1}
                </button>
              </a>
            ))}
            <a href="#job-list">
              <img onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredJobs.length / 6)))} src={right} alt="" />
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default JobListing;