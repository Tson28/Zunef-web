const Category = require('../models/category.model');

// Create a new category
const createCategory = async (categoryData) => {
    try {
        const category = new Category(categoryData);
        return await category.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Category name or slug already exists');
        }
        throw error;
    }
};

// Get all categories with optional pagination and search
const getCategories = async (options = {}) => {
    const { page, limit, search, isActive } = options;

    const query = {};
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    if (isActive !== undefined) {
        query.isActive = isActive;
    }

    // If page or limit not provided, return full list
    if (!page || !limit) {
        const items = await Category.find(query).sort({ sortOrder: 1, createdAt: -1 });
        return items;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);

    const [items, total] = await Promise.all([
        Category.find(query)
            .sort({ sortOrder: 1, createdAt: -1 })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize),
        Category.countDocuments(query),
    ]);

    return {
        items,
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
    };
};

// Get category by ID
const getCategoryById = async (id) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
};

// Get category by slug
const getCategoryBySlug = async (slug) => {
    const category = await Category.findOne({ slug });
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
};

// Update category
const updateCategory = async (id, updateData) => {
    try {
        const category = await Category.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Category name or slug already exists');
        }
        throw error;
    }
};

// Delete category
const deleteCategory = async (id) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
};

// Get active categories only
const getActiveCategories = async () => {
    return await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    getActiveCategories
};