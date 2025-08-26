const User = require('../models/user.model');
const SourceCode = require('../models/sourceCode.model');
const jwt = require('jsonwebtoken');

// Middleware kiểm tra quyền ownership cho source code
const checkOwnership = async (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không có token xác thực'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Lấy productId từ params hoặc body
        const productId = req.params.id || req.body.productId;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy productId'
            });
        }

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Kiểm tra quyền ownership
        if (!user.ownership.includes(productId)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập source code này. Vui lòng mua để sử dụng.'
            });
        }

        // Thêm thông tin user vào request
        req.user = user;
        req.productId = productId;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: `Lỗi kiểm tra quyền truy cập: ${error.message}`
        });
    }
};

// Middleware kiểm tra quyền admin hoặc ownership
const checkAdminOrOwnership = async (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không có token xác thực'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Nếu là admin thì cho phép truy cập
        if (user.role === 'admin') {
            req.user = user;
            return next();
        }

        // Nếu không phải admin, kiểm tra ownership
        const productId = req.params.id || req.body.productId;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy productId'
            });
        }

        // Kiểm tra quyền ownership
        if (!user.ownership.includes(productId)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập source code này. Vui lòng mua để sử dụng.'
            });
        }

        // Thêm thông tin user vào request
        req.user = user;
        req.productId = productId;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: `Lỗi kiểm tra quyền truy cập: ${error.message}`
        });
    }
};

// Middleware kiểm tra quyền ownership cho file source code
const checkSourceCodeFileOwnership = async (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không có token xác thực'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Lấy fileId từ params
        const fileId = req.params.id;
        
        if (!fileId) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy file ID'
            });
        }

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Kiểm tra xem user có phải admin không
        if (user.role === 'admin') {
            req.user = user;
            return next();
        }

        // Tìm source code có chứa file này
        const sourceCode = await SourceCode.findOne({ sourceCodeFile: fileId });
        
        if (!sourceCode) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy source code tương ứng với file này'
            });
        }

        // Kiểm tra quyền ownership
        if (!user.ownership.includes(sourceCode._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập source code này. Vui lòng mua để sử dụng.'
            });
        }

        // Thêm thông tin user và sourceCode vào request
        req.user = user;
        req.sourceCode = sourceCode;
        next();
        
    } catch (error) {
        console.error('Error in checkSourceCodeFileOwnership middleware:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token đã hết hạn'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: `Lỗi kiểm tra quyền truy cập: ${error.message}`
        });
    }
};

module.exports = {
    checkOwnership,
    checkAdminOrOwnership,
    checkSourceCodeFileOwnership
};