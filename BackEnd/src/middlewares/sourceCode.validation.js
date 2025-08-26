const mongoose = require('mongoose');

const validateSourceCodeData = (req, res, next) => {
    const { name, price, discountPercent, sourceCodeFile } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập tên source code!'
        });
    }
    
    if (price === undefined || price === null || isNaN(price) || parseFloat(price) < 0) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập giá tiền hợp lệ (>= 0)!'
        });
    }
    
    // Validate discount percent
    if (discountPercent !== undefined && discountPercent !== null) {
        const discount = parseFloat(discountPercent);
        if (isNaN(discount) || discount < 0 || discount > 100) {
            return res.status(400).json({
                success: false,
                message: 'Phần trăm giảm giá phải từ 0 đến 100!'
            });
        }
        req.body.discountPercent = discount;
    }
    
    // Validate name length
    if (name.trim().length > 200) {
        return res.status(400).json({
            success: false,
            message: 'Tên source code không được vượt quá 200 ký tự!'
        });
    }
    
    // Validate slug if provided
    if (req.body.slug) {
        const slug = req.body.slug.trim().toLowerCase();
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return res.status(400).json({
                success: false,
                message: 'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang!'
            });
        }
        req.body.slug = slug;
    }
    
    // Validate policy array
    if (req.body.policy) {
        let policies;
        if (typeof req.body.policy === 'string') {
            policies = req.body.policy.split(',').map(item => item.trim()).filter(item => item);
        } else if (Array.isArray(req.body.policy)) {
            policies = req.body.policy;
        }
        
        if (policies) {
            for (const policy of policies) {
                if (policy.length > 500) {
                    return res.status(400).json({
                        success: false,
                        message: 'Mỗi mục chính sách không được vượt quá 500 ký tự!'
                    });
                }
            }
        }
    }
    
    // Validate description array
    if (req.body.description) {
        let descriptions;
        if (typeof req.body.description === 'string') {
            descriptions = req.body.description.split(',').map(item => item.trim()).filter(item => item);
        } else if (Array.isArray(req.body.description)) {
            descriptions = req.body.description;
        }
        
        if (descriptions) {
            for (const desc of descriptions) {
                if (desc.length > 1000) {
                    return res.status(400).json({
                        success: false,
                        message: 'Mỗi mục mô tả không được vượt quá 1000 ký tự!'
                    });
                }
            }
        }
    }
    
    // Validate category array if provided
    if (req.body.category) {
        let categories;
        if (typeof req.body.category === 'string') {
            categories = req.body.category.split(',').map(item => item.trim()).filter(item => item);
        } else if (Array.isArray(req.body.category)) {
            categories = req.body.category;
        }
        
        if (categories) {
            for (const categoryId of categories) {
                if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID danh mục không hợp lệ!'
                    });
                }
            }
        }
    }
    
    // Validate createdBy if provided
    if (req.body.createdBy && !mongoose.Types.ObjectId.isValid(req.body.createdBy)) {
        return res.status(400).json({
            success: false,
            message: 'ID người tạo không hợp lệ!'
        });
    }
    
    // Sanitize data
    req.body.name = name.trim();
    req.body.price = parseFloat(price);
    
    // Set defaults for optional fields
    req.body.discountPercent = req.body.discountPercent || 0;
    req.body.isActive = req.body.isActive !== undefined ? req.body.isActive === 'true' || req.body.isActive === true : true;
    req.body.downloadCount = 0;
    req.body.viewCount = 0;
    
    next();
};

const validateSourceCodeId = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || id.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Thiếu ID source code!'
        });
    }
    
    // MongoDB ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID source code không hợp lệ!'
        });
    }
    
    next();
};

const validateSourceCodeSlug = (req, res, next) => {
    const { slug } = req.params;
    
    if (!slug || slug.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Thiếu slug source code!'
        });
    }
    
    // Slug format validation
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return res.status(400).json({
            success: false,
            message: 'Slug không hợp lệ!'
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

const validateSourceCodeUpdateData = (req, res, next) => {
    const { name, price, discountPercent } = req.body;
    
    // Validate name if provided
    if (name !== undefined) {
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Tên source code không được để trống!'
            });
        }
        
        if (name.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: 'Tên source code không được vượt quá 200 ký tự!'
            });
        }
        
        req.body.name = name.trim();
    }
    
    // Validate price if provided
    if (price !== undefined) {
        if (isNaN(price) || parseFloat(price) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá tiền phải là số hợp lệ (>= 0)!'
            });
        }
        req.body.price = parseFloat(price);
    }
    
    // Validate discount percent if provided
    if (discountPercent !== undefined) {
        const discount = parseFloat(discountPercent);
        if (isNaN(discount) || discount < 0 || discount > 100) {
            return res.status(400).json({
                success: false,
                message: 'Phần trăm giảm giá phải từ 0 đến 100!'
            });
        }
        req.body.discountPercent = discount;
    }
    
    // Validate slug if provided
    if (req.body.slug) {
        const slug = req.body.slug.trim().toLowerCase();
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return res.status(400).json({
                success: false,
                message: 'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang!'
            });
        }
        req.body.slug = slug;
    }
    
    // Validate isActive if provided
    if (req.body.isActive !== undefined) {
        req.body.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    
    next();
};

module.exports = {
    validateSourceCodeData,
    validateSourceCodeId,
    validateSourceCodeSlug,
    validatePaginationQuery,
    validateSourceCodeUpdateData
};