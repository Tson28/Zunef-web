const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Order schema (simplified)
const orderSchema = new mongoose.Schema({
  orderId: String,
  userId: mongoose.Schema.Types.ObjectId,
  product: {
    productId: String,
    productType: {
      type: String,
      enum: ['account', 'source-code']
    },
    name: String,
    price: Number
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  deliveryInfo: {
    downloadCount: { type: Number, default: 0 },
    maxDownloads: { type: Number, default: 5 },
    expiresAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

async function createTestOrder() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Check if test order already exists
    const existing = await Order.findOne({ 
      'product.productId': '68ad83447dd64f6f192eed46',
      'product.productType': 'source-code'
    });
    
    if (existing) {
      console.log('✅ Test order already exists:', existing.orderId);
      console.log('Order ID:', existing._id);
      console.log('Product ID:', existing.product.productId);
      console.log('Product Type:', existing.product.productType);
      return existing;
    }

    // Create test order
    const testOrderData = {
      orderId: `TEST_${Date.now()}_SOURCECODE`,
      userId: new mongoose.Types.ObjectId('68ad820f7dd64f6f192eec93'), // Using createdBy from SourceCode
      product: {
        productId: '68ad83447dd64f6f192eed46', // Using ObjectId as productId
        productType: 'source-code',
        title: 'Ứng dụng lưu trữ đám mây',
        price: 142500,
        quantity: 1
      },
      status: 'paid',
      deliveryInfo: {
        downloadCount: 0,
        maxDownloads: 5,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    };

    const newOrder = new Order(testOrderData);
    const result = await newOrder.save();
    
    console.log('✅ Test order created successfully!');
    console.log('Order ID:', result._id);
    console.log('Order Code:', result.orderId);
    console.log('Product ID:', result.product.productId);
    console.log('Product Type:', result.product.productType);
    console.log('Status:', result.status);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error creating test order:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestOrder();