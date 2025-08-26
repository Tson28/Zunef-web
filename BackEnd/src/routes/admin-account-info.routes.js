const express = require('express');
const router = express.Router();
const adminAccountInfoController = require('../controllers/admin-account-info.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes cho admin quản lý UserAccountInfo

// Lấy danh sách tài khoản với phân trang và tìm kiếm
router.get('/', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireAdmin, 
  adminAccountInfoController.getAccountInfoList
);

// Lấy chi tiết một tài khoản
router.get('/:id', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireAdmin, 
  adminAccountInfoController.getAccountDetail
);

// Cập nhật thông tin tài khoản
router.put('/:id', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireAdmin, 
  adminAccountInfoController.updateAccountInfo
);

// Đánh dấu tài khoản sẵn sàng
router.put('/:id/ready', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireAdmin, 
  adminAccountInfoController.markAccountReady
);

// Xóa tài khoản
router.delete('/:id', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireAdmin, 
  adminAccountInfoController.deleteAccount
);

// Lấy thống kê tài khoản
router.get('/stats/overview', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireAdmin, 
  adminAccountInfoController.getAccountStats
);

module.exports = router;