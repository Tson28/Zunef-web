require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/order.model');
const Payment = require('./src/models/payment.model');

async function debugPaymentsAndOrders() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully!');
    
    const orderId = 'ORD_1756207656708_TCYJJ2';
    console.log('\n=== Debugging Order:', orderId, '===');
    
    // 1. Check in Orders collection
    console.log('\n--- Checking Orders Collection ---');
    const order = await Order.findOne({ orderId: orderId });
    
    if (order) {
      console.log('✅ Found in Orders collection:', {
        _id: order._id,
        orderId: order.orderId,
        userId: order.userId,
        status: order.status,
        productType: order.product?.productType,
        createdAt: order.createdAt
      });
    } else {
      console.log('❌ Not found in Orders collection');
    }
    
    // 2. Check in Payments collection
    console.log('\n--- Checking Payments Collection ---');
    const payment = await Payment.findOne({ orderId: orderId });
    
    if (payment) {
      console.log('✅ Found in Payments collection:', {
        _id: payment._id,
        orderId: payment.orderId,
        userId: payment.userId,
        status: payment.status,
        amount: payment.amount,
        createdAt: payment.createdAt
      });
      
      // Check if payment has product info
      if (payment.product) {
        console.log('Payment product info:', {
          productId: payment.product.productId,
          productType: payment.product.productType,
          quantity: payment.product.quantity
        });
      }
      
      // Check if payment has items array
      if (payment.items && payment.items.length > 0) {
        console.log('Payment items:', payment.items.map(item => ({
          productId: item.productId,
          productType: item.productType,
          quantity: item.quantity,
          price: item.price
        })));
      }
    } else {
      console.log('❌ Not found in Payments collection');
    }
    
    // 3. List recent records from both collections
    console.log('\n--- Recent Orders ---');
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(3);
    recentOrders.forEach((order, index) => {
      console.log(`${index + 1}. Orders: ${order.orderId} - ${order.status} - ${order.product?.productType || 'N/A'}`);
    });
    
    console.log('\n--- Recent Payments ---');
    const recentPayments = await Payment.find({}).sort({ createdAt: -1 }).limit(3);
    recentPayments.forEach((payment, index) => {
      const productType = payment.product?.productType || 
                         (payment.items && payment.items[0]?.productType) || 'N/A';
      console.log(`${index + 1}. Payments: ${payment.orderId} - ${payment.status} - ${productType}`);
    });
    
    // 4. Check which collection the download controller should use
    console.log('\n--- Download Controller Analysis ---');
    console.log('Current download controller queries Orders collection.');
    
    if (payment && !order) {
      console.log('⚠️  Issue: Payment exists but Order does not!');
      console.log('💡 Solution: Download controller should check Payments collection or');
      console.log('💡          Orders should be created when payments are completed.');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPaymentsAndOrders();