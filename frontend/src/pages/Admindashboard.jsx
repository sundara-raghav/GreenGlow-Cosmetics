import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Line } from 'react-chartjs-2'; // Changed from Bar to Line
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'; // Updated imports

// Register the components needed for a line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { jobs, addJob, deleteJob } = useContext(AppContext);
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
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const job = {
        product: newProduct.product,
        price: parseFloat(newProduct.price) || 0,
        category: newProduct.category,
        ingredients: newProduct.ingredients,
        usage: newProduct.usage,
        discount: newProduct.discount || '0% off',
        description: newProduct.description,
        stock: parseInt(newProduct.stock) || 0,
        companyId: {
          _id: "670e4d25ca9fda8f1bf359b9",
          name: "Sarvam",
          email: "sarvam@demo.com",
          image: '',
        },
        date: Date.now(),
      };
      console.log('Adding job:', job);
      await addJob(job);
      setNewProduct({
        product: '',
        price: '',
        category: '',
        ingredients: '',
        usage: '',
        discount: '',
        description: '',
        stock: '',
      });
      alert('Product added successfully!');
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteJob(id);
        alert('Product deleted successfully!');
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product: ' + err.message);
      }
    }
  };

  const totalProducts = jobs.length;
  const totalSales = jobs.reduce((sum, job) => sum + (job.price * (job.stock || 1)), 0);
  const lowStockProducts = jobs.filter((job) => job.stock < 5).length;
  const outOfStockProducts = jobs.filter((job) => job.stock === 0).length;

  const chartData = {
    labels: jobs.length > 0 ? jobs.map((job) => job.product) : ['No Data'],
    datasets: [
      {
        label: 'Estimated Sales (Rs)',
        data: jobs.length > 0 ? jobs.map((job) => job.price * (job.stock || 1)) : [0],
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Used for point background
        borderColor: 'rgba(75, 192, 192, 1)', // Line color
        borderWidth: 2, // Adjusted for line thickness
        fill: false, // No fill under the line
        tension: 0.4, // Smooths the line
        pointRadius: 5, // Size of data points
        pointHoverRadius: 8, // Size of points on hover
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Product Sales Analytics' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Sales ($)' } },
      x: { title: { display: true, text: 'Products' } },
    },
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-gray-800 text-white p-6 fixed h-full">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <ul className="space-y-4">
          <li><a href="#dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</a></li>
          <li><a href="#add-product" className="block p-2 hover:bg-gray-700 rounded">Add Product</a></li>
          <li><a href="#manage-products" className="block p-2 hover:bg-gray-700 rounded">Manage Products</a></li>
          <li><a href="#analytics" className="block p-2 hover:bg-gray-700 rounded">Analytics</a></li>
        </ul>
      </div>

      <div className="flex-1 ml-64 p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <section id="add-product" className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h3>
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
            <div className="md:col-span-2">
              <label className="block text-gray-700">Description</label>
              <textarea name="description" value={newProduct.description} onChange={handleInputChange} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" required />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200">Add Product</button>
            </div>
          </form>
        </section>

        <section id="analytics" className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Sales Analytics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg"><h4 className="text-gray-600">Total Products</h4><p className="text-2xl font-bold">{totalProducts}</p></div>
            <div className="p-4 bg-green-50 rounded-lg"><h4 className="text-gray-600">Total Sales (Estimated)</h4><p className="text-2xl font-bold">${totalSales.toLocaleString()}</p></div>
            <div className="p-4 bg-yellow-50 rounded-lg"><h4 className="text-gray-600">Low Stock Products</h4><p className="text-2xl font-bold">{lowStockProducts}</p></div>
            <div className="p-4 bg-red-50 rounded-lg"><h4 className="text-gray-600">Out of Stock Products</h4><p className="text-2xl font-bold">{outOfStockProducts}</p></div>
          </div>
          <div className="h-96">
            {jobs.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p className="text-gray-600 text-center">No data available to display chart.</p>} {/* Changed from Bar to Line */}
          </div>
        </section>

        <section id="manage-products" className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Manage Products</h3>
          {jobs.length === 0 ? (
            <p className="text-gray-600">No products available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (Rs)</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b">
                      <td className="p-3">{job.product}</td>
                      <td className="p-3">{job.category}</td>
                      <td className="p-3">Rs.{job.price.toFixed(2)}</td>
                      <td className="p-3">{job.discount}</td>
                      <td className="p-3">{job.stock}</td>
                      <td className="p-3">
                        <button onClick={() => handleDeleteProduct(job.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200">Delete</button>
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

export default AdminDashboard;