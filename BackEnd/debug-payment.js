require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./src/models/payment.model');
const UserAccountInfo = require('./src/models/userAccountInfo.model');
const Account = require('./src/models/account.model');

async function debugPayment() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to database');

    // Find the specific payment
    const orderId = 'ORD_1756205564557_GBI0SS';
    const payment = await Payment.findOne({ orderId });
    
    if (!payment) {
      console.log('Payment not found');
      return;
    }

    console.log('Payment found:');
    console.log('- OrderId:', payment.orderId);
    console.log('- Status:', payment.status);
    console.log('- Items:', JSON.stringify(payment.items, null, 2));
    
    // Check each item's productType
    for (const item of payment.items) {
      console.log(`\nChecking item: ${item.title}`);
      console.log('- ProductId:', item.productId);
      console.log('- ProductType:', item.productType);
      
      // Check if product exists in Account collection
      const account = await Account.findById(item.productId);
      if (account) {
        console.log('- Found in Account collection:', account.name);
        console.log('- Account category:', account.category);
      } else {
        console.log('- NOT found in Account collection');
      }
    }

    // Check if UserAccountInfo exists for this order
    const userAccountInfo = await UserAccountInfo.find({ 
      orderId: payment.orderId,
      userId: payment.userId 
    });
    
    console.log('\nUserAccountInfo records found:', userAccountInfo.length);
    if (userAccountInfo.length > 0) {
      userAccountInfo.forEach((info, index) => {
        console.log(`Record ${index + 1}:`, {
          productId: info.productId,
          orderId: info.orderId,
          status: info.status
        });
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

debugPayment();