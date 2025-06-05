import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaPlusCircle, FaBoxOpen, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logo.jpg';

// Register the components needed for a line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SellerDashboard = () => {
  const { jobs, addJob, deleteJob, fetchJobs, userRole, setUserRole, user, setUser, setShowRecruiterLogin } = useContext(AppContext);
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState({
    product: '',
    price: '',
    category: '',
    ingredients: '',
    usage: '',
    discount: '',
    description: '',
    stock: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Set user role to seller when component mounts
  useEffect(() => {
    setUserRole('seller');
    fetchJobs();
  }, [setUserRole, fetchJobs]);

  // Logout function
  const handleLogout = () => {
    setUser(null);
    setUserRole('client');
    setShowRecruiterLogin(false);
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    try {
      const product = {
        product: newProduct.product,
        price: parseFloat(newProduct.price) || 0,
        category: newProduct.category,
        ingredients: newProduct.ingredients,
        usage: newProduct.usage,
        discount: newProduct.discount || '0% off',
        description: newProduct.description,
        stock: parseInt(newProduct.stock) || 0,
        image: image || '', // Add image to product object
        companyId: {
          _id: "670e4d25ca9fda8f1bf359b9",
          name: "Sarvam",
          email: "sarvam@demo.com",
          image: '',
        },
        date: Date.now(),
        status: 'pending', // Products added by sellers are pending by default
      };
      const result = await addJob(product);
      if (result.success) {
        setNewProduct({
          product: '', price: '', category: '', ingredients: '', usage: '', discount: '', description: '', stock: '',
        });
        setImage(null);
        setSuccessMessage('Product added successfully! Waiting for admin approval.');
      } else {
        setError(result.error || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const result = await deleteJob(id);
        
        if (result.success) {
          setSuccessMessage('Product deleted successfully!');
        } else {
          setError(result.error || 'Failed to delete product');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product: ' + err.message);
      }
    }
  };

  const jobsArray = Array.isArray(jobs) ? jobs : [];

  const totalProducts = jobsArray.length;
  const pendingProducts = jobsArray.filter(job => job.status === 'pending').length;
  const approvedProducts = jobsArray.filter(job => job.status === 'approved').length;
  const totalSales = jobsArray
    .filter(job => job.status === 'approved')
    .reduce((sum, job) => sum + ((job.price || 0) * (job.stock || 1)), 0);

  const chartData = {
    labels: jobsArray.length > 0 ? jobsArray.map((job) => job.product || 'Unnamed Product') : ['No Data'],
    datasets: [
      {
        label: 'Product Stock',
        data: jobsArray.length > 0 ? jobsArray.map((job) => job.stock || 0) : [0],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Product Stock Levels' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Stock' } },
      x: { title: { display: true, text: 'Products' } },
    },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-700 via-blue-700 to-blue-900 text-white p-6 fixed h-full shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-10">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow" />
            <span className="text-2xl font-extrabold tracking-wide">GreenGlow Seller</span>
          </div>
          <ul className="space-y-2">
            <li>
              <a href="#dashboard" className="flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors group">
                <FaTachometerAlt className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#add-product" className="flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors group">
                <FaPlusCircle className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                <span>Add Product</span>
              </a>
            </li>
            <li>
              <a href="#manage-products" className="flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors group">
                <FaBoxOpen className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                <span>Manage Products</span>
              </a>
            </li>
            <li>
              <a href="#analytics" className="flex items-center p-3 rounded-lg hover:bg-purple-600 transition-colors group">
                <FaChartLine className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                <span>Analytics</span>
              </a>
            </li>
          </ul>
        </div>
        {/* Logout Button */}
        <div className="pt-6 border-t border-purple-400">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg text-white font-semibold shadow transition-colors"
          >
            <FaSignOutAlt className="mr-2 text-lg" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header with greeting and logout */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 drop-shadow-sm">
            {user && user.firstName ? `Hello Seller ${user.firstName}` : 'Seller Dashboard'}
          </h2>
          {/* <button 
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors font-semibold flex items-center shadow"
          >
            <FaSignOutAlt className="mr-2 text-lg" />
            Logout
          </button> */}
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>}

        <section id="dashboard" className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Dashboard Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-gray-600">Total Products</h4>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="text-gray-600">Pending Approval</h4>
              <p className="text-2xl font-bold">{pendingProducts}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-gray-600">Approved Products</h4>
              <p className="text-2xl font-bold">{approvedProducts}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="text-gray-600">Potential Sales</h4>
              <p className="text-2xl font-bold">₹{totalSales.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <section id="add-product" className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h3>
          <p className="text-gray-600 mb-4">Products will be reviewed by an admin before appearing on the site.</p>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Product Name</label>
              <input type="text" name="product" value={newProduct.product} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-gray-700">Price (Rs)</label>
              <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block text-gray-700">Category</label>
              <input type="text" name="category" value={newProduct.category} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-gray-700">Ingredients</label>
              <input type="text" name="ingredients" value={newProduct.ingredients} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-gray-700">Usage</label>
              <input type="text" name="usage" value={newProduct.usage} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-gray-700">Discount (% off)</label>
              <input type="text" name="discount" value={newProduct.discount} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 10% off" />
            </div>
            <div>
              <label className="block text-gray-700">Stock</label>
              <input type="number" name="stock" value={newProduct.stock} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" required />
            </div>
            <div>
              <label className="block text-gray-700">Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {image && (
                <img src={image} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded border" />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700">Description</label>
              <textarea name="description" value={newProduct.description} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" required />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200">Submit for Approval</button>
            </div>
          </form>
        </section>

        <section id="analytics" className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Product Analytics</h3>
          <div className="h-96">
            {jobsArray.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p className="text-gray-600 text-center">No data available to display chart.</p>}
          </div>
        </section>

        <section id="manage-products" className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Manage Products</h3>
          {jobsArray.length === 0 ? (
            <p className="text-gray-600">No products available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3">S.No</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (Rs)</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsArray.filter(job => !job.deleted).map((job, idx) => (
                    <tr key={job._id || job.id} className="border-b">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3">{job.product || 'N/A'}</td>
                      <td className="p-3">{job.category || 'N/A'}</td>
                      <td className="p-3">Rs.{Number(job.price || 0).toFixed(2)}</td>
                      <td className="p-3">{job.stock || 0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          job.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.status === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleDeleteProduct(job._id || job.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerDashboard;