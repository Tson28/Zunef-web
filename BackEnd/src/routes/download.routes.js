const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/download.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes cho download source code
router.get(
  '/source-code/:orderId',
  authMiddleware.authenticateToken,
  downloadController.downloadSourceCode.bind(downloadController)
);
router.get(
  '/info/:orderId',
  authMiddleware.authenticateToken,
  downloadController.getDownloadInfo.bind(downloadController)
);

module.exports = router;