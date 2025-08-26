const express = require('express');
const router = express.Router();
const accountInfoController = require('../controllers/account-info.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes cho lấy thông tin đăng nhập account
router.get('/:orderId', authMiddleware.authenticateToken, accountInfoController.getAccountInfo);
router.get('/status/:orderId', authMiddleware.authenticateToken, accountInfoController.checkAccountStatus);

module.exports = router;