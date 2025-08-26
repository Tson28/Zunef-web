const multer = require('multer');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const path = require('path');

// Cấu hình memory storage cho multer
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm/;
  
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = allowedImageTypes.test(file.mimetype) ||
                   allowedVideoTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp) hoặc video (mp4, avi, mov, wmv, flv, webm)!'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter
});

// Middleware for different upload types
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

const uploadFields = () => {
  return upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'imagepreview', maxCount: 10 },
    { name: 'videopreview', maxCount: 5 }
  ]);
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn! Kích thước tối đa là 50MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Quá nhiều file! Vui lòng giảm số lượng file upload.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Field name không hợp lệ!'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Lỗi không xác định khi upload file!'
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError
};