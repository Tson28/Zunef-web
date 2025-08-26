require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/order.model');
const User = require('./src/models/user.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugOrderQuery() {
  try {
    console.log('Connecting to MongoDB...');
    
    const testUser = await User.findOne({ email: 'test@example.com' });
    console.log('Test user:', testUser._id);
    
    const orderId = '68ad9349c10f0605bce8c14a';
    console.log('Looking for order with _id:', orderId);
    
    // Check if order exists by _id
    const orderById = await Order.findById(orderId);
    console.log('Order found by _id:', orderById ? 'YES' : 'NO');
    if (orderById) {
      console.log('Order details:', {
        _id: orderById._id,
        orderId: orderById.orderId,
        userId: orderById.userId,
        productType: orderById.product.productType,
        status: orderById.status
      });
    }
    
    // Try the exact query from download controller
    const downloadQuery = {
      orderId: orderId, // This might be wrong - orderId field vs _id
      userId: testUser._id,
      'product.productType': 'source-code',
      status: { $in: ['paid', 'completed'] }
    };
    
    console.log('\nTrying download controller query:', JSON.stringify(downloadQuery, null, 2));
    const orderByQuery = await Order.findOne(downloadQuery);
    console.log('Order found by download query:', orderByQuery ? 'YES' : 'NO');
    
    // Try with correct orderId field
    if (orderById && orderById.orderId) {
      const correctQuery = {
        orderId: orderById.orderId, // Use the actual orderId field value
        userId: testUser._id,
        'product.productType': 'source-code',
        status: { $in: ['paid', 'completed'] }
      };
      
      console.log('\nTrying with correct orderId field:', JSON.stringify(correctQuery, null, 2));
      const orderByCorrectQuery = await Order.findOne(correctQuery);
      console.log('Order found by correct query:', orderByCorrectQuery ? 'YES' : 'NO');
    }
    
    // List all orders for this user
    const userOrders = await Order.find({ userId: testUser._id });
    console.log('\nAll orders for this user:', userOrders.length);
    userOrders.forEach(order => {
      console.log(`- Order: ${order.orderId} (${order._id}), Product: ${order.product.productType}, Status: ${order.status}`);
    });
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOrderQuery();