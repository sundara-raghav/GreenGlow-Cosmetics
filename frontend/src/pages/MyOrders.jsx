import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';

const MyOrders = () => {
  const navigate = useNavigate();
  const { loggedInUser } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    // Redirect to login if not logged in
    if (!loggedInUser) {
      navigate('/customer-login');
      return;
    }

    // Fetch user's orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // First, get any orders stored in localStorage
        const localOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        console.log('Local orders found:', localOrders.length);
        console.log('Local orders details:', localOrders);
        
        // Then try to fetch from backend
        let backendOrders = [];
        try {
          console.log('Fetching orders for email:', loggedInUser.email);
          const response = await fetch(`http://localhost:4242/user-orders/${loggedInUser.email}`);
          if (response.ok) {
            const data = await response.json();
            backendOrders = data.orders || [];
            console.log('Backend orders found:', backendOrders.length);
            console.log('Backend orders details:', backendOrders);
          } else {
            console.error('Failed to fetch orders from backend:', await response.text());
          }
        } catch (backendError) {
          console.warn('Could not fetch orders from backend, using local orders only:', backendError);
        }
        
        // Combine orders from both sources
        // Use a Map to avoid duplicates (backend orders take precedence)
        const orderMap = new Map();
        
        // Add local orders first
        localOrders.forEach(order => {
          // Generate a simple ID if none exists
          const id = order._id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          // Make sure the order belongs to the current user
          if (!order.customerInfo?.email || 
              order.customerInfo.email === loggedInUser.email) {
            orderMap.set(id, { 
              ...order, 
              _id: id,
              // Ensure these fields exist for consistent display
              status: order.status || 'processing',
              customerInfo: {
                ...order.customerInfo,
                name: order.customerInfo?.name || loggedInUser.name || 'Customer',
                email: order.customerInfo?.email || loggedInUser.email
              }
            });
          }
        });
        
        // Then add backend orders (will overwrite local ones with same ID)
        backendOrders.forEach(order => {
          orderMap.set(order._id, order);
        });
        
        // Convert map back to array and sort by date (newest first)
        const combinedOrders = Array.from(orderMap.values()).sort((a, b) => {
          return new Date(b.orderDate) - new Date(a.orderDate);
        });
        
        console.log('Combined orders:', combinedOrders.length);
        setOrders(combinedOrders);
        
        // If we have orders but they're not showing up in the UI, force a re-render
        if (combinedOrders.length > 0 && orders.length === 0) {
          setTimeout(() => {
            setOrders([...combinedOrders]);
          }, 500);
        }
      } catch (err) {
        console.error('Error processing orders:', err);
        setError('Could not load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up an interval to refresh orders periodically
    const intervalId = setInterval(fetchOrders, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [loggedInUser, navigate, orders.length]);

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen container mx-auto px-4 py-10 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen container mx-auto px-4 py-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
            <p>Please try again later.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet.</p>
            <p className="text-gray-500 mb-4">
              Check if you have any orders in localStorage: {localStorage.getItem('userOrders') ? 'Yes' : 'No'}
            </p>
            <div className="flex justify-center space-x-4">
              <a href="/" className="text-blue-500 hover:underline">Start Shopping</a>
              <button 
                onClick={() => {
                  // Check for last order in localStorage
                  const lastOrder = localStorage.getItem('lastOrder');
                  if (lastOrder) {
                    const parsedOrder = JSON.parse(lastOrder);
                    setOrders([parsedOrder]);
                  } else {
                    alert('No recent orders found in local storage');
                  }
                }}
                className="text-green-500 hover:underline"
              >
                Check for Recent Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b">
                  <div>
                    <p className="text-sm text-gray-500">Order placed</p>
                    <p className="font-medium">{formatDate(order.orderDate)}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">₹{order.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="text-sm text-gray-500">Estimated delivery</p>
                    <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="text-sm">{order.shippingAddress}</p>
                  </div>
                  
                  <div className="space-y-4">
                    {(order.items || []).slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img 
                            src={item.image || item.img || 'https://via.placeholder.com/150'} 
                            alt={item.name || item.product || item.title || 'Product'} 
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.name || item.product || item.title || 'Product'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            ₹{item.price?.toLocaleString() || '0'} x {item.quantity || 1}
                          </p>
                          {item.category && (
                            <p className="text-xs text-gray-500">{item.category}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(order.items || []).length > 2 && (
                      <p className="text-sm text-gray-500">
                        + {order.items.length - 2} more item(s)
                      </p>
                    )}
                    
                    {(!order.items || order.items.length === 0) && (
                      <p className="text-sm text-gray-500 italic">No items found in this order</p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      View Order Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                  <h1 className="text-xl font-bold">SARVAM</h1>
                  <p>Order Invoice</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-700">Order Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                    <p className="mb-2"><span className="font-medium">Date:</span> {formatDate(selectedOrder.orderDate)}</p>
                    <p className="mb-2">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod || 'Cash on Delivery'}
                    </p>
                    <p className="mb-2"><span className="font-medium">Total Amount:</span> ₹{selectedOrder.totalAmount?.toLocaleString()}</p>
                    <p className="mb-2"><span className="font-medium">Estimated Delivery:</span> {formatDate(selectedOrder.estimatedDelivery)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-700">Shipping Information</h4>
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
                        <td colSpan="4" className="p-3 text-center text-gray-500 italic">
                          No items found in this order
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="p-3 text-right font-semibold">Total:</td>
                      <td className="p-3 font-bold">₹{selectedOrder.totalAmount?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              </div> {/* Close printRef div */}

              <div className="mt-6 flex justify-end space-x-2">
                {selectedOrder.status === 'shipped' && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`http://localhost:4242/update-order-status/${selectedOrder._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'completed' }),
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to update order status');
                        }
                        
                        // Update order in local state
                        setOrders(orders.map(order => 
                          order._id === selectedOrder._id ? { ...order, status: 'completed' } : order
                        ));
                        
                        // Update selected order
                        setSelectedOrder({ ...selectedOrder, status: 'completed' });
                        
                        alert('Order marked as completed!');
                      } catch (error) {
                        console.error('Error updating order status:', error);
                        alert('Failed to update order status');
                      }
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Mark as Received
                  </button>
                )}
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default MyOrders;