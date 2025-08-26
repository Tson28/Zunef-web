require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/order.model');
const User = require('./src/models/user.model');

async function fixNewOrderUserId() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully!');
    
    // Find or create test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user'
      });
      await testUser.save();
      console.log('✅ Created test user:', testUser._id);
    } else {
      console.log('✅ Found test user:', testUser._id);
    }
    
    // Update the new order's userId
    const newOrderId = 'ORD_1756207982321_0URE64';
    console.log('\n--- Updating Order UserId ---');
    
    const order = await Order.findOne({ orderId: newOrderId });
    if (order) {
      console.log('Found order:', {
        _id: order._id,
        orderId: order.orderId,
        currentUserId: order.userId,
        productType: order.product?.productType
      });
      
      // Update userId
      order.userId = testUser._id;
      await order.save();
      
      console.log('✅ Updated order userId to:', testUser._id);
    } else {
      console.log('❌ Order not found:', newOrderId);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixNewOrderUserId();