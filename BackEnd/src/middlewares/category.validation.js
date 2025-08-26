const mongoose = require('mongoose');

// Validate category data for create/update operations
const validateCategoryData = (req, res, next) => {
    const { name, description, slug, isActive, sortOrder } = req.body;
    const errors = [];

    // Validate name (required)
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Category name is required and must be a non-empty string');
    } else if (name.trim().length > 100) {
        errors.push('Category name cannot exceed 100 characters');
    }

    // Validate description (optional)
    if (description !== undefined) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string');
        } else if (description.length > 500) {
            errors.push('Description cannot exceed 500 characters');
        }
    }

    // Validate slug (optional, will be auto-generated if not provided)
    if (slug !== undefined) {
        if (typeof slug !== 'string') {
            errors.push('Slug must be a string');
        } else if (!/^[a-z0-9-]+$/.test(slug)) {
            errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
        }
    }

    // Validate isActive (optional)
    if (isActive !== undefined && typeof isActive !== 'boolean') {
        errors.push('isActive must be a boolean value');
    }

    // Validate sortOrder (optional)
    if (sortOrder !== undefined) {
        const sortOrderNum = Number(sortOrder);
        if (isNaN(sortOrderNum) || !Number.isInteger(sortOrderNum)) {
            errors.push('sortOrder must be an integer');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Sanitize data
    req.body.name = name.trim();
    if (description) req.body.description = description.trim();
    if (slug) req.body.slug = slug.toLowerCase().trim();
    if (sortOrder !== undefined) req.body.sortOrder = Number(sortOrder);

    next();
};

// Validate category ID parameter
const validateCategoryId = (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Category ID is required'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid category ID format'
        });
    }

    next();
};

// Validate category slug parameter
const validateCategorySlug = (req, res, next) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
            success: false,
            message: 'Category slug is required'
        });
    }

    if (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid slug format. Slug can only contain lowercase letters, numbers, and hyphens'
        });
    }

    next();
};

// Validate pagination and search query parameters
const validatePaginationQuery = (req, res, next) => {
    const { page, limit, search, isActive } = req.query;
    const errors = [];

    // Validate page
    if (page !== undefined) {
        const pageNum = Number(page);
        if (isNaN(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
            errors.push('Page must be a positive integer');
        }
    }

    // Validate limit
    if (limit !== undefined) {
        const limitNum = Number(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100 || !Number.isInteger(limitNum)) {
            errors.push('Limit must be an integer between 1 and 100');
        }
    }

    // Validate search
    if (search !== undefined && typeof search !== 'string') {
        errors.push('Search must be a string');
    }

    // Validate isActive
    if (isActive !== undefined && !['true', 'false'].includes(isActive)) {
        errors.push('isActive must be "true" or "false"');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid query parameters',
            errors
        });
    }

    next();
};

module.exports = {
    validateCategoryData,
    validateCategoryId,
    validateCategorySlug,
    validatePaginationQuery
};