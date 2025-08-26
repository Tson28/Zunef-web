const SourceCodeService = require('../services/sourceCode.service');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const path = require('path');

// Khởi tạo GridFS Bucket
let bucket;
mongoose.connection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

// Helper function to upload file to GridFS
const uploadFileToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        originalName: file.originalname,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      }
    });

    uploadStream.end(file.buffer);

    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.on('error', reject);
  });
};

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

const CreateSourceCodeService = async (req, res) => {
    try {
        if (!bucket) {
            return res.status(500).json({
                success: false,
                message: 'GridFS not initialized'
            });
        }

        // Xử lý file uploads
        const sourceCodeData = { ...req.body };
        
        // Xử lý array fields từ form data
        if (sourceCodeData.policy && typeof sourceCodeData.policy === 'string') {
            sourceCodeData.policy = sourceCodeData.policy.split(',').map(item => item.trim()).filter(item => item);
        }
        if (sourceCodeData.description && typeof sourceCodeData.description === 'string') {
            sourceCodeData.description = sourceCodeData.description.split(',').map(item => item.trim()).filter(item => item);
        }
        if (sourceCodeData.tags && typeof sourceCodeData.tags === 'string') {
            sourceCodeData.tags = sourceCodeData.tags.split(',').map(item => item.trim()).filter(item => item);
        }
        if (sourceCodeData.category && typeof sourceCodeData.category === 'string') {
            sourceCodeData.category = sourceCodeData.category.split(',').map(item => item.trim()).filter(item => item);
        }
        
        // Generate slug if not provided
        if (!sourceCodeData.slug && sourceCodeData.name) {
            sourceCodeData.slug = generateSlug(sourceCodeData.name);
        }
        
        // Set createdBy from authenticated user
        if (req.user && req.user._id) {
            sourceCodeData.createdBy = req.user._id;
        }
        
        if (req.files) {
            // Xử lý thumbnailImage
            if (req.files.thumbnailImage && req.files.thumbnailImage[0]) {
                const thumbnailId = await uploadFileToGridFS(req.files.thumbnailImage[0]);
                sourceCodeData.thumbnailImage = thumbnailId;
            }
            
            // Xử lý imagePreview
            if (req.files.imagePreview && req.files.imagePreview.length > 0) {
                const imageIds = await Promise.all(
                    req.files.imagePreview.map(file => uploadFileToGridFS(file))
                );
                sourceCodeData.imagePreview = imageIds;
            }
            
            // Xử lý videoPreview
            if (req.files.videoPreview && req.files.videoPreview.length > 0) {
                const videoIds = await Promise.all(
                    req.files.videoPreview.map(file => uploadFileToGridFS(file))
                );
                sourceCodeData.videoPreview = videoIds;
            }
            
            // Xử lý videoTutorial
            if (req.files.videoTutorial && req.files.videoTutorial.length > 0) {
                const tutorialIds = await Promise.all(
                    req.files.videoTutorial.map(file => uploadFileToGridFS(file))
                );
                sourceCodeData.videoTutorial = tutorialIds;
            }
            
            // Xử lý sourceCodeFile (required)
            if (req.files.sourceCodeFile && req.files.sourceCodeFile[0]) {
                const sourceFileId = await uploadFileToGridFS(req.files.sourceCodeFile[0]);
                sourceCodeData.sourceCodeFile = sourceFileId;
            }
        }
        
        const newSourceCode = await SourceCodeService.createSourceCode(sourceCodeData);
        return res.status(201).json({
            success: true,
            message: "Tạo source code thành công!",
            data: newSourceCode
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi tạo source code'
        });
    }
};

const GetAllSourceCodeService = async (req, res) => {
    try {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            category: req.query.category,
            tags: req.query.tags,
            isActive: req.query.isActive,
            createdBy: req.query.createdBy,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder
        };
        
        const result = await SourceCodeService.getSourceCodes(options);
        
        if (Array.isArray(result)) {
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách source code thành công!",
                data: result,
                count: result.length
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách source code thành công!",
                data: result.items,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });
        }
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi lấy danh sách source code'
        });
    }
};

const GetSourceCodeByIdService = async (req, res) => {
    try {
        const { id } = req.params;
        const sourceCode = await SourceCodeService.getSourceCodeById(id);
        
        return res.status(200).json({
            success: true,
            message: "Lấy thông tin source code thành công!",
            data: sourceCode
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi lấy thông tin source code'
        });
    }
};

const GetSourceCodeBySlugService = async (req, res) => {
    try {
        const { slug } = req.params;
        const sourceCode = await SourceCodeService.getSourceCodeBySlug(slug);
        
        return res.status(200).json({
            success: true,
            message: "Lấy thông tin source code thành công!",
            data: sourceCode
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi lấy thông tin source code'
        });
    }
};

const UpdateSourceCodeService = async (req, res) => {
    try {
        if (!bucket) {
            return res.status(500).json({
                success: false,
                message: 'GridFS not initialized'
            });
        }

        const { id } = req.params;
        const updateData = { ...req.body };
        
        // Xử lý array fields từ form data
        if (updateData.policy && typeof updateData.policy === 'string') {
            updateData.policy = updateData.policy.split(',').map(item => item.trim()).filter(item => item);
        }
        if (updateData.description && typeof updateData.description === 'string') {
            updateData.description = updateData.description.split(',').map(item => item.trim()).filter(item => item);
        }
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(item => item.trim()).filter(item => item);
        }
        if (updateData.category && typeof updateData.category === 'string') {
            updateData.category = updateData.category.split(',').map(item => item.trim()).filter(item => item);
        }
        
        // Generate slug if name is updated but slug is not provided
        if (updateData.name && !updateData.slug) {
            updateData.slug = generateSlug(updateData.name);
        }
        
        if (req.files) {
            // Xử lý thumbnailImage
            if (req.files.thumbnailImage && req.files.thumbnailImage[0]) {
                const thumbnailId = await uploadFileToGridFS(req.files.thumbnailImage[0]);
                updateData.thumbnailImage = thumbnailId;
            }
            
            // Xử lý imagePreview
            if (req.files.imagePreview && req.files.imagePreview.length > 0) {
                const imageIds = await Promise.all(
                    req.files.imagePreview.map(file => uploadFileToGridFS(file))
                );
                updateData.imagePreview = imageIds;
            }
            
            // Xử lý videoPreview
            if (req.files.videoPreview && req.files.videoPreview.length > 0) {
                const videoIds = await Promise.all(
                    req.files.videoPreview.map(file => uploadFileToGridFS(file))
                );
                updateData.videoPreview = videoIds;
            }
            
            // Xử lý videoTutorial
            if (req.files.videoTutorial && req.files.videoTutorial.length > 0) {
                const tutorialIds = await Promise.all(
                    req.files.videoTutorial.map(file => uploadFileToGridFS(file))
                );
                updateData.videoTutorial = tutorialIds;
            }
            
            // Xử lý sourceCodeFile
            if (req.files.sourceCodeFile && req.files.sourceCodeFile[0]) {
                const sourceFileId = await uploadFileToGridFS(req.files.sourceCodeFile[0]);
                updateData.sourceCodeFile = sourceFileId;
            }
        }
        
        const updatedSourceCode = await SourceCodeService.updateSourceCode(id, updateData);
        
        return res.status(200).json({
            success: true,
            message: "Cập nhật source code thành công!",
            data: updatedSourceCode
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi cập nhật source code'
        });
    }
};

const DeleteSourceCodeService = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSourceCode = await SourceCodeService.deleteSourceCode(id);
        
        return res.status(200).json({
            success: true,
            message: "Xóa source code thành công!",
            data: { _id: deletedSourceCode._id }
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi xóa source code'
        });
    }
};

const IncrementViewCountService = async (req, res) => {
    try {
        const { id } = req.params;
        const sourceCode = await SourceCodeService.incrementViewCount(id);
        
        return res.status(200).json({
            success: true,
            message: "Tăng lượt xem thành công!",
            data: { viewCount: sourceCode.viewCount }
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi tăng lượt xem'
        });
    }
};

const IncrementDownloadCountService = async (req, res) => {
    try {
        const { id } = req.params;
        const sourceCode = await SourceCodeService.incrementDownloadCount(id);
        
        return res.status(200).json({
            success: true,
            message: "Tăng lượt tải thành công!",
            data: { downloadCount: sourceCode.downloadCount }
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi tăng lượt tải'
        });
    }
};

module.exports = {
    CreateSourceCodeService,
    GetAllSourceCodeService,
    GetSourceCodeByIdService,
    GetSourceCodeBySlugService,
    UpdateSourceCodeService,
    DeleteSourceCodeService,
    IncrementViewCountService,
    IncrementDownloadCountService,
};