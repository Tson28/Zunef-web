const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { ObjectId } = require('mongodb');
const path = require('path');

// Khởi tạo GridFS Bucket
let bucket;
mongoose.connection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

// Upload single file
const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'GridFS not initialized'
      });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
    
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        uploadedAt: new Date()
      }
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', () => {
      const fileInfo = {
        fileId: uploadStream.id,
        filename: filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadDate: new Date(),
        url: `/api/files/${uploadStream.id}`
      };

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: fileInfo
      });
    });

    uploadStream.on('error', (error) => {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error uploading file'
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file'
    });
  }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'GridFS not initialized'
      });
    }

    const uploadPromises = req.files.map(file => {
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
          resolve({
            fileId: uploadStream.id,
            filename: filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            uploadDate: new Date(),
            url: `/api/files/${uploadStream.id}`
          });
        });

        uploadStream.on('error', reject);
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading files'
    });
  }
};

// Upload files for specific fields
const uploadFieldFiles = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'GridFS not initialized'
      });
    }

    const result = {};

    // Process each field
    for (const [fieldName, files] of Object.entries(req.files)) {
      const fileArray = Array.isArray(files) ? files : [files];
      
      const uploadPromises = fileArray.map(file => {
        return new Promise((resolve, reject) => {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
          
          const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
              originalName: file.originalname,
              mimetype: file.mimetype,
              uploadedAt: new Date(),
              fieldName: fieldName
            }
          });

          uploadStream.end(file.buffer);

          uploadStream.on('finish', () => {
            resolve({
              fileId: uploadStream.id,
              filename: filename,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              url: `/api/files/${uploadStream.id}`
            });
          });

          uploadStream.on('error', reject);
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      result[fieldName] = fieldName === 'thumbnail' ? uploadedFiles[0] : uploadedFiles;
    }

    return res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading files'
    });
  }
};

// Get file by ID (download/stream)
const getFileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }

    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'GridFS not initialized'
      });
    }

    const objectId = new ObjectId(id);
    let activeBucket = bucket;
    let files = await activeBucket.find({ _id: objectId }).toArray();

    if (!files || files.length === 0) {
      // Fallback to legacy/default bucket 'fs'
      const fsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'fs' });
      files = await fsBucket.find({ _id: objectId }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      activeBucket = fsBucket;
    }

    const file = files[0];

    // Set appropriate headers
    res.set({
      'Content-Type': file.metadata?.mimetype || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${file.metadata?.originalName || file.filename}"`
    });

    // Stream file to response
    const downloadStream = activeBucket.openDownloadStream(objectId);

    downloadStream.on('error', (error) => {
      return res.status(500).json({
        success: false,
        message: 'Error streaming file'
      });
    });

    downloadStream.pipe(res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving file'
    });
  }
};

// Get file information by ID
const getFileInfoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }

    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'GridFS not initialized'
      });
    }

    const objectId = new ObjectId(id);
    let activeBucket = bucket;
    let files = await activeBucket.find({ _id: objectId }).toArray();

    if (!files || files.length === 0) {
      // Fallback to legacy/default bucket 'fs'
      const fsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'fs' });
      files = await fsBucket.find({ _id: objectId }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      activeBucket = fsBucket;
    }

    const file = files[0];
    const fileInfo = {
      fileId: file._id,
      filename: file.filename,
      contentType: file.metadata?.mimetype || 'application/octet-stream',
      length: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata,
      url: `/api/files/${file._id}`
    };

    return res.status(200).json({
      success: true,
      message: 'File information retrieved successfully',
      data: fileInfo
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving file information'
    });
  }
};

// Delete file by ID
const deleteFileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }

    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'GridFS not initialized'
      });
    }

    // Check if file exists
    const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file
    await bucket.delete(new ObjectId(id));

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: {
        deletedFileId: id
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting file'
    });
  }
};

// Get all files with pagination
const getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'GridFS not initialized'
      });
    }

    const files = await bucket.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalFiles = await bucket.find({}).count();
    const totalPages = Math.ceil(totalFiles / limit);

    const fileList = files.map(file => ({
      fileId: file._id,
      filename: file.filename,
      contentType: file.metadata?.mimetype || 'application/octet-stream',
      length: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata,
      url: `/api/files/${file._id}`
    }));

    return res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      data: fileList,
      pagination: {
        page,
        limit,
        total: totalFiles,
        totalPages
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving files'
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFieldFiles,
  getFileById,
  getFileInfoById,
  deleteFileById,
  getAllFiles
};