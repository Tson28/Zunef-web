const express = require('express');
const router = express.Router();
const {CreateAccountService,GetAllAccountService,GetAccountByIdService,DeleteAccountService,UpdateAccountService} = require('../controllers/account.controller');
const {validateAccountData, validateAccountId, validatePaginationQuery} = require('../middlewares/account.validation');
const { uploadFields, handleUploadError } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * /api/account/create:
 *   post:
 *     summary: Create a new account with file uploads
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Account name
 *               price:
 *                 type: number
 *                 description: Account price
 *               Discount:
 *                 type: number
 *                 default: 0
 *                 description: Discount percentage
 *               stock:
 *                 type: number
 *                 default: 0
 *                 description: Available stock
 *               duration:
 *                 type: string
 *                 enum: [1_month, 3_months, 6_months, 1_year]
 *                 description: Account package duration
 *               category:
 *                 type: string
 *                 description: Account categories (comma-separated values, e.g., "Hot,Discount,New")
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image file
 *               imagepreview:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Preview image files (max 10)
 *               videopreview:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Preview video files (max 5)
 *               policy:
 *                 type: string
 *                 description: Account policies (comma-separated values, e.g., "Bảo hành 2 tháng,Free ship")
 *               description:
 *                 type: string
 *                 description: Account description (comma-separated values, e.g., "test 1,test 2")
 *     responses:
 *       201:
 *         description: Account created successfully
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
router.post('/create', uploadFields(), validateAccountData, CreateAccountService, handleUploadError);

/**
 * @swagger
 * /api/account/getall:
 *   get:
 *     summary: Get all accounts with optional pagination and filtering
 *     tags: [Accounts]
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
 *         description: Search term for account name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
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
 *                         $ref: '#/components/schemas/Account'
 *                     count:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
router.get('/getall', validatePaginationQuery, GetAllAccountService);

/**
 * @swagger
 * /api/account/get/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid account ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/get/:id', validateAccountId, GetAccountByIdService);

/**
 * @swagger
 * /api/account/delete/{id}:
 *   delete:
 *     summary: Delete account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid account ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', validateAccountId, DeleteAccountService);

/**
 * @swagger
 * /api/account/update/{id}:
 *   put:
 *     summary: Update account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
  *         multipart/form-data:
  *           schema:
  *             type: object
  *             properties:
  *               name:
  *                 type: string
  *                 description: Account name
  *               price:
  *                 type: number
  *                 description: Account price
  *               Discount:
  *                 type: number
  *                 description: Discount percentage
  *               stock:
  *                 type: number
  *                 description: Available stock
  *               duration:
  *                 type: string
  *                 enum: [1_month, 3_months, 6_months, 1_year]
  *                 description: Account package duration
  *               category:
  *                 type: string
  *                 description: Account categories (comma-separated values, e.g., "Hot,Discount,New")
  *               thumbnail:
  *                 type: string
  *                 format: binary
  *                 description: Thumbnail image file
  *               imagepreview:
  *                 type: array
  *                 items:
  *                   type: string
  *                   format: binary
  *                 description: Preview image files (max 10)
  *               videopreview:
  *                 type: array
  *                 items:
  *                   type: string
  *                   format: binary
  *                 description: Preview video files (max 5)
 *               policy:
 *                 type: string
 *                 description: Account policies (comma-separated values, e.g., "Bảo hành 2 tháng,Free ship")
 *               description:
 *                 type: string
 *                 description: Account description (comma-separated values, e.g., "test 1,test 2")
 *     responses:
 *       200:
 *         description: Account updated successfully
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
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.put('/update/:id', uploadFields(), validateAccountId, validateAccountData, UpdateAccountService, handleUploadError);

module.exports = router;


