require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 4242;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://freelancingtodayinfo:free123@cluster0.k6fv5th.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = process.env.DB_NAME || "ecommerce";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware - Set payload limits first
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Stripe initialization
const stripe = Stripe(STRIPE_SECRET_KEY);

// MongoDB connection setup with retry logic
let db;
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(DB_NAME);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    db: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Payment endpoint
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Products endpoint with pagination
app.get('/products', async (req, res) => {
  try {
    const collection = db.collection('products');
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      collection.find({}).skip(skip).limit(parseInt(limit)).toArray(),
      collection.countDocuments()
    ]);
    
    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});
// Add product endpoint
app.post('/add-product', async (req, res) => {
  try {
    const collection = db.collection('products');
    const result = await collection.insertOne(req.body);
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product endpoint
app.delete('/delete-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('products');
    const { ObjectId } = require('mongodb');
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const result = await collection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve product endpoint
app.put('/approve-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const collection = db.collection('products');
    const { ObjectId } = require('mongodb');
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { status } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product status updated successfully' });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Management Endpoints

// Add seller (Admin only)
app.post('/add-seller', async (req, res) => {
  try {
    const { name, email, phone, address, businessName, businessType, password } = req.body;
    
    if (!name || !email || !businessName || !password) {
      return res.status(400).json({ error: 'Name, email, business name, and password are required' });
    }

    const sellersCollection = db.collection('sellers');
    
    // Check if seller already exists
    const existingSeller = await sellersCollection.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ error: 'Seller with this email already exists' });
    }

    const newSeller = {
      name,
      email,
      phone: phone || '',
      address: address || '',
      businessName,
      businessType: businessType || '',
      password, // Store seller password (should hash in production)
      status: 'active',
      dateAdded: new Date(),
      addedBy: 'admin'
    };

    const result = await sellersCollection.insertOne(newSeller);
    res.status(201).json({ 
      id: result.insertedId, 
      message: 'Seller added successfully',
      seller: newSeller 
    });
  } catch (error) {
    console.error('Error adding seller:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sellers (Admin only)
app.get('/sellers', async (req, res) => {
  try {
    const sellersCollection = db.collection('sellers');
    const sellers = await sellersCollection.find({}).toArray();
    res.json({ data: sellers });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete seller (Admin only)
app.delete('/delete-seller/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sellersCollection = db.collection('sellers');
    const { ObjectId } = require('mongodb');
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid seller ID format' });
    }
    
    const result = await sellersCollection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.status(200).json({ message: 'Seller deleted successfully' });
  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order Management Endpoints

// Create order
app.post('/create-order', async (req, res) => {
  try {
    const { 
      customerInfo, 
      items, 
      totalAmount, 
      paymentMethod,
      shippingAddress 
    } = req.body;

    console.log('Received order request with', items?.length || 0, 'items');

    // Validate required fields with fallbacks for more robustness
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    // Optimize items array to reduce payload size
    const sanitizedItems = items.map(item => {
      // Extract only the necessary fields
      return {
        name: item.name || item.title || item.product || 'Product',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        // Store only the image URL or a truncated version if it's a data URL
        image: typeof item.image === 'string' && item.image.startsWith('data:') 
          ? (item.image.substring(0, 100) + '...') // Truncate data URLs
          : (item.image || item.img || ''),
        category: item.category || '',
        // Truncate long descriptions
        description: (item.description || item.usage || '').substring(0, 500)
      };
    });

    // Ensure customerInfo exists with all required fields
    const validatedCustomerInfo = {
      name: customerInfo?.name || 'Customer',
      email: customerInfo?.email || 'guest@example.com',
      phone: customerInfo?.phone || 'Not provided',
      address: customerInfo?.address || 'Not provided',
      city: customerInfo?.city || 'Not provided',
      pincode: customerInfo?.pincode || 'Not provided'
    };

    // Ensure we have a valid total amount
    const validatedTotalAmount = totalAmount || 
      sanitizedItems.reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);

    const ordersCollection = db.collection('orders');
    
    // Calculate estimated delivery date (1 day from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
    
    const newOrder = {
      customerInfo: validatedCustomerInfo,
      items: sanitizedItems,
      itemCount: sanitizedItems.length,
      totalAmount: validatedTotalAmount,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      shippingAddress: shippingAddress || validatedCustomerInfo.address || 'Address not provided',
      status: 'processing',
      paymentStatus: 'pending',
      orderDate: new Date(),
      estimatedDelivery: estimatedDelivery
    };

    const result = await ordersCollection.insertOne(newOrder);
    
    // Log the created order for debugging
    console.log('Order created with ID:', result.insertedId);
    console.log('Order contains', sanitizedItems.length, 'items');
    
    res.status(201).json({ 
      orderId: result.insertedId,
      message: 'Order created successfully',
      order: {
        _id: result.insertedId,
        customerInfo: validatedCustomerInfo,
        itemCount: sanitizedItems.length,
        totalAmount: validatedTotalAmount,
        status: 'processing',
        orderDate: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin only)
app.get('/orders', async (req, res) => {
  try {
    const ordersCollection = db.collection('orders');
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const [orders, total] = await Promise.all([
      ordersCollection.find(query).skip(skip).limit(parseInt(limit)).sort({ orderDate: -1 }).toArray(),
      ordersCollection.countDocuments(query)
    ]);
    
    res.json({
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/update-order-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const ordersCollection = db.collection('orders');
    const { ObjectId } = require('mongodb');
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    updateData.lastUpdated = new Date();
    
    const result = await ordersCollection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get products by seller ID
app.get('/seller-products/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const collection = db.collection('products');
    
    const products = await collection.find({ 'companyId._id': sellerId }).toArray();
    
    res.status(200).json({ data: products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending products for admin approval
app.get('/pending-products', async (req, res) => {
  try {
    const collection = db.collection('products');
    
    const pendingProducts = await collection.find({ status: 'pending' }).toArray();
    
    res.status(200).json({ data: pendingProducts });
  } catch (error) {
    console.error('Error fetching pending products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Seller login endpoint
app.post('/seller-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const sellersCollection = db.collection('sellers');
    const seller = await sellersCollection.findOne({ email });
    if (!seller) {
      return res.status(401).json({ error: 'Seller not found' });
    }
    if (seller.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    // On success, return seller info (omit password)
    const { password: _, ...sellerInfo } = seller;
    res.status(200).json({ message: 'Login successful', seller: sellerInfo });
  } catch (error) {
    console.error('Error during seller login:', error);
    res.status(500).json({ error: error.message });
  }
});

// User signup route
app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const usersCollection = db.collection('users');

    // Check if the user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Insert the new user with creation timestamp
    const newUser = {
      email,
      password,
      name: name || email.split('@')[0], // Use name if provided, otherwise use part of email
      createdAt: new Date(),
      status: 'active'
    };
    
    await usersCollection.insertOne(newUser);
    res.status(201).json({ 
      message: 'User created successfully',
      user: { 
        email, 
        name: newUser.name,
        createdAt: newUser.createdAt 
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user orders
app.get('/user-orders/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const ordersCollection = db.collection('orders');
    const userOrders = await ordersCollection.find({
      'customerInfo.email': email
    }).sort({ orderDate: -1 }).toArray();
    
    res.status(200).json({
      orders: userOrders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders for admin
app.get('/admin-orders', async (req, res) => {
  try {
    const ordersCollection = db.collection('orders');
    const allOrders = await ordersCollection.find({}).sort({ orderDate: -1 }).toArray();
    
    res.status(200).json({
      orders: allOrders
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user orders by email
app.get('/user-orders/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('Fetching orders for email:', email);
    
    const ordersCollection = db.collection('orders');
    const userOrders = await ordersCollection.find({
      'customerInfo.email': email
    }).sort({ orderDate: -1 }).toArray();
    
    console.log(`Found ${userOrders.length} orders for user ${email}`);
    
    res.status(200).json({
      orders: userOrders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add order directly to admin panel
app.post('/admin-orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    if (!orderData || !orderData.items || !orderData.customerInfo) {
      return res.status(400).json({ error: 'Invalid order data' });
    }
    
    // Ensure all required fields are present
    const validatedOrder = {
      ...orderData,
      customerInfo: {
        name: orderData.customerInfo?.name || 'Customer',
        email: orderData.customerInfo?.email || 'No Email Provided',
        phone: orderData.customerInfo?.phone || 'No Phone Provided',
        address: orderData.customerInfo?.address || 'No Address Provided',
        city: orderData.customerInfo?.city || 'No City Provided',
        pincode: orderData.customerInfo?.pincode || 'No Pincode Provided'
      },
      status: orderData.status || 'processing',
      paymentStatus: orderData.paymentStatus || 'pending',
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
      estimatedDelivery: orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery) : new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    
    const ordersCollection = db.collection('orders');
    const result = await ordersCollection.insertOne(validatedOrder);
    
    res.status(201).json({
      success: true,
      orderId: result.insertedId,
      message: 'Order added to admin panel successfully'
    });
  } catch (error) {
    console.error('Error adding order to admin panel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
app.put('/update-order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ error: 'Order ID and status are required' });
    }
    
    const ordersCollection = db.collection('orders');
    
    // Convert string ID to ObjectId if needed
    const objectId = orderId.length === 24 ? new ObjectId(orderId) : orderId;
    
    const result = await ordersCollection.updateOne(
      { _id: objectId },
      { $set: { status: status } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
app.put('/update-order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ error: 'Order ID and status are required' });
    }
    
    const ordersCollection = db.collection('orders');
    
    // Convert string ID to ObjectId if needed
    const objectId = orderId.length === 24 ? new ObjectId(orderId) : orderId;
    
    const result = await ordersCollection.updateOne(
      { _id: objectId },
      { $set: { status: status } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
app.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's orders
    const ordersCollection = db.collection('orders');
    const userOrders = await ordersCollection.find({
      'customerInfo.email': email
    }).toArray();
    
    // Create safe user object without password
    const { password: _, ...safeUser } = user;
    
    res.status(200).json({
      user: {
        ...safeUser,
        name: safeUser.name || email.split('@')[0],
        role: 'client',
        orderCount: userOrders.length
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const usersCollection = db.collection('users');
    console.log('Login request received with email:', email);

    // Check if the user exists and the password matches
    const user = await usersCollection.findOne({ email, password });
    if (!user) {
      console.log('Invalid login attempt for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user's orders if any
    const ordersCollection = db.collection('orders');
    const userOrders = await ordersCollection.find({
      'customerInfo.email': email
    }).toArray();

    // Create a safe user object without password
    const { password: _, ...safeUser } = user;
    
    // Add order count to user data and ensure name exists
    const userData = {
      ...safeUser,
      name: safeUser.name || email.split('@')[0], // Ensure name exists
      email: email, // Explicitly include email
      role: 'client', // Set role for frontend permissions
      orderCount: userOrders.length
    };

    console.log('Login successful for email:', email);
    res.status(200).json({ 
      message: 'Login successful',
      user: userData
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin panel route to fetch user details
app.get('/admin/users', async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// Start server after DB connection
connectToDatabase().then((database) => {
  db = database; // Set the global db variable
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});