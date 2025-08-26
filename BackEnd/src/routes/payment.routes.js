const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Public routes
// Webhook từ SePay (không cần authentication)
router.post('/webhook/sepay', paymentController.sepayWebhook);

// Protected routes (cần authentication)
// Tạo đơn hàng thanh toán
router.post('/create', authenticateToken, paymentController.createPayment);

// Lấy thông tin thanh toán theo orderId
router.get('/order/:orderId', authenticateToken, paymentController.getPayment);

// Kiểm tra trạng thái thanh toán theo transactionCode
router.get('/status/:transactionCode', authenticateToken, paymentController.checkPaymentStatus);

// Kiểm tra trạng thái thanh toán theo orderId
router.get('/status/order/:orderId', authenticateToken, paymentController.checkPaymentStatusByOrderId);

// Lấy danh sách thanh toán của user
router.get('/my-payments', authenticateToken, paymentController.getUserPayments);

// Hủy đơn hàng
router.put('/cancel/:orderId', authenticateToken, paymentController.cancelPayment);

// Tạo lại QR code
router.put('/regenerate-qr/:orderId', authenticateToken, paymentController.regenerateQR);

// Admin routes (cần admin role)
router.get('/admin/all', 
    authenticateToken, 
    requireAdmin, 
    paymentController.getAllPayments
);

module.exports = router;