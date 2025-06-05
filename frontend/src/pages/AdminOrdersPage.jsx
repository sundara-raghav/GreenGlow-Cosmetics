import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { AppContext } from '../context/AppContext';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const { user, userRole } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    // Redirect if not admin
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    // Fetch all orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4242/admin-orders');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up an interval to refresh orders periodically
    const intervalId = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [userRole, navigate]);
  
  // Filter orders based on status and search
  useEffect(() => {
    let result = orders;
    
    // Filter by status
    if (orderStatusFilter !== 'all') {
      result = result.filter(order => order.status?.toLowerCase() === orderStatusFilter);
    }
    
    // Filter by search term (order ID)
    if (searchOrderId.trim() !== '') {
      result = result.filter(order => 
        order._id?.toLowerCase().includes(searchOrderId.toLowerCase())
      );
    }
    
    setFilteredOrders(result);
  }, [orders, orderStatusFilter, searchOrderId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4242/update-order-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update order in local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));

      // Update selected order if it's the one being viewed
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const printInvoice = () => {
    if (!printRef.current) return;
    
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = `
      <html>
        <head>
          <title>Order Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 20px; }
            .invoice-header h1 { margin-bottom: 5px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-details div { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${printContents}
            <div class="footer">
              <p>Thank you for your order!</p>
              <p>For any questions, please contact support@sarvam.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // Filtered orders are now handled in the useEffect

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen container mx-auto px-4 py-10 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen container mx-auto px-4 py-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
            <p>Please try again later.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen container mx-auto px-4 py-10">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Admin Orders Dashboard</h1>
            <div className="text-sm text-gray-600">
              {searchOrderId || orderStatusFilter !== 'all' ? (
                <span>Showing {filteredOrders.length} of {orders.length} orders</span>
              ) : (
                <span>Total Orders: {orders.length}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            {/* Search by Order ID */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <label htmlFor="searchOrderId" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Search by Order ID:
              </label>
              <div className="relative flex-grow">
                <input
                  id="searchOrderId"
                  type="text"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  placeholder="Enter order ID..."
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full"
                />
                {searchOrderId && (
                  <button 
                    onClick={() => setSearchOrderId('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            {/* Filter by Status */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter by Status:
              </label>
              <select
                id="statusFilter"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full md:w-auto"
              >
                <option value="all">All Orders</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg mb-4">No orders found.</p>
            {searchOrderId && (
              <p className="text-gray-500">No orders matching ID: "{searchOrderId}"</p>
            )}
            {orderStatusFilter !== 'all' && (
              <p className="text-gray-500">No orders with status: "{orderStatusFilter}"</p>
            )}
            <button 
              onClick={() => {
                setSearchOrderId('');
                setOrderStatusFilter('all');
              }}
              className="mt-4 text-blue-500 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">S.No</th>
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Total</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <span>{order._id?.substring(0, 8)}...</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order._id);
                            alert('Order ID copied to clipboard!');
                          }}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          title="Copy full Order ID"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.customerInfo?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{order.customerInfo?.email || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.customerInfo?.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      ₹{order.totalAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.status)}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 mr-2"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={printInvoice}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Print Invoice
                  </button>
                  <button 
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div ref={printRef}>
                <div className="invoice-header text-center mb-6">
                  <h1 className="text-xl font-bold">GreenGlow Cosmetics</h1>
                  <p>Order Invoice</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Order Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-2">
                        <span className="font-medium">Order ID:</span> 
                        <span className="mr-2">{selectedOrder._id}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder._id);
                            alert('Order ID copied to clipboard!');
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="Copy Order ID"
                        >
                          📋
                        </button>
                      </p>
                      <p className="mb-2"><span className="font-medium">Date:</span> {formatDate(selectedOrder.orderDate)}</p>
                      <p className="mb-2">
                        <span className="font-medium">Status:</span> 
                        <select
                          value={selectedOrder.status || 'processing'}
                          onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                          className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </p>
                      <p className="mb-2">
                        <span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod || 'Cash on Delivery'}
                      </p>
                      <p className="mb-2"><span className="font-medium">Total Amount:</span> ₹{selectedOrder.totalAmount?.toLocaleString()}</p>
                      <p className="mb-2"><span className="font-medium">Estimated Delivery:</span> {formatDate(selectedOrder.estimatedDelivery)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Customer Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-2"><span className="font-medium">Name:</span> {selectedOrder.customerInfo?.name || 'N/A'}</p>
                      <p className="mb-2"><span className="font-medium">Email:</span> {selectedOrder.customerInfo?.email || 'N/A'}</p>
                      <p className="mb-2"><span className="font-medium">Phone:</span> {selectedOrder.customerInfo?.phone || 'N/A'}</p>
                      <p className="mb-2"><span className="font-medium">Address:</span> {selectedOrder.shippingAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold mb-2 text-gray-700">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3">Product</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center">
                              {(item.image || item.img) && (
                                <img 
                                  src={item.image || item.img} 
                                  alt={item.name || item.product || item.title || 'Product'} 
                                  className="w-12 h-12 object-cover rounded mr-3" 
                                />
                              )}
                              <div>
                                <p className="font-medium">
                                  {item.name || item.product || item.title || `Product ${index + 1}`}
                                </p>
                                {item.category && <p className="text-sm text-gray-500">{item.category}</p>}
                                {item.description && (
                                  <p className="text-xs text-gray-500 max-w-xs truncate">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">₹{(item.price || 0).toLocaleString()}</td>
                          <td className="p-3">{item.quantity || 1}</td>
                          <td className="p-3">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                        </tr>
                      ))}
                      {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                        <tr>
                          <td colSpan="4" className="p-3 text-center text-gray-500">No items in this order</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="3" className="p-3 text-right">Total:</td>
                        <td className="p-3">₹{selectedOrder.totalAmount?.toLocaleString() || '0'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    const newStatus = selectedOrder.status === 'processing' ? 'shipped' : 
                                     selectedOrder.status === 'shipped' ? 'completed' : 'processing';
                    updateOrderStatus(selectedOrder._id, newStatus);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {selectedOrder.status === 'processing' ? 'Mark as Shipped' : 
                   selectedOrder.status === 'shipped' ? 'Mark as Completed' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrdersPage;