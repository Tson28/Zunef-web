const mongoose = require('mongoose');
const Payment = require('./src/models/payment.model');
const User = require('./src/models/user.model');
require('dotenv').config();

// Kết nối MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Tạo payment test mới
async function createTestPayment() {
    try {
        await connectDB();
        
        // Tìm user test
        const testUser = await User.findOne({ email: 'test@example.com' });
        if (!testUser) {
            console.error('❌ Test user not found');
            return;
        }
        
        console.log('👤 Found test user:', testUser._id);
        
        // Tạo transaction code mới
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const transactionCode = `${timestamp}${random}`;
        
        console.log('🆔 Generated transaction code:', transactionCode);
        
        // Tạo payment mới
        const payment = new Payment({
            orderId: `ORD_${Date.now()}_TEST`,
            userId: testUser._id,
            items: [
                {
                    productId: '68ad83447dd64f6f192eed46', // Source code ID từ database
                    title: 'Test Source Code',
                    price: 100000,
                    quantity: 1,
                    productType: 'source-code'
                },
                {
                    productId: '68ad8344c8b64f6f192eed4a', // Account ID từ database
                    title: 'Test Account',
                    price: 92500,
                    quantity: 1,
                    productType: 'account'
                }
            ],
            amount: 192500,
            transactionCode,
            bankInfo: {
                accountNumber: '0915878677',
                bankName: 'MB',
                qrContent: `ZUNEF_${transactionCode}`
            },
            customerInfo: {
                fullName: 'Test User',
                email: 'test@example.com'
            },
            status: 'pending'
        });
        
        await payment.save();
        console.log('💾 Created test payment:', payment.orderId);
        console.log('🔗 Transaction code for webhook:', transactionCode);
        
        // Tạo webhook data để test
        const webhookData = {
            gateway: "MBBank",
            transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            accountNumber: "0915878677",
            subAccount: null,
            code: null,
            content: `ZUNEF${transactionCode} Test payment webhook`,
            transferType: "in",
            description: `Test payment webhook ZUNEF${transactionCode}`,
            transferAmount: 192500,
            referenceCode: `FT${Date.now()}`,
            accumulated: 0,
            id: Math.floor(Math.random() * 1000000)
        };
        
        console.log('\n📤 Webhook data to use:');
        console.log(JSON.stringify(webhookData, null, 2));
        
        console.log('\n🚀 Now you can test webhook with this data!');
        
    } catch (error) {
        console.error('❌ Error creating test payment:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Chạy script
createTestPayment();