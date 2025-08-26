const Order = require('../models/order.model');
const SourceCode = require('../models/sourceCode.model');
const path = require('path');
const fs = require('fs');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const DeliveryInfo = require('../models/deliveryInfo.model');
const Payment = require('../models/payment.model');

class DownloadController {
    // Helper: find order by either per-item orderId or payment orderId
    async findOrderForDownload({ orderId, userId }) {
        // Try per-item orderId first
        let order = await Order.findOne({
            orderId,
            userId,
            'product.productType': 'source-code',
            status: { $in: ['paid', 'completed'] }
        });

        if (order) return order;

        // Fall back: treat as payment orderId
        const payment = await Payment.findOne({ orderId, userId, status: { $in: ['completed', 'paid'] } });
        if (!payment) return null;

        order = await Order.findOne({
            userId,
            'product.productType': 'source-code',
            status: { $in: ['paid', 'completed'] },
            'paymentInfo.paymentId': payment._id
        });

        return order;
    }

    // Tải xuống source code
    async downloadSourceCode(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            // Tìm đơn hàng (hỗ trợ cả per-item orderId và payment orderId)
            const order = await this.findOrderForDownload({ orderId, userId });
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng hoặc đơn hàng chưa được thanh toán'
                });
            }
            
            // Lấy DeliveryInfo
            const info = await DeliveryInfo.findOne({ orderId: order.orderId, userId });
            if (!info) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin tải xuống'
                });
            }
            
            // Kiểm tra số lần tải
            if (info.downloadCount >= info.maxDownloads) {
                return res.status(403).json({
                    success: false,
                    message: `Bạn đã tải file này ${info.maxDownloads} lần. Vượt quá giới hạn cho phép.`
                });
            }
            
            // Kiểm tra thời hạn tải
            if (new Date() > info.expiresAt) {
                return res.status(403).json({
                    success: false,
                    message: 'Link tải đã hết hạn'
                });
            }
            
            // Tìm source code (có thể là ObjectId hoặc slug)
            let sourceCode;
            if (mongoose.Types.ObjectId.isValid(order.product.productId)) {
                sourceCode = await SourceCode.findById(order.product.productId);
            } else {
                sourceCode = await SourceCode.findOne({ slug: order.product.productId });
            }
            
            // Quyết định fileId dựa trên DeliveryInfo trước (snapshot), sau đó fallback SourceCode
            const primaryFileId = info.sourceFileId || null;
            const fallbackFileId = sourceCode?.sourceCodeFile || null;
            let selectedFileId = primaryFileId || fallbackFileId;
            if (!selectedFileId) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy file source code'
                });
            }
            
            // Tạo GridFS bucket - thử 'uploads' trước, sau đó fallback 'fs' để tương thích dữ liệu cũ
            const findFileInBuckets = async (fid) => {
                if (!fid) return { file: null, bucket: null };
                let b = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
                let fls = await b.find({ _id: fid }).toArray();
                if (fls.length === 0) {
                    b = new GridFSBucket(mongoose.connection.db, { bucketName: 'fs' });
                    fls = await b.find({ _id: fid }).toArray();
                }
                return { file: fls[0] || null, bucket: fls.length > 0 ? b : null };
            };

            // Try with primary (DeliveryInfo) first
            let { file, bucket } = await findFileInBuckets(primaryFileId);

            // If not found, try fallback (SourceCode)
            if (!file && fallbackFileId && (!primaryFileId || (primaryFileId && fallbackFileId?.toString() !== primaryFileId?.toString()))) {
                const found = await findFileInBuckets(fallbackFileId);
                file = found.file;
                bucket = found.bucket;

                // Self-heal: update DeliveryInfo to use valid fileId
                if (file && fallbackFileId) {
                    await DeliveryInfo.updateOne(
                        { _id: info._id },
                        { $set: { sourceFileId: fallbackFileId, fileName: info.fileName || file.metadata?.originalName || file.filename } }
                    );
                }
            }

            if (!file || !bucket) {
                return res.status(404).json({
                    success: false,
                    message: 'File không tồn tại'
                });
            }
            
            // Cập nhật số lần tải trong DeliveryInfo
            await DeliveryInfo.updateOne(
                { _id: info._id },
                { $inc: { downloadCount: 1 }, $set: { lastDownloadAt: new Date() } }
            );
            
            // Cập nhật download count cho source code
            if (sourceCode?._id) {
                await SourceCode.findByIdAndUpdate(sourceCode._id, {
                    $inc: { downloadCount: 1 }
                });
            }

            // Xác định tên file ưu tiên từ DeliveryInfo > metadata.originalName > filename > tiêu đề sản phẩm
            const preferredName = info.fileName
                || file.metadata?.originalName
                || file.filename
                || (order.product?.title ? `${order.product.title}.zip` : 'source-code.zip');

            // Set headers cho download
            res.set({
                'Content-Type': file.metadata?.mimetype || file.contentType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${preferredName}"`,
                'Content-Length': file.length
            });
            
            // Stream file từ bucket đã chọn
            const downloadStream = bucket.openDownloadStream((file && file._id) ? file._id : selectedFileId);
            downloadStream.pipe(res);
            
            downloadStream.on('error', (error) => {
                console.error('Download stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Lỗi khi tải file'
                    });
                }
            });
            
        } catch (error) {
            console.error('Download source code error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Lấy thông tin download
    async getDownloadInfo(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            // Tìm đơn hàng (hỗ trợ cả per-item orderId và payment orderId)
            const order = await this.findOrderForDownload({ orderId, userId });
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng'
                });
            }
            
            // Lấy DeliveryInfo
            const info = await DeliveryInfo.findOne({ orderId: order.orderId, userId });
            if (!info) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin tải xuống'
                });
            }
            
            // Xác định file cần đọc thông tin
            let sourceCode;
            if (mongoose.Types.ObjectId.isValid(order.product.productId)) {
                sourceCode = await SourceCode.findById(order.product.productId);
            } else {
                sourceCode = await SourceCode.findOne({ slug: order.product.productId });
            }
            const primaryFileId = info.sourceFileId || null;
            const fallbackFileId = sourceCode?.sourceCodeFile || null;

            let fileName = info.fileName || undefined;
            let fileSize = undefined;

            const findFileInBuckets = async (fid) => {
                if (!fid) return null;
                let b = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
                let fls = await b.find({ _id: fid }).toArray();
                if (fls.length === 0) {
                    b = new GridFSBucket(mongoose.connection.db, { bucketName: 'fs' });
                    fls = await b.find({ _id: fid }).toArray();
                }
                return fls.length > 0 ? { file: fls[0], bucket: b } : null;
            };

            let found = await findFileInBuckets(primaryFileId);
            if (!found && fallbackFileId && (!primaryFileId || (primaryFileId && fallbackFileId?.toString() !== primaryFileId?.toString()))) {
                found = await findFileInBuckets(fallbackFileId);
                // Self-heal DeliveryInfo if fallback works
                if (found && fallbackFileId) {
                    await DeliveryInfo.updateOne(
                        { _id: info._id },
                        { $set: { sourceFileId: fallbackFileId, fileName: info.fileName || found.file.metadata?.originalName || found.file.filename } }
                    );
                }
            }

            if (found) {
                const file = found.file;
                if (!fileName) {
                    fileName = file.filename || file.metadata?.originalName || `${order.product?.title || 'source-code'}.zip`;
                }
                const bytes = file.length || 0;
                const units = ['B', 'KB', 'MB', 'GB'];
                let size = bytes;
                let unitIndex = 0;
                while (size >= 1024 && unitIndex < units.length - 1) {
                    size = size / 1024;
                    unitIndex++;
                }
                fileSize = `${size.toFixed(2)} ${units[unitIndex]}`;
            }
            
            const isExpired = new Date() > info.expiresAt;
            
            res.status(200).json({
                success: true,
                data: {
                    orderId: order.orderId,
                    productId: order.product.productId,
                    productName: order.product.title,
                    fileName: fileName || `${order.product.title}.zip`,
                    fileSize: fileSize || undefined,
                    downloadCount: info.downloadCount,
                    maxDownloads: info.maxDownloads,
                    expiresAt: info.expiresAt,
                    isExpired,
                    canDownload: info.downloadCount < info.maxDownloads && !isExpired
                }
            });
            
        } catch (error) {
            console.error('Get download info error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new DownloadController();