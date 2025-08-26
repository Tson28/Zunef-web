const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema({
    // Thông tin đơn hàng
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Thông tin sản phẩm
    items: [{
        productId: String,
        title: String,
        price: Number,
        quantity: Number
    }],
    
    // Thông tin thanh toán
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'VND'
    },
    
    // Thông tin SePay
    transactionCode: {
        type: String,
        required: true,
        unique: true
    },
    sepayTransactionId: {
        type: String,
        default: null
    },
    
    // Trạng thái thanh toán
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    
    // Thông tin ngân hàng
    bankInfo: {
        accountNumber: {
            type: String,
            default: '0915878677'
        },
        bankName: {
            type: String,
            default: 'MB'
        },
        qrContent: String
    },
    
    // Thông tin webhook từ SePay
    webhookData: {
        gateway: String,
        transactionDate: String,
        accountNumber: String,
        content: String,
        transferType: String,
        description: String,
        transferAmount: Number,
        referenceCode: String,
        sepayId: Number
    },
    
    // Thông tin khách hàng
    customerInfo: {
        fullName: String,
        email: String,
    },
    
    // Thời gian
    paymentDate: {
        type: Date,
        default: null
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 phút
    }
}, {
    timestamps: true,
});

// Index để tìm kiếm nhanh
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ transactionCode: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;