const mongoose = require('mongoose');
const Payment = require('./src/models/payment.model');
const orderService = require('./src/services/order.service');
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

// Test trực tiếp function createOrdersFromPayment
async function testDirectOrderCreation() {
    try {
        await connectDB();
        
        // Tìm payment mới nhất
        const payment = await Payment.findOne({ 
            transactionCode: '08364473VCDJHK',
            status: 'completed' 
        });
        
        if (!payment) {
            console.error('❌ Payment not found');
            return;
        }
        
        console.log('💳 Found payment:', {
            orderId: payment.orderId,
            userId: payment.userId,
            status: payment.status,
            itemsCount: payment.items.length
        });
        
        console.log('📦 Payment items:');
        payment.items.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.title} - ${item.productType} - ${item.price}`);
        });
        
        console.log('\n🔄 Calling orderService.createOrdersFromPayment directly...');
        
        try {
            const orders = await orderService.createOrdersFromPayment(payment);
            console.log('\n✅ Orders created successfully!');
            console.log('📊 Total orders created:', orders.length);
            
            orders.forEach((order, index) => {
                console.log(`\n📋 Order ${index + 1}:`, {
                    orderId: order.orderId,
                    userId: order.userId,
                    productType: order.product.productType,
                    title: order.product.title,
                    status: order.status,
                    totalAmount: order.totalAmount
                });
            });
            
        } catch (orderError) {
            console.error('\n❌ Error creating orders:', orderError.message);
            console.error('❌ Error stack:', orderError.stack);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Chạy test
testDirectOrderCreation();