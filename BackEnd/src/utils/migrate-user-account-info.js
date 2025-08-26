const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const Account = require('../models/account.model');
const UserAccountInfo = require('../models/userAccountInfo.model');
require('dotenv').config();

// Script để migrate dữ liệu UserAccountInfo cho các đơn hàng đã thanh toán
async function migrateUserAccountInfo() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to database');
        
        // Lấy tất cả payments đã thành công (completed hoặc success)
        const successfulPayments = await Payment.find({ 
            status: { $in: ['success', 'completed'] } 
        });
        console.log(`Found ${successfulPayments.length} successful payments`);
        
        let createdCount = 0;
        let skippedCount = 0;
        
        for (const payment of successfulPayments) {
            for (const item of payment.items) {
                // Tự động xác định productType nếu chưa có
                let productType = item.productType;
                if (!productType) {
                    // Kiểm tra trong Account collection
                    const account = await Account.findById(item.productId);
                    if (account) {
                        productType = 'account';
                    } else {
                        productType = 'source-code';
                    }
                }
                
                // Kiểm tra xem item có phải là account product không
                if (productType === 'account') {
                    // Kiểm tra xem đã có UserAccountInfo chưa
                    const existingInfo = await UserAccountInfo.findOne({
                        userId: payment.userId,
                        orderId: payment.orderId,
                        productId: item.productId
                    });
                    
                    if (!existingInfo) {
                        // Lấy thông tin product
                        const account = await Account.findById(item.productId);
                        if (account) {
                            // Tạo UserAccountInfo record
                            const userAccountInfo = await UserAccountInfo.createFromOrder({
                                userId: payment.userId,
                                orderId: payment.orderId,
                                productId: item.productId,
                                productName: item.productName || account.name
                            });
                            
                            console.log(`✅ Created UserAccountInfo for order ${payment.orderId}, product ${account.name}`);
                            createdCount++;
                        }
                    } else {
                        console.log(`⏭️  Skipped order ${payment.orderId}, UserAccountInfo already exists`);
                        skippedCount++;
                    }
                }
            }
        }
        
        console.log(`\n🎉 Migration completed!`);
        console.log(`📊 Created: ${createdCount} records`);
        console.log(`⏭️  Skipped: ${skippedCount} records`);
        
    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
}

// Chạy migration
if (require.main === module) {
    migrateUserAccountInfo();
}

module.exports = migrateUserAccountInfo;