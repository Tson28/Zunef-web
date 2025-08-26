const Payment = require('../models/payment.model');
const User = require('../models/user.model');
const orderService = require('./order.service');
const crypto = require('crypto');

class PaymentService {
    // Tạo đơn hàng thanh toán mới
    async createPayment(userId, items, customerInfo) {
        try {
            // Tính tổng tiền
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Tạo mã đơn hàng và mã giao dịch unique
            const orderId = this.generateOrderId();
            const transactionCode = this.generateTransactionCode();
            
            // Tạo nội dung chuyển khoản
            const qrContent = `ZUNEF_${transactionCode}`;
            
            // Tạo URL QR code SePay
            const qrUrl = this.generateSepayQRUrl(totalAmount, qrContent);
            
            // Thêm productType vào items nếu chưa có
            const enhancedItems = await this.enhanceItemsWithProductType(items);
            
            const payment = new Payment({
                orderId,
                userId,
                items: enhancedItems,
                amount: totalAmount,
                transactionCode,
                bankInfo: {
                    accountNumber: '0915878677',
                    bankName: 'MB',
                    qrContent: qrUrl
                },
                customerInfo,
                status: 'pending'
            });
            
            await payment.save();
            return payment;
        } catch (error) {
            throw new Error(`Lỗi tạo đơn hàng: ${error.message}`);
        }
    }
    
    // Tạo URL QR code SePay
    generateSepayQRUrl(amount, content) {
        const accountNumber = '0915878677';
        const bankName = 'MB';
        const encodedContent = encodeURIComponent(content);
        
        return `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankName}&amount=${amount}&des=${encodedContent}`;
    }
    
    // Tạo mã đơn hàng
    generateOrderId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `ORD_${timestamp}_${random}`;
    }
    
    // Tạo mã giao dịch
    generateTransactionCode() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${timestamp}${random}`;
    }
    
    // Xử lý webhook từ SePay
    async processWebhook(webhookData) {
        try {
            const { content, transferAmount, gateway, transactionDate, accountNumber, referenceCode, id } = webhookData;
            
            // Tìm mã giao dịch từ nội dung chuyển khoản
            // Pattern: ZUNEF theo sau bởi mã giao dịch
            const transactionCodeMatch = content.match(/ZUNEF([A-Z0-9]+)/);
            if (!transactionCodeMatch) {
                throw new Error('Không tìm thấy mã giao dịch trong nội dung chuyển khoản');
            }
            
            const transactionCode = transactionCodeMatch[1];
            console.log('Extracted transaction code:', transactionCode);
            
            // Tìm đơn hàng theo mã giao dịch
            const payment = await Payment.findOne({ 
                transactionCode,
                status: 'pending'
            });
            
            if (!payment) {
                throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng đã được xử lý');
            }
            
            // Kiểm tra số tiền
            if (transferAmount !== payment.amount) {
                throw new Error(`Số tiền không khớp. Yêu cầu: ${payment.amount}, Nhận được: ${transferAmount}`);
            }
            
            // Cập nhật thông tin thanh toán
            payment.status = 'completed';
            payment.paymentDate = new Date();
            payment.sepayTransactionId = id.toString();
            payment.webhookData = {
                gateway,
                transactionDate,
                accountNumber,
                content,
                transferType: webhookData.transferType,
                description: webhookData.description,
                transferAmount,
                referenceCode,
                sepayId: id
            };
            
            await payment.save();
            
            console.log('💾 Payment saved, now creating orders...');
            
            // Tạo đơn hàng riêng lẻ cho từng sản phẩm
            let orders = [];
            try {
                console.log('🔄 Calling orderService.createOrdersFromPayment...');
                orders = await orderService.createOrdersFromPayment(payment);
                console.log('✅ Orders created successfully:', orders.length);
            } catch (orderError) {
                console.error('❌ Error creating orders:', orderError.message);
                console.error('❌ Order error stack:', orderError.stack);
                // Không throw error để không làm gián đoạn quá trình thanh toán
            }
            
            console.log('📦 Orders result:', orders.length, 'orders created');
            
            // Cập nhật ownership cho user nếu có source code trong đơn hàng
            await this.updateUserOwnership(payment);
            
            return {
                success: true,
                message: 'Thanh toán được xử lý thành công',
                orderId: payment.orderId,
                payment,
                orders
            };
        } catch (error) {
            throw new Error(`Lỗi xử lý webhook: ${error.message}`);
        }
    }
    
    // Cập nhật ownership cho user khi mua source code và tạo UserAccountInfo cho account
    async updateUserOwnership(payment) {
        try {
            // Lấy danh sách productId từ payment items
            const productIds = payment.items.map(item => item.productId);
            
            if (productIds.length > 0) {
                // Kiểm tra xem productId nào là source code
                const SourceCode = require('../models/sourceCode.model');
                const validSourceCodes = await SourceCode.find({ 
                    _id: { $in: productIds } 
                }).select('_id');
                
                const validSourceCodeIds = validSourceCodes.map(sc => sc._id.toString());
                
                if (validSourceCodeIds.length > 0) {
                    // Cập nhật ownership cho user
                    await User.findByIdAndUpdate(
                        payment.userId,
                        { 
                            $addToSet: { 
                                ownership: { $each: validSourceCodeIds } 
                            } 
                        }
                    );
                    
                    console.log(`Updated ownership for user ${payment.userId} with source codes:`, validSourceCodeIds);
                }
                
                // Tạo UserAccountInfo cho account products
                await this.createUserAccountInfo(payment);
            }
        } catch (error) {
            console.error('Lỗi cập nhật ownership:', error.message);
            // Không throw error để không làm gián đoạn quá trình thanh toán
        }
    }
    
    // Tạo UserAccountInfo cho account products
    async createUserAccountInfo(payment) {
        try {
            const UserAccountInfo = require('../models/userAccountInfo.model');
            const Account = require('../models/account.model');
            const SourceCode = require('../models/sourceCode.model');
            
            for (const item of payment.items) {
                let productType = item.productType;
                
                // Tự động xác định productType nếu chưa có
                if (!productType) {
                    // Kiểm tra trong SourceCode collection trước
                    const sourceCode = await SourceCode.findById(item.productId);
                    if (sourceCode) {
                        productType = 'source-code';
                    } else {
                        // Kiểm tra trong Account collection
                        const account = await Account.findById(item.productId);
                        if (account) {
                            productType = 'account';
                        }
                    }
                }
                
                // Kiểm tra xem item có phải là account product không
                if (productType === 'account') {
                    const account = await Account.findById(item.productId);
                    if (account) {
                        // Kiểm tra xem đã có UserAccountInfo chưa
                        const existingInfo = await UserAccountInfo.findOne({
                            userId: payment.userId,
                            orderId: payment.orderId,
                            productId: item.productId
                        });
                        
                        if (!existingInfo) {
                            // Tạo UserAccountInfo record
                            const userAccountInfo = await UserAccountInfo.createFromOrder({
                                userId: payment.userId,
                                orderId: payment.orderId,
                                productId: item.productId,
                                productName: item.productName || item.title || account.name,
                                duration: account.duration
                            });
                            
                            console.log(`✅ Created UserAccountInfo for user ${payment.userId}, order ${payment.orderId}, product ${account.name}`);
                        } else {
                            console.log(`⏭️  UserAccountInfo already exists for order ${payment.orderId}, product ${item.productId}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ Lỗi tạo UserAccountInfo:', error.message);
            // Không throw error để không làm gián đoạn quá trình thanh toán
        }
    }
    
    // Lấy thông tin thanh toán theo orderId
    async getPaymentByOrderId(orderId, populateUser = false) {
        try {
            let query = Payment.findOne({ orderId });
            if (populateUser) {
                query = query.populate('userId', 'name email');
            }
            const payment = await query;
            if (!payment) {
                throw new Error('Không tìm thấy đơn hàng');
            }
            return payment;
        } catch (error) {
            throw new Error(`Lỗi lấy thông tin thanh toán: ${error.message}`);
        }
    }
    
    // Lấy thông tin thanh toán theo transactionCode
    async getPaymentByTransactionCode(transactionCode) {
        try {
            const payment = await Payment.findOne({ transactionCode }).populate('userId', 'name email');
            return payment; // Return null if not found, let controller handle it
        } catch (error) {
            throw new Error(`Lỗi lấy thông tin giao dịch: ${error.message}`);
        }
    }
    
    // Lấy danh sách thanh toán của user
    async getUserPayments(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const payments = await Payment.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email');
                
            // Enhance items with productType for payments that might not have it
            const enhancedPayments = await Promise.all(
                payments.map(async (payment) => {
                    const paymentObj = payment.toObject();
                    if (paymentObj.items && paymentObj.items.length > 0) {
                        // Check if any item is missing productType
                        const needsEnhancement = paymentObj.items.some(item => !item.productType);
                        if (needsEnhancement) {
                            paymentObj.items = await this.enhanceItemsWithProductType(paymentObj.items);
                        }
                    }
                    return paymentObj;
                })
            );
                
            const total = await Payment.countDocuments({ userId });
            
            return {
                payments: enhancedPayments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Lỗi lấy danh sách thanh toán: ${error.message}`);
        }
    }
    
    // Hủy đơn hàng
    async cancelPayment(orderId, userId) {
        try {
            const payment = await Payment.findOne({ orderId, userId, status: 'pending' });
            if (!payment) {
                throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng không thể hủy');
            }
            
            payment.status = 'cancelled';
            await payment.save();
            
            return payment;
        } catch (error) {
            throw new Error(`Lỗi hủy đơn hàng: ${error.message}`);
        }
    }
    
    // Kiểm tra đơn hàng hết hạn
    async checkExpiredPayments() {
        try {
            const expiredPayments = await Payment.updateMany(
                {
                    status: 'pending',
                    expiresAt: { $lt: new Date() }
                },
                {
                    status: 'cancelled'
                }
            );
            
            return expiredPayments;
        } catch (error) {
            throw new Error(`Lỗi kiểm tra đơn hàng hết hạn: ${error.message}`);
        }
    }
    
    // Thêm productType vào items
    async enhanceItemsWithProductType(items) {
        try {
            const SourceCode = require('../models/sourceCode.model');
            const Account = require('../models/account.model');
            
            const enhancedItems = [];
            
            for (const item of items) {
                let productType = item.productType;
                
                // Nếu chưa có productType, tự động xác định
                if (!productType) {
                    // Kiểm tra trong SourceCode collection
                    const sourceCode = await SourceCode.findById(item.productId);
                    if (sourceCode) {
                        productType = 'source-code';
                    } else {
                        // Kiểm tra trong Account collection
                        const account = await Account.findById(item.productId);
                        if (account) {
                            productType = 'account';
                        } else {
                            // Default fallback
                            productType = 'source-code';
                        }
                    }
                }
                
                enhancedItems.push({
                    ...item,
                    productType
                });
            }
            
            return enhancedItems;
        } catch (error) {
            console.error('Error enhancing items with productType:', error);
            // Fallback: return items with default productType
            return items.map(item => ({
                ...item,
                productType: item.productType || 'source-code'
            }));
        }
    }
}

module.exports = new PaymentService();