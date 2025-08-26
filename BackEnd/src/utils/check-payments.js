const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
require('dotenv').config();

// Script để kiểm tra payments trong database
async function checkPayments() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to database');
        
        // Lấy tất cả payments
        const allPayments = await Payment.find({});
        console.log(`\n📊 Total payments: ${allPayments.length}`);
        
        if (allPayments.length > 0) {
            // Thống kê theo status
            const statusCounts = {};
            const productTypeCounts = {};
            
            allPayments.forEach(payment => {
                // Đếm theo status
                statusCounts[payment.status] = (statusCounts[payment.status] || 0) + 1;
                
                // Đếm theo productType trong items
                payment.items.forEach(item => {
                    const type = item.productType || 'unknown';
                    productTypeCounts[type] = (productTypeCounts[type] || 0) + 1;
                });
            });
            
            console.log('\n📈 Status breakdown:');
            Object.entries(statusCounts).forEach(([status, count]) => {
                console.log(`  ${status}: ${count}`);
            });
            
            console.log('\n🏷️  Product type breakdown:');
            Object.entries(productTypeCounts).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
            
            // Hiển thị một vài payment mẫu
            console.log('\n📋 Sample payments:');
            allPayments.slice(0, 3).forEach((payment, index) => {
                console.log(`\n  Payment ${index + 1}:`);
                console.log(`    OrderID: ${payment.orderId}`);
                console.log(`    Status: ${payment.status}`);
                console.log(`    Items: ${payment.items.length}`);
                payment.items.forEach((item, itemIndex) => {
                    console.log(`      Item ${itemIndex + 1}: ${item.productName} (${item.productType || 'no type'})`);
                });
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from database');
    }
}

// Chạy script
if (require.main === module) {
    checkPayments();
}

module.exports = checkPayments;