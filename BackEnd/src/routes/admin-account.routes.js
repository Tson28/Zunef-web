const express = require('express');
const router = express.Router();
const adminAccountController = require('../controllers/admin-account.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes cho admin quản lý UserAccountInfo
router.get('/pending', authMiddleware.authenticateToken, authMiddleware.requireAdmin, adminAccountController.getPendingAccounts);
router.put('/:id/login-info', authMiddleware.authenticateToken, authMiddleware.requireAdmin, adminAccountController.updateAccountLoginInfo);
router.get('/:id/detail', authMiddleware.authenticateToken, authMiddleware.requireAdmin, adminAccountController.getAccountDetail);
router.put('/:id/ready', authMiddleware.authenticateToken, authMiddleware.requireAdmin, adminAccountController.markAccountReady);
router.get('/search', authMiddleware.authenticateToken, authMiddleware.requireAdmin, adminAccountController.searchUserAccounts);

module.exports = router;