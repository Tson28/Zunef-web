const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
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
    
    // Thông tin sản phẩm (chỉ 1 sản phẩm mỗi đơn hàng)
    product: {
        productId: {
            type: String,
            required: true
        },
        productType: {
            type: String,
            enum: ['account', 'source-code'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    },
    
    // Tổng tiền
    totalAmount: {
        type: Number,
        required: true
    },
    
    // Trạng thái đơn hàng
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    
    // Thông tin thanh toán
    paymentInfo: {
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            default: null
        },
        transactionCode: {
            type: String,
            default: null
        },
        paymentDate: {
            type: Date,
            default: null
        }
    },

    // Ghi chú
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});

// Index để tìm kiếm nhanh
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'product.productType': 1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;