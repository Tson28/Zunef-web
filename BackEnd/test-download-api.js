require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testDownloadAPI() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Find a test user or create one
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = new User({
        email: 'test@example.com',
        password: 'hashedpassword', // In real app, this would be hashed
        name: 'Test User',
        fullName: 'Test User',
        isVerified: true,
        role: 'user'
      });
      await testUser.save();
    }
    
    console.log('Test user found/created:', testUser._id);
    
    // Update the existing order to use this test user
    const Order = require('./src/models/order.model');
    const existingOrder = await Order.findById('68ad9349c10f0605bce8c14a');
    if (existingOrder) {
      existingOrder.userId = testUser._id;
      await existingOrder.save();
      console.log('Updated order userId to match test user');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: testUser._id,
        id: testUser._id,
        email: testUser.email,
        role: testUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('Generated JWT token');
    
    // Test the download info API
    const orderId = 'ORD_1756207982321_0URE64'; // The actual orderId field value
    const apiUrl = `http://localhost:5000/api/download/info/${orderId}`;
    
    console.log('Testing API:', apiUrl);
    
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true // allow non-2xx to inspect body
      });
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Download info API test successful!');
        console.log('Download info:', JSON.stringify(response.data, null, 2));
      } else {
        console.log('❌ Download info API returned non-2xx');
      }
    } catch (error) {
      console.error('❌ Error calling download info API');
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error stack:', error?.stack);
      try {
        console.error('Error toJSON:', error?.toJSON?.());
      } catch {}
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
      }
    }
    
    // Test the download source code API
    console.log('\n--- Testing Download Source Code API ---');
    const downloadUrl = `http://localhost:5000/api/download/source-code/ORD_1756207982321_0URE64`;
    
    try {
      const downloadResponse = await axios.get(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'stream', // Important for file downloads
        timeout: 10000,
        validateStatus: () => true
      });
      console.log('Download response status:', downloadResponse.status);
      console.log('Download response headers:', downloadResponse.headers);
      if (downloadResponse.status >= 200 && downloadResponse.status < 300) {
        console.log('✅ Download source code API test successful!');
      } else {
        console.log('❌ Download source code API returned non-2xx');
      }
      
    } catch (downloadError) {
       console.error('❌ Download API test failed');
       console.error('Error message:', downloadError?.message);
       console.error('Error code:', downloadError?.code);
       console.error('Error stack:', downloadError?.stack);
       try {
         console.error('Error toJSON:', downloadError?.toJSON?.());
       } catch {}
       if (downloadError.response) {
         console.log('Download response status:', downloadError.response.status);
         console.log('Download response headers:', downloadError.response.headers);
         console.log('Download error details:', downloadError.response.data);
       }
     }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API test failed');
      console.log('Response status:', error.response.status);
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Test error:', error.message);
      console.error('Test error stack:', error.stack);
    }
  } finally {
    mongoose.connection.close();
  }
}

testDownloadAPI();