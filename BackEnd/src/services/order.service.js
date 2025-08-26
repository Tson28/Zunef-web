const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');
const crypto = require('crypto');
const DeliveryInfo = require('../models/deliveryInfo.model');
const UserAccountInfo = require('../models/userAccountInfo.model');
const SourceCode = require('../models/sourceCode.model');
const Account = require('../models/account.model');

class OrderService {
    // Tạo đơn hàng riêng lẻ từ payment
    async createOrdersFromPayment(payment) {
        try {
            console.log('🔄 Starting createOrdersFromPayment for payment:', payment.orderId);
            console.log('📦 Payment items:', payment.items);
            
            const orders = [];
            
            // Tạo một đơn hàng riêng cho mỗi sản phẩm
            for (const item of payment.items) {
                console.log('🛍️ Processing item:', item);

                // Xác định productType nếu chưa có trên item
                let productType = item.productType;
                if (!productType) {
                    try {
                        const sc = await SourceCode.findById(item.productId);
                        if (sc) {
                            productType = 'source-code';
                        } else {
                            const acc = await Account.findById(item.productId);
                            if (acc) {
                                productType = 'account';
                            }
                        }
                    } catch (lookupErr) {
                        console.warn('⚠️ Không xác định được productType từ DB, dùng mặc định source-code:', lookupErr?.message);
                    }
                }
                // Nếu vẫn chưa xác định được, fallback an toàn
                productType = productType || 'source-code';

                const orderId = this.generateOrderId();
                console.log('🆔 Generated orderId:', orderId);
                
                const order = new Order({
                    orderId,
                    userId: payment.userId,
                    product: {
                        productId: item.productId,
                        productType, // dùng loại đã xác định
                        title: item.title,
                        price: item.price,
                        quantity: item.quantity || 1
                    },
                    totalAmount: item.price * (item.quantity || 1),
                    status: 'paid',
                    paymentInfo: {
                        paymentId: payment._id,
                        transactionCode: payment.transactionCode,
                        paymentDate: payment.paymentDate
                    }
                });
                
                // Lưu order trước
                console.log('💾 Saving order:', order.orderId);
                await order.save();
                console.log('✅ Order saved successfully:', order.orderId);
                orders.push(order);
                
                // Tạo DeliveryInfo riêng cho source code
                if (productType === 'source-code') {
                    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày

                    // Lấy snapshot file tại thời điểm tạo đơn (dùng file gốc nếu không có snapshot riêng)
                    let sourceFileId = null;
                    let fileName = null;
                    try {
                        const scDoc = await SourceCode.findById(item.productId).select('sourceCodeFile name slug');
                        if (scDoc && scDoc.sourceCodeFile) {
                            sourceFileId = scDoc.sourceCodeFile;
                            fileName = scDoc.name ? `${scDoc.name}.zip` : null;
                        }
                    } catch (e) {
                        console.warn('⚠️ Không thể lấy source file id từ SourceCode:', e?.message);
                    }

                    await DeliveryInfo.create({
                        orderId: order.orderId,
                        userId: payment.userId,
                        productId: item.productId,
                        sourceFileId,
                        fileName,
                        downloadCount: 0,
                        maxDownloads: 5,
                        expiresAt,
                        lastDownloadAt: null,
                        paymentId: payment._id
                    });
                    console.log('📁 Created DeliveryInfo for source-code');
                }
            }
            
            console.log('🎉 Created', orders.length, 'orders from payment:', payment.orderId);
            return orders;
        } catch (error) {
            console.error('❌ Error in createOrdersFromPayment:', error.message);
            console.error('❌ Error stack:', error.stack);
            throw new Error(`Lỗi tạo đơn hàng: ${error.message}`);
        }
    }
    
    // Tạo mã đơn hàng unique
    generateOrderId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `ORD_${timestamp}_${random}`;
    }
    
    // Lấy đơn hàng theo orderId
    async getOrderById(orderId) {
        try {
            const order = await Order.findOne({ orderId })
                .populate('userId', 'name email')
                .populate('paymentInfo.paymentId');
            
            if (!order) {
                throw new Error('Không tìm thấy đơn hàng');
            }
            
            return order;
        } catch (error) {
            throw new Error(`Lỗi lấy thông tin đơn hàng: ${error.message}`);
        }
    }
    
    // Lấy danh sách đơn hàng của user
    async getUserOrders(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const orders = await Order.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email')
                .populate('paymentInfo.paymentId');
                
            const total = await Order.countDocuments({ userId });
            
            return {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Lỗi lấy danh sách đơn hàng: ${error.message}`);
        }
    }
    
    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        try {
            const order = await Order.findOneAndUpdate(
                { orderId },
                { status },
                { new: true }
            );
            
            if (!order) {
                throw new Error('Không tìm thấy đơn hàng');
            }
            
            return order;
        } catch (error) {
            throw new Error(`Lỗi cập nhật trạng thái đơn hàng: ${error.message}`);
        }
    }
    
    // Cập nhật thông tin download cho source code (DeliveryInfo)
    async updateDownloadInfo(orderId, downloadCount) {
        try {
            const info = await DeliveryInfo.findOneAndUpdate(
                { orderId },
                { 
                    downloadCount,
                    lastDownloadAt: new Date()
                },
                { new: true }
            );
            
            if (!info) {
                throw new Error('Không tìm thấy thông tin download');
            }
            
            return info;
        } catch (error) {
            throw new Error(`Lỗi cập nhật thông tin download: ${error.message}`);
        }
    }
    
    // Lấy đơn hàng account chưa có thông tin đăng nhập (cho admin)
    async getPendingAccountOrders(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const orders = await Order.find({
                'product.productType': 'account',
                status: { $in: ['paid', 'processing'] }
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email')
                .populate('paymentInfo.paymentId');
                
            const total = await Order.countDocuments({
                'product.productType': 'account',
                status: { $in: ['paid', 'processing'] }
            });
            
            return {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Lỗi lấy danh sách đơn hàng account: ${error.message}`);
        }
    }
    
    // Cập nhật thông tin account cho đơn hàng - chuyển sang dùng UserAccountInfo
    async updateAccountInfo(orderId, accountInfo) {
        try {
            // Tìm order account
            const order = await Order.findOne({ orderId, 'product.productType': 'account' });
            if (!order) {
                throw new Error('Không tìm thấy đơn hàng account');
            }
            
            // Tìm hoặc tạo UserAccountInfo
            let userAccount = await UserAccountInfo.findOne({
                userId: order.userId,
                orderId: order.orderId,
                productId: order.product.productId
            });
            
            if (!userAccount) {
                userAccount = await UserAccountInfo.createFromOrder({
                    userId: order.userId,
                    orderId: order.orderId,
                    productId: order.product.productId,
                    productName: order.product.title
                });
            }
            
            // Cập nhật thông tin đăng nhập
            userAccount.username = accountInfo.username;
            userAccount.password = accountInfo.password;
            if (accountInfo.email !== undefined) userAccount.email = accountInfo.email;
            if (accountInfo.additionalInfo !== undefined) userAccount.additionalInfo = accountInfo.additionalInfo;
            userAccount.isReady = true;
            await userAccount.save();
            
            // Cập nhật trạng thái đơn hàng
            order.status = 'completed';
            await order.save();
            
            return order;
        } catch (error) {
            throw new Error(`Lỗi cập nhật thông tin account: ${error.message}`);
        }
    }
}

module.exports = new OrderService();