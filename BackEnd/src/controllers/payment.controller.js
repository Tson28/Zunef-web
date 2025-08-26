const paymentService = require('../services/payment.service');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');

class PaymentController {
    // Tạo đơn hàng thanh toán mới
    async createPayment(req, res) {
        try {
            const { items, customerInfo } = req.body;
            const userId = req.user.id;
            
            // Validate input
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Danh sách sản phẩm không hợp lệ'
                });
            }
            
            if (!customerInfo || !customerInfo.fullName || !customerInfo.email ) {
                return res.status(400).json({
                    success: false,
                    message: 'Thông tin khách hàng không đầy đủ'
                });
            }
            
            // Tạo đơn hàng
            const payment = await paymentService.createPayment(userId, items, customerInfo);
            
            res.status(201).json({
                success: true,
                message: 'Tạo đơn hàng thành công',
                data: {
                    orderId: payment.orderId,
                    transactionCode: payment.transactionCode,
                    amount: payment.amount,
                    qrUrl: payment.bankInfo.qrContent,
                    bankInfo: payment.bankInfo,
                    expiresAt: payment.expiresAt,
                    status: payment.status
                }
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Webhook từ SePay
    async sepayWebhook(req, res) {
        try {
            const webhookData = req.body;
            
            console.log('SePay Webhook received:', JSON.stringify(webhookData, null, 2));
            
            // Validate webhook data
            if (!webhookData.content || !webhookData.transferAmount || !webhookData.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu webhook không hợp lệ'
                });
            }
            
            // Xử lý webhook
            const result = await paymentService.processWebhook(webhookData);
            
            console.log('Payment processed successfully:', result.orderId);
            
            // Trả về response theo format SePay yêu cầu
            res.status(200).json({
                message: 'Payment processed successfully',
                status: 'success'
            });
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).json({
                message: 'Payment processing failed',
                status: 'error',
                error: error.message
            });
        }
    }
    
    // Lấy thông tin thanh toán theo orderId
    async getPayment(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            const payment = await paymentService.getPaymentByOrderId(orderId);
            
            // Kiểm tra quyền truy cập
            if (payment.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập đơn hàng này'
                });
            }
            
            res.status(200).json({
                success: true,
                data: payment
            });
        } catch (error) {
            console.error('Error getting payment:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Kiểm tra trạng thái thanh toán
    async checkPaymentStatus(req, res) {
        try {
            const { transactionCode } = req.params;
            const userId = req.user.id;
            
            const payment = await paymentService.getPaymentByTransactionCode(transactionCode);
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy giao dịch'
                });
            }
            
            // Kiểm tra quyền truy cập
            if (payment.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập giao dịch này'
                });
            }
            
            res.status(200).json({
                success: true,
                data: {
                    orderId: payment.orderId,
                    transactionCode: payment.transactionCode,
                    status: payment.status,
                    amount: payment.amount,
                    paymentDate: payment.paymentDate,
                    expiresAt: payment.expiresAt
                }
            });
        } catch (error) {
            console.error('Error checking payment status:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Kiểm tra trạng thái thanh toán theo orderId
    async checkPaymentStatusByOrderId(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            const payment = await paymentService.getPaymentByOrderId(orderId);
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng'
                });
            }
            
            // Kiểm tra quyền truy cập
            if (payment.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập đơn hàng này'
                });
            }
            
            res.status(200).json({
                success: true,
                data: {
                    orderId: payment.orderId,
                    transactionCode: payment.transactionCode,
                    status: payment.status,
                    amount: payment.amount,
                    paymentDate: payment.paymentDate,
                    expiresAt: payment.expiresAt
                }
            });
        } catch (error) {
            console.error('Error checking payment status by orderId:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Lấy danh sách thanh toán của user
    async getUserPayments(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            
            const result = await paymentService.getUserPayments(userId, parseInt(page), parseInt(limit));
            
            res.status(200).json({
                success: true,
                data: result.payments,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error getting user payments:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Hủy đơn hàng
    async cancelPayment(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            const payment = await paymentService.cancelPayment(orderId, userId);
            
            res.status(200).json({
                success: true,
                message: 'Hủy đơn hàng thành công',
                data: payment
            });
        } catch (error) {
            console.error('Error cancelling payment:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Admin: Lấy tất cả thanh toán
    async getAllPayments(req, res) {
        try {
            const { page = 1, limit = 20, status, userId } = req.query;
            
            let filter = {};
            if (status) filter.status = status;
            if (userId) filter.userId = userId;
            
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            const payments = await Payment.find(filter)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
                
            const total = await Payment.countDocuments(filter);
            
            res.status(200).json({
                success: true,
                data: payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Error getting all payments:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Tạo QR code mới cho đơn hàng
    async regenerateQR(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            const payment = await paymentService.getPaymentByOrderId(orderId);
            
            // Kiểm tra quyền truy cập
            if (payment.userId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập đơn hàng này'
                });
            }
            
            // Chỉ cho phép tạo lại QR cho đơn hàng pending
            if (payment.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể tạo lại QR cho đơn hàng này'
                });
            }
            
            // Tạo QR mới
            const qrUrl = paymentService.generateSepayQRUrl(payment.amount, `ZUNEF_${payment.transactionCode}`);
            payment.bankInfo.qrContent = qrUrl;
            await payment.save();
            
            res.status(200).json({
                success: true,
                message: 'Tạo QR code mới thành công',
                data: {
                    qrUrl,
                    transactionCode: payment.transactionCode,
                    amount: payment.amount
                }
            });
        } catch (error) {
            console.error('Error regenerating QR:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new PaymentController();