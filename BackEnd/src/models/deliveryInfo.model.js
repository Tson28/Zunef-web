const mongoose = require('mongoose');

const DeliveryInfoSchema = new mongoose.Schema({
  // Liên kết tới đơn hàng con (per-item order)
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  // Chủ sở hữu
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Sản phẩm (source-code)
  productId: {
    type: String,
    required: true,
    index: true,
  },
  // Tham chiếu payment (để tra cứu ngược từ payment.orderId)
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
    index: true,
  },
  // Tham chiếu file GridFS theo từng đơn hàng (snapshot tại thời điểm thanh toán)
  sourceFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files',
    default: null,
    index: true,
  },
  // Tuỳ chọn: tên file tại thời điểm snapshot (nếu muốn hiển thị nhanh)
  fileName: {
    type: String,
    default: null,
  },
  // Thông tin tải xuống
  downloadCount: {
    type: Number,
    default: 0,
  },
  maxDownloads: {
    type: Number,
    default: 5,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    index: true,
  },
  lastDownloadAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Mỗi user chỉ có một DeliveryInfo cho một orderId
DeliveryInfoSchema.index({ orderId: 1, userId: 1 }, { unique: true });

const DeliveryInfo = mongoose.model('DeliveryInfo', DeliveryInfoSchema);
module.exports = DeliveryInfo;