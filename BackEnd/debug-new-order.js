require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/order.model');
const SourceCode = require('./src/models/sourceCode.model');
const Account = require('./src/models/account.model');

async function debugNewOrder() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully!');
    
    const orderId = 'ORD_1756207656708_TCYJJ2';
    console.log('\n=== Debugging Order:', orderId, '===');
    
    // 1. Find order by orderId
    const order = await Order.findOne({ orderId: orderId }).populate('product.productId');
    
    if (order) {
      console.log('✅ Order found!');
      console.log('Order details:', {
        _id: order._id,
        orderId: order.orderId,
        userId: order.userId,
        status: order.status,
        product: {
          productId: order.product.productId._id,
          productType: order.product.productType,
          name: order.product.productId.name || order.product.productId.title
        },
        createdAt: order.createdAt
      });
      
      // 2. Check if product is source-code type
      if (order.product.productType === 'source-code') {
        console.log('\n✅ Product type is source-code');
        
        // 3. Check if SourceCode exists
        const sourceCode = await SourceCode.findById(order.product.productId._id);
        if (sourceCode) {
          console.log('✅ SourceCode found:', {
            _id: sourceCode._id,
            name: sourceCode.name,
            slug: sourceCode.slug,
            sourceCodeFile: sourceCode.sourceCodeFile
          });
        } else {
          console.log('❌ SourceCode not found!');
        }
      } else if (order.product.productType === 'account') {
        console.log('\n✅ Product type is account');
        
        // Check if Account exists
        const account = await Account.findById(order.product.productId._id);
        if (account) {
          console.log('✅ Account found:', {
            _id: account._id,
            name: account.name,
            slug: account.slug
          });
        } else {
          console.log('❌ Account not found!');
        }
      }
      
      // 4. Test the exact query used by download controller
      console.log('\n=== Testing Download Controller Query ===');
      const downloadQuery = {
        orderId: orderId,
        userId: order.userId,
        'product.productType': 'source-code',
        status: 'completed'
      };
      
      console.log('Query:', downloadQuery);
      
      const downloadOrder = await Order.findOne(downloadQuery).populate('product.productId');
      
      if (downloadOrder) {
        console.log('✅ Download controller query successful!');
      } else {
        console.log('❌ Download controller query failed!');
        
        // Check each condition separately
        console.log('\n=== Checking each condition ===');
        
        const orderIdCheck = await Order.findOne({ orderId: orderId });
        console.log('orderId check:', orderIdCheck ? '✅' : '❌');
        
        const userIdCheck = await Order.findOne({ orderId: orderId, userId: order.userId });
        console.log('userId check:', userIdCheck ? '✅' : '❌');
        
        const productTypeCheck = await Order.findOne({ 
          orderId: orderId, 
          userId: order.userId,
          'product.productType': 'source-code'
        });
        console.log('productType check:', productTypeCheck ? '✅' : '❌');
        
        const statusCheck = await Order.findOne({ 
          orderId: orderId, 
          userId: order.userId,
          'product.productType': 'source-code',
          status: 'completed'
        });
        console.log('status check:', statusCheck ? '✅' : '❌');
        
        if (order.product.productType !== 'source-code') {
          console.log('\n⚠️  This is not a source-code product!');
          console.log('Actual productType:', order.product.productType);
        }
        
        if (order.status !== 'completed') {
          console.log('\n⚠️  Order status is not completed!');
          console.log('Actual status:', order.status);
        }
      }
      
    } else {
      console.log('❌ Order not found!');
      
      // List recent orders
      console.log('\n=== Recent Orders ===');
      const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
      recentOrders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderId} - ${order.status} - ${order.product.productType}`);
      });
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugNewOrder();