const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes cho user
router.get('/my-orders', authMiddleware.authenticateToken, orderController.getUserOrders);
router.get('/:orderId', authMiddleware.authenticateToken, orderController.getOrderById);

// Routes cho admin
router.put('/:orderId/status', 
    authMiddleware.authenticateToken, 
    authMiddleware.requireAdmin, 
    orderController.updateOrderStatus
);

router.get('/admin/pending-accounts', 
    authMiddleware.authenticateToken, 
    authMiddleware.requireAdmin, 
    orderController.getPendingAccountOrders
);

router.put('/:orderId/account-info', 
    authMiddleware.authenticateToken, 
    authMiddleware.requireAdmin, 
    orderController.updateAccountInfo
);

module.exports = router;