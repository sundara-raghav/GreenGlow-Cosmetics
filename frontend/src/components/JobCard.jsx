// src/components/JobCard.jsx
import React from 'react';
import logo from '../assets/logo.jpg'
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  return (
    <div className="p-6 shadow rounded">
      <div className="flex justify-between items-center">
        <img className="h-10" src={logo} alt="" />
      </div>
      <h4 className="font-medium text-xl mt-2">{job.product}</h4>
      <div className="flex items-center gap-3 mt-2 text-xs">
        <span className="bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">Rs.{job.price}</span>
        <span className="bg-red-50 border border-red-200 px-4 py-1.5 rounded">{job.discount}%</span>
      </div>
      <p className="text-grey-500 text-sm mt-4">{job.usage}</p>
      <div className="mt-4 flex gap-4 text-sm">
        <button onClick={() => { navigate(`/apply-job/${job.id}`); scrollTo(0, 0); }} className="bg-blue-600 text-white px-4 py-2 rounded">Buy Now</button>
        <button onClick={() => { navigate(`/apply-job/${job.id}`); scrollTo(0, 0); }} className="text-gray-500 border border-gray-500 rounded px-4 py-2">Learn More</button>
      </div>
    </div>
  );
};

export default JobCard;