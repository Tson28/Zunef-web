const express = require('express');
const router = express.Router();
const {
  CreateSourceCodeService,
  GetAllSourceCodeService,
  GetSourceCodeByIdService,
  GetSourceCodeBySlugService,
  UpdateSourceCodeService,
  DeleteSourceCodeService,
  IncrementViewCountService,
  IncrementDownloadCountService
} = require('../controllers/sourceCode.controller');
const {
  validateSourceCodeData,
  validateSourceCodeId,
  validateSourceCodeSlug,
  validatePaginationQuery,
  validateSourceCodeUpdateData
} = require('../middlewares/sourceCode.validation');
const {
  uploadSourceCodeFields,
  handleSourceCodeUploadError,
  validateSourceCodeFileRequired
} = require('../middlewares/sourceCodeUpload.middleware');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middlewares/auth.middleware');
const { checkAdminOrOwnership } = require('../middlewares/ownership.middleware');

/**
 * @swagger
 * /api/sourcecode/create:
 *   post:
 *     summary: Create a new source code with file uploads
 *     tags: [SourceCode]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - sourceCodeFile
 *               - createdBy
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *                 description: Source code name
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Source code price
 *               discountPercent:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 0
 *                 description: Discount percentage
 *               thumbnailImage:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image file
 *               imagePreview:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Preview image files (max 10)
 *               videoPreview:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Preview video files (max 5)
 *               videoTutorial:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Tutorial video files (max 5)
 *               sourceCodeFile:
 *                 type: string
 *                 format: binary
 *                 description: Source code file (required)
 *               policy:
 *                 type: string
 *                 description: Policies (comma-separated values, e.g., "Bảo hành 2 tháng,Free support")
 *               description:
 *                 type: string
 *                 description: Descriptions (comma-separated values, e.g., "Feature 1,Feature 2")
 *               tags:
 *                 type: string
 *                 description: Tags (comma-separated values, e.g., "React,JavaScript,Frontend")
 *               category:
 *                 type: string
 *                 description: Category IDs (comma-separated values)
 *               createdBy:
 *                 type: string
 *                 description: User ID who created this source code
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the source code is active
 *     responses:
 *       201:
 *         description: Source code created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/create', 
  authenticateToken,
  requireAdmin,
  uploadSourceCodeFields(), 
  validateSourceCodeData, 
  validateSourceCodeFileRequired,
  CreateSourceCodeService, 
  handleSourceCodeUploadError
);

/**
 * @swagger
 * /api/sourcecode/getall:
 *   get:
 *     summary: Get all source codes with optional pagination and filtering
 *     tags: [SourceCode]
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
 *         description: Search term for source code name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator user ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt, viewCount, downloadCount]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Source codes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/PaginationResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SourceCode'
 *                     count:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
router.get('/getall', validatePaginationQuery, GetAllSourceCodeService);

/**
 * @swagger
 * /api/sourcecode/get/{id}:
 *   get:
 *     summary: Get source code by ID
 *     tags: [SourceCode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source code ID
 *     responses:
 *       200:
 *         description: Source code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid source code ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Source code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/get/:id', validateSourceCodeId, checkAdminOrOwnership, GetSourceCodeByIdService);

/**
 * @swagger
 * /api/sourcecode/slug/{slug}:
 *   get:
 *     summary: Get source code by slug
 *     tags: [SourceCode]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Source code slug
 *     responses:
 *       200:
 *         description: Source code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid slug format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Source code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/slug/:slug', validateSourceCodeSlug, GetSourceCodeBySlugService);

/**
 * @swagger
 * /api/sourcecode/update/{id}:
 *   put:
 *     summary: Update source code by ID
 *     tags: [SourceCode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source code ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *                 description: Source code name
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Source code price
 *               discountPercent:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Discount percentage
 *               thumbnailImage:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image file
 *               imagePreview:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Preview image files (max 10)
 *               videoPreview:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Preview video files (max 5)
 *               videoTutorial:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Tutorial video files (max 5)
 *               sourceCodeFile:
 *                 type: string
 *                 format: binary
 *                 description: Source code file
 *               policy:
 *                 type: string
 *                 description: Policies (comma-separated values)
 *               description:
 *                 type: string
 *                 description: Descriptions (comma-separated values)
 *               tags:
 *                 type: string
 *                 description: Tags (comma-separated values)
 *               category:
 *                 type: string
 *                 description: Category IDs (comma-separated values)
 *               isActive:
 *                 type: boolean
 *                 description: Whether the source code is active
 *     responses:
 *       200:
 *         description: Source code updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Source code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.put('/update/:id', 
  authenticateToken,
  requireAdmin,
  uploadSourceCodeFields(), 
  validateSourceCodeId, 
  validateSourceCodeUpdateData, 
  UpdateSourceCodeService, 
  handleSourceCodeUploadError
);

/**
 * @swagger
 * /api/sourcecode/delete/{id}:
 *   delete:
 *     summary: Delete source code by ID
 *     tags: [SourceCode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source code ID
 *     responses:
 *       200:
 *         description: Source code deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid source code ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Source code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', authenticateToken, requireAdmin, validateSourceCodeId, DeleteSourceCodeService);

/**
 * @swagger
 * /api/sourcecode/view/{id}:
 *   patch:
 *     summary: Increment view count for source code
 *     tags: [SourceCode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source code ID
 *     responses:
 *       200:
 *         description: View count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid source code ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Source code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.patch('/view/:id', validateSourceCodeId, IncrementViewCountService);

/**
 * @swagger
 * /api/sourcecode/download/{id}:
 *   patch:
 *     summary: Increment download count for source code
 *     tags: [SourceCode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source code ID
 *     responses:
 *       200:
 *         description: Download count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid source code ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Source code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.patch('/download/:id', validateSourceCodeId, IncrementDownloadCountService);

module.exports = router;