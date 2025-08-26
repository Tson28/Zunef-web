require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./src/models/payment.model');
const orderService = require('./src/services/order.service');

async function debugOrderCreation() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully!');
    
    const orderId = 'ORD_1756207656708_TCYJJ2';
    console.log('\n=== Debugging Order Creation for:', orderId, '===');
    
    // 1. Find the payment
    console.log('\n--- Finding Payment ---');
    const payment = await Payment.findOne({ orderId: orderId });
    
    if (!payment) {
      console.log('❌ Payment not found');
      return;
    }
    
    console.log('✅ Found payment:', {
      _id: payment._id,
      orderId: payment.orderId,
      userId: payment.userId,
      status: payment.status,
      itemsCount: payment.items?.length || 0
    });
    
    // 2. Check payment items
    console.log('\n--- Payment Items ---');
    if (payment.items && payment.items.length > 0) {
      payment.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          productId: item.productId,
          productType: item.productType,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        });
      });
    } else {
      console.log('❌ No items found in payment');
      return;
    }
    
    // 3. Try to create orders manually
    console.log('\n--- Attempting to Create Orders ---');
    try {
      const orders = await orderService.createOrdersFromPayment(payment);
      console.log('✅ Orders created successfully:', orders.length);
      
      orders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`, {
          _id: order._id,
          orderId: order.orderId,
          userId: order.userId,
          productType: order.product?.productType,
          status: order.status
        });
      });
    } catch (error) {
      console.log('❌ Error creating orders:', error.message);
      console.log('Full error:', error);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOrderCreation();