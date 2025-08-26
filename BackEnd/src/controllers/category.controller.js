const {
    createCategory,
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    getActiveCategories
} = require('../services/category.service');

// Create category controller
const CreateCategoryService = async (req, res) => {
    try {
        const categoryData = {
            name: req.body.name,
            description: req.body.description,
            slug: req.body.slug,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
            sortOrder: req.body.sortOrder || 0
        };

        const category = await createCategory(categoryData);
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create category'
        });
    }
};

// Get all categories controller
const GetAllCategoriesService = async (req, res) => {
    try {
        const { page, limit, search, isActive } = req.query;
        
        const options = {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            search,
            isActive: isActive !== undefined ? isActive === 'true' : undefined
        };

        const result = await getCategories(options);
        
        if (page && limit) {
            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully',
                data: result.items,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully',
                data: result,
                count: result.length
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve categories'
        });
    }
};

// Get category by ID controller
const GetCategoryByIdService = async (req, res) => {
    try {
        const category = await getCategoryById(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            data: category
        });
    } catch (error) {
        const statusCode = error.message === 'Category not found' ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to retrieve category'
        });
    }
};

// Get category by slug controller
const GetCategoryBySlugService = async (req, res) => {
    try {
        const category = await getCategoryBySlug(req.params.slug);
        
        res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            data: category
        });
    } catch (error) {
        const statusCode = error.message === 'Category not found' ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to retrieve category'
        });
    }
};

// Update category controller
const UpdateCategoryService = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            slug: req.body.slug,
            isActive: req.body.isActive,
            sortOrder: req.body.sortOrder
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const category = await updateCategory(req.params.id, updateData);
        
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        const statusCode = error.message === 'Category not found' ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to update category'
        });
    }
};

// Delete category controller
const DeleteCategoryService = async (req, res) => {
    try {
        await deleteCategory(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        const statusCode = error.message === 'Category not found' ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to delete category'
        });
    }
};

// Get active categories controller
const GetActiveCategoriesService = async (req, res) => {
    try {
        const categories = await getActiveCategories();
        
        res.status(200).json({
            success: true,
            message: 'Active categories retrieved successfully',
            data: categories,
            count: categories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve active categories'
        });
    }
};

module.exports = {
    CreateCategoryService,
    GetAllCategoriesService,
    GetCategoryByIdService,
    GetCategoryBySlugService,
    UpdateCategoryService,
    DeleteCategoryService,
    GetActiveCategoriesService
};