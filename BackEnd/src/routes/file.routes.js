const express = require('express');
const router = express.Router();
const {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFieldFiles,
  getFileById,
  getFileInfoById,
  deleteFileById,
  getAllFiles
} = require('../controllers/file.controller');
const {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError
} = require('../middlewares/upload.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkSourceCodeFileOwnership } = require('../middlewares/ownership.middleware');

/**
 * @swagger
 * /api/files/upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       201:
 *         description: File uploaded successfully
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
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     mimetype:
 *                       type: string
 *                     size:
 *                       type: number
 *                     uploadDate:
 *                       type: string
 *                       format: date-time
 *                     url:
 *                       type: string
 *       400:
 *         description: Bad request - no file uploaded
 *       500:
 *         description: Internal server error
 */
router.post('/upload/single', uploadSingle('file'), uploadSingleFile, handleUploadError);

/**
 * @swagger
 * /api/files/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 10)
 *     responses:
 *       201:
 *         description: Files uploaded successfully
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
 *                     type: object
 *                     properties:
 *                       fileId:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       originalName:
 *                         type: string
 *                       mimetype:
 *                         type: string
 *                       size:
 *                         type: number
 *                       uploadDate:
 *                         type: string
 *                         format: date-time
 *                       url:
 *                         type: string
 *       400:
 *         description: Bad request - no files uploaded
 *       500:
 *         description: Internal server error
 */
router.post('/upload/multiple', uploadMultiple('files', 10), uploadMultipleFiles, handleUploadError);

/**
 * @swagger
 * /api/files/upload/fields:
 *   post:
 *     summary: Upload files for different fields (thumbnail, imagepreview, videopreview)
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image (max 1)
 *               imagepreview:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Preview images (max 10)
 *               videopreview:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Preview videos (max 5)
 *     responses:
 *       201:
 *         description: Files uploaded successfully
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
 *                   type: object
 *                   properties:
 *                     thumbnail:
 *                       type: object
 *                       properties:
 *                         fileId:
 *                           type: string
 *                         filename:
 *                           type: string
 *                         originalName:
 *                           type: string
 *                         mimetype:
 *                           type: string
 *                         size:
 *                           type: number
 *                         url:
 *                           type: string
 *                     imagepreview:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fileId:
 *                             type: string
 *                           filename:
 *                             type: string
 *                           originalName:
 *                             type: string
 *                           mimetype:
 *                             type: string
 *                           size:
 *                             type: number
 *                           url:
 *                             type: string
 *                     videopreview:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fileId:
 *                             type: string
 *                           filename:
 *                             type: string
 *                           originalName:
 *                             type: string
 *                           mimetype:
 *                             type: string
 *                           size:
 *                             type: number
 *                           url:
 *                             type: string
 *       400:
 *         description: Bad request - no files uploaded
 *       500:
 *         description: Internal server error
 */
router.post('/upload/fields', uploadFields(), uploadFieldFiles, handleUploadError);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Get file by ID (download/stream)
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid file ID
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/files/sourcecode/{id}:
 *   get:
 *     summary: Download source code file (requires ownership)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source code file ID
 *     responses:
 *       200:
 *         description: Source code file content
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid file ID
 *       403:
 *         description: Access denied - ownership required
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
router.get('/sourcecode/:id', authenticateToken, checkSourceCodeFileOwnership, getFileById);

router.get('/:id', getFileById);

/**
 * @swagger
 * /api/files/info/{id}:
 *   get:
 *     summary: Get file information by ID
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File information retrieved successfully
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
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     contentType:
 *                       type: string
 *                     length:
 *                       type: number
 *                     uploadDate:
 *                       type: string
 *                       format: date-time
 *                     metadata:
 *                       type: object
 *                     url:
 *                       type: string
 *       400:
 *         description: Invalid file ID
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
router.get('/info/:id', getFileInfoById);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete file by ID
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
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
 *                   type: object
 *                   properties:
 *                     deletedFileId:
 *                       type: string
 *       400:
 *         description: Invalid file ID
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteFileById);

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: Get all files with pagination
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of files per page
 *     responses:
 *       200:
 *         description: Files retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       fileId:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       contentType:
 *                         type: string
 *                       length:
 *                         type: number
 *                       uploadDate:
 *                         type: string
 *                         format: date-time
 *                       metadata:
 *                         type: object
 *                       url:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllFiles);

module.exports = router;