const SourceCode = require('../models/sourceCode.model');
const mongoose = require('mongoose');

// Create a new source code item
const createSourceCode = async (payload) => {
    const {
        name,
        price,
        discountPercent,
        thumbnailImage,
        videoPreview,
        videoTutorial,
        imagePreview,
        policy,
        description,
        sourceCodeFile,
        slug,
        isActive,
        tags,
        category,
        createdBy
    } = payload;

    try {
        // Check if slug already exists
        if (slug) {
            const existingSourceCode = await SourceCode.findOne({ slug });
            if (existingSourceCode) {
                const err = new Error('Slug đã tồn tại!');
                err.status = 409;
                throw err;
            }
        }

        const doc = await SourceCode.create({
            name,
            price,
            discountPercent,
            thumbnailImage,
            videoPreview,
            videoTutorial,
            imagePreview,
            policy,
            description,
            sourceCodeFile,
            slug,
            isActive,
            tags,
            category,
            createdBy
        });

        // Populate references
        await doc.populate([
            { path: 'category', select: 'name slug' },
            { path: 'createdBy', select: 'name email' }
        ]);

        return doc;
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const err = new Error(`${field} đã tồn tại!`);
            err.status = 409;
            throw err;
        }
        throw error;
    }
};

// Get all source codes with optional pagination, search, and filtering
const getSourceCodes = async (options = {}) => {
    const { page, limit, search, category, tags, isActive, createdBy, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const query = {};
    
    // Search by name or tags
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }
    
    // Filter by category
    if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
            query.category = { $in: [category] };
        }
    }
    
    // Filter by tags
    if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
    }
    
    // Filter by active status
    if (isActive !== undefined) {
        query.isActive = isActive === 'true' || isActive === true;
    }
    
    // Filter by creator
    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
        query.createdBy = createdBy;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // If page or limit not provided, return full list
    if (!page || !limit) {
        const items = await SourceCode.find(query)
            .populate([
                { path: 'category', select: 'name slug' },
                { path: 'createdBy', select: 'name email' }
            ])
            .sort(sortOptions);
        return items;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);

    const [items, total] = await Promise.all([
        SourceCode.find(query)
            .populate([
                { path: 'category', select: 'name slug' },
                { path: 'createdBy', select: 'name email' }
            ])
            .sort(sortOptions)
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize),
        SourceCode.countDocuments(query),
    ]);

    return {
        items,
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
    };
};

// Get source code by ID
const getSourceCodeById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('ID không hợp lệ!');
        err.status = 400;
        throw err;
    }

    const sourceCode = await SourceCode.findById(id)
        .populate([
            { path: 'category', select: 'name slug' },
            { path: 'createdBy', select: 'name email' }
        ]);
    
    if (!sourceCode) {
        const err = new Error('Không tìm thấy source code!');
        err.status = 404;
        throw err;
    }
    
    return sourceCode;
};

// Get source code by slug
const getSourceCodeBySlug = async (slug) => {
    const sourceCode = await SourceCode.findOne({ slug })
        .populate([
            { path: 'category', select: 'name slug' },
            { path: 'createdBy', select: 'name email' }
        ]);
    
    if (!sourceCode) {
        const err = new Error('Không tìm thấy source code!');
        err.status = 404;
        throw err;
    }
    
    return sourceCode;
};

// Update source code by ID
const updateSourceCode = async (id, payload) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('ID không hợp lệ!');
        err.status = 400;
        throw err;
    }

    // Check if slug is being updated and already exists
    if (payload.slug) {
        const existingSourceCode = await SourceCode.findOne({ 
            slug: payload.slug, 
            _id: { $ne: id } 
        });
        if (existingSourceCode) {
            const err = new Error('Slug đã tồn tại!');
            err.status = 409;
            throw err;
        }
    }

    const updatedSourceCode = await SourceCode.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    ).populate([
        { path: 'category', select: 'name slug' },
        { path: 'createdBy', select: 'name email' }
    ]);

    if (!updatedSourceCode) {
        const err = new Error('Không tìm thấy source code để cập nhật!');
        err.status = 404;
        throw err;
    }

    return updatedSourceCode;
};

// Delete source code by ID
const deleteSourceCode = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('ID không hợp lệ!');
        err.status = 400;
        throw err;
    }

    const deletedSourceCode = await SourceCode.findByIdAndDelete(id);
    if (!deletedSourceCode) {
        const err = new Error('Không tìm thấy source code để xóa!');
        err.status = 404;
        throw err;
    }
    return deletedSourceCode;
};

// Increment view count
const incrementViewCount = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('ID không hợp lệ!');
        err.status = 400;
        throw err;
    }

    const sourceCode = await SourceCode.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
    );

    if (!sourceCode) {
        const err = new Error('Không tìm thấy source code!');
        err.status = 404;
        throw err;
    }

    return sourceCode;
};

// Increment download count
const incrementDownloadCount = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('ID không hợp lệ!');
        err.status = 400;
        throw err;
    }

    const sourceCode = await SourceCode.findByIdAndUpdate(
        id,
        { $inc: { downloadCount: 1 } },
        { new: true }
    );

    if (!sourceCode) {
        const err = new Error('Không tìm thấy source code!');
        err.status = 404;
        throw err;
    }

    return sourceCode;
};

// Check if source code exists by name or slug
const checkSourceCodeExists = async (name, slug, excludeId = null) => {
    const query = {
        $or: [
            { name: { $regex: new RegExp(`^${name}$`, 'i') } },
            { slug: slug }
        ]
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const existingSourceCode = await SourceCode.findOne(query);
    return !!existingSourceCode;
};

module.exports = {
    createSourceCode,
    getSourceCodes,
    getSourceCodeById,
    getSourceCodeBySlug,
    updateSourceCode,
    deleteSourceCode,
    incrementViewCount,
    incrementDownloadCount,
    checkSourceCodeExists,
};