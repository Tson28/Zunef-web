const express = require('express');
const router = express.Router();
const {
    CreateCategoryService,
    GetAllCategoriesService,
    GetCategoryByIdService,
    GetCategoryBySlugService,
    UpdateCategoryService,
    DeleteCategoryService,
    GetActiveCategoriesService
} = require('../controllers/category.controller');
const {
    validateCategoryData,
    validateCategoryId,
    validateCategorySlug,
    validatePaginationQuery
} = require('../middlewares/category.validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Category ID
 *         name:
 *           type: string
 *           description: Category name
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Category description
 *           maxLength: 500
 *         slug:
 *           type: string
 *           description: URL-friendly category identifier
 *         isActive:
 *           type: boolean
 *           description: Whether the category is active
 *           default: true
 *         sortOrder:
 *           type: number
 *           description: Sort order for displaying categories
 *           default: 0
 *         
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/category/create:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 description: Category description
 *                 maxLength: 500
 *               slug:
 *                 type: string
 *                 description: URL-friendly identifier (auto-generated if not provided)
 *               isActive:
 *                 type: boolean
 *                 description: Whether the category is active
 *                 default: true
 *               sortOrder:
 *                 type: number
 *                 description: Sort order for displaying categories
 *                 default: 0
 *               
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.post('/create', validateCategoryData, CreateCategoryService);

/**
 * @swagger
 * /api/category/getall:
 *   get:
 *     summary: Get all categories with optional pagination and filtering
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for category name
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         total:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *                     count:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
router.get('/getall', validatePaginationQuery, GetAllCategoriesService);

/**
 * @swagger
 * /api/category/active:
 *   get:
 *     summary: Get all active categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Active categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 count:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/active', GetActiveCategoriesService);

/**
 * @swagger
 * /api/category/get/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get('/get/:id', validateCategoryId, GetCategoryByIdService);

/**
 * @swagger
 * /api/category/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid category slug
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get('/slug/:slug', validateCategorySlug, GetCategoryBySlugService);

/**
 * @swagger
 * /api/category/update/{id}:
 *   put:
 *     summary: Update category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 description: Category description
 *                 maxLength: 500
 *               slug:
 *                 type: string
 *                 description: URL-friendly identifier
 *               isActive:
 *                 type: boolean
 *                 description: Whether the category is active
 *               sortOrder:
 *                 type: number
 *                 description: Sort order for displaying categories
 *               
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:id', validateCategoryId, validateCategoryData, UpdateCategoryService);

/**
 * @swagger
 * /api/category/delete/{id}:
 *   delete:
 *     summary: Delete category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', validateCategoryId, DeleteCategoryService);

module.exports = router;