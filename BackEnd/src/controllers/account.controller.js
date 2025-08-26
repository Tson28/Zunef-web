const AccountService = require('../services/account.service');
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

const CreateAccountService = async(req,res) => {
    try{
        if (!bucket) {
            return res.status(500).json({
                success: false,
                message: 'GridFS not initialized'
            });
        }

        // Xử lý file uploads
        const accountData = { ...req.body };
        
        // Xử lý array fields từ form data
        if (accountData.category && typeof accountData.category === 'string') {
            accountData.category = accountData.category.split(',').map(item => item.trim()).filter(item => item);
        }
        if (accountData.policy && typeof accountData.policy === 'string') {
            accountData.policy = accountData.policy.split(',').map(item => item.trim()).filter(item => item);
        }
        if (accountData.description && typeof accountData.description === 'string') {
            accountData.description = accountData.description.split(',').map(item => item.trim()).filter(item => item);
        }
        
        if (req.files) {
            // Xử lý thumbnail
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                const thumbnailId = await uploadFileToGridFS(req.files.thumbnail[0]);
                accountData.thumbnail = thumbnailId;
            }
            
            // Xử lý imagepreview
            if (req.files.imagepreview && req.files.imagepreview.length > 0) {
                const imageIds = await Promise.all(
                    req.files.imagepreview.map(file => uploadFileToGridFS(file))
                );
                accountData.imagepreview = imageIds;
            }
            
            // Xử lý videopreview
            if (req.files.videopreview && req.files.videopreview.length > 0) {
                const videoIds = await Promise.all(
                    req.files.videopreview.map(file => uploadFileToGridFS(file))
                );
                accountData.videopreview = videoIds;
            }
        }
        
        const newAccount = await AccountService.createAccount(accountData);
        return res.status(201).json({
            success: true,
            message: "Tạo tài khoản thành công!",
            data: newAccount
        });
    }catch(error){
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi tạo tài khoản'
        });
    }
}

const GetAllAccountService = async(req,res) => {
    try{
        const { page, limit, search, category } = req.query;
        const result = await AccountService.getAccounts({ page, limit, search, category });
        
        if(!page || !limit){
            // Trả về danh sách đơn giản
            return res.status(200).json({
                success: true,
                message: "Lấy tất cả tài khoản thành công!",
                data: result,
                count: result.length
            });
        }
        
        // Trả về với phân trang
        return res.status(200).json({
            success: true,
            message: "Lấy tất cả tài khoản thành công!",
            data: result.items,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            }
        });
    }catch(error){
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi lấy danh sách tài khoản'
        });
    }
}

const DeleteAccountService = async(req,res) => {
    try{
        const {id} = req.params;
        const deletedAccount = await AccountService.deleteAccount(id);
        return res.status(200).json({
            success: true,
            message: "Xóa tài khoản thành công!",
            data: deletedAccount
        });
    }catch(error){
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi xóa tài khoản'
        });
    }
}

const UpdateAccountService = async(req,res) => {
    try{
        const {id} = req.params;
        
        if (!bucket) {
            return res.status(500).json({
                success: false,
                message: 'GridFS not initialized'
            });
        }
        
        // Xử lý file uploads
        const updateData = { ...req.body };
        
        // Xử lý array fields từ form data
        if (updateData.category && typeof updateData.category === 'string') {
            updateData.category = updateData.category.split(',').map(item => item.trim()).filter(item => item);
        }
        if (updateData.policy && typeof updateData.policy === 'string') {
            updateData.policy = updateData.policy.split(',').map(item => item.trim()).filter(item => item);
        }
        if (updateData.description && typeof updateData.description === 'string') {
            updateData.description = updateData.description.split(',').map(item => item.trim()).filter(item => item);
        }
        
        if (req.files) {
            // Xử lý thumbnail
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                const thumbnailId = await uploadFileToGridFS(req.files.thumbnail[0]);
                updateData.thumbnail = thumbnailId;
            }
            
            // Xử lý imagepreview
            if (req.files.imagepreview && req.files.imagepreview.length > 0) {
                const imageIds = await Promise.all(
                    req.files.imagepreview.map(file => uploadFileToGridFS(file))
                );
                updateData.imagepreview = imageIds;
            }
            
            // Xử lý videopreview
            if (req.files.videopreview && req.files.videopreview.length > 0) {
                const videoIds = await Promise.all(
                    req.files.videopreview.map(file => uploadFileToGridFS(file))
                );
                updateData.videopreview = videoIds;
            }
        }
        
        const updatedAccount = await AccountService.updateAccount(id, updateData);
        return res.status(200).json({
            success: true,
            message: "Cập nhật tài khoản thành công!",
            data: updatedAccount
        });
    }catch(error){
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi cập nhật tài khoản'
        });
    }
}

const GetAccountByIdService = async(req,res) => {
    try{
        const {id} = req.params;
        const account = await AccountService.getAccountById(id);
        return res.status(200).json({
            success: true,
            message: "Lấy thông tin tài khoản thành công!",
            data: account
        });
    }catch(error){
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi lấy thông tin tài khoản'
        });
    }
}

module.exports = {
    CreateAccountService,
    GetAllAccountService,
    GetAccountByIdService,
    DeleteAccountService,
    UpdateAccountService,
}

