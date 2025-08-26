const validateAccountData = (req, res, next) => {
    const { name, price } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập tên tài khoản!'
        });
    }
    
    if (price === undefined || price === null || price < 0) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập giá tiền hợp lệ!'
        });
    }
    
    // Sanitize data
    req.body.name = name.trim();
    req.body.price = parseFloat(price);
    
    // Set defaults for optional fields
    req.body.Discount = req.body.Discount || 0;
    req.body.stock = req.body.stock || 0;
    req.body.category = req.body.category || [];
    req.body.imagepreview = req.body.imagepreview || [];
    req.body.videopreview = req.body.videopreview || [];
    req.body.policy = req.body.policy || [];
    req.body.description = req.body.description || [];
    
    next();
};

const validateAccountId = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || id.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Thiếu ID tài khoản!'
        });
    }
    
    // Basic MongoDB ObjectId validation
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID tài khoản không hợp lệ!'
        });
    }
    
    next();
};

const validatePaginationQuery = (req, res, next) => {
    const { page, limit } = req.query;
    
    if (page) {
        const pageNum = parseInt(page, 10);
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                success: false,
                message: 'Số trang phải là số nguyên dương!'
            });
        }
        req.query.page = pageNum;
    }
    
    if (limit) {
        const limitNum = parseInt(limit, 10);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: 'Giới hạn phải từ 1 đến 100!'
            });
        }
        req.query.limit = limitNum;
    }
    
    next();
};

module.exports = {
    validateAccountData,
    validateAccountId,
    validatePaginationQuery
};