const multer = require('multer');
const path = require('path');

// Cấu hình memory storage cho multer
const storage = multer.memoryStorage();

// File filter function for source code uploads
const sourceCodeFileFilter = (req, file, cb) => {
  // Define allowed file types based on field name
  const fieldName = file.fieldname;
  
  if (fieldName === 'thumbnailImage' || fieldName === 'imagePreview') {
    // Image files
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp) cho thumbnail và image preview!'));
    }
  } else if (fieldName === 'videoPreview' || fieldName === 'videoTutorial') {
    // Video files
    const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedVideoTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file video (mp4, avi, mov, wmv, flv, webm, mkv) cho video preview và tutorial!'));
    }
  } else if (fieldName === 'sourceCodeFile') {
    // Source code files - allow common archive and code file types
    const allowedSourceTypes = /zip|rar|7z|tar|gz|js|ts|jsx|tsx|html|css|scss|sass|less|json|xml|txt|md|py|java|cpp|c|cs|php|rb|go|rs|swift|kt|dart|vue|svelte/;
    const extname = allowedSourceTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file source code (zip, rar, 7z, tar, gz) hoặc file code (js, ts, jsx, tsx, html, css, etc.)!'));
    }
  } else {
    cb(new Error('Field name không được hỗ trợ!'));
  }
};

// Multer configuration for source code
const sourceCodeUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for source code files
  },
  fileFilter: sourceCodeFileFilter
});

// Middleware for source code upload fields
const uploadSourceCodeFields = () => {
  return sourceCodeUpload.fields([
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'imagePreview', maxCount: 10 },
    { name: 'videoPreview', maxCount: 5 },
    { name: 'videoTutorial', maxCount: 5 },
    { name: 'sourceCodeFile', maxCount: 1 }
  ]);
};

// Error handling middleware for source code uploads
const handleSourceCodeUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn! Kích thước tối đa là 100MB cho source code file và 50MB cho các file khác.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Quá nhiều file! Vui lòng kiểm tra giới hạn số lượng file cho từng loại.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Field name không hợp lệ! Các field được hỗ trợ: thumbnailImage, imagePreview, videoPreview, videoTutorial, sourceCodeFile'
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

// Validation middleware to check required source code file
const validateSourceCodeFileRequired = (req, res, next) => {
  // Only check for required file on create (POST), not update (PUT)
  if (req.method === 'POST') {
    if (!req.files || !req.files.sourceCodeFile || req.files.sourceCodeFile.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File source code là bắt buộc!'
      });
    }
  }
  next();
};

module.exports = {
  uploadSourceCodeFields,
  handleSourceCodeUploadError,
  validateSourceCodeFileRequired
};