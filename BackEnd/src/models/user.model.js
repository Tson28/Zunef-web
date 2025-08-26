const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {type: String,required: true}, // Họ và Tên đầy đủ
    email: {type: String,required:true,unique: true},
    secondaryEmail: {type: String, required: false}, // Email phụ
    phoneNumber: {type: String, required: false}, // Số điện thoại
    password: {type:String,required:true},
    token: {type:String},
    isVerified: {type: Boolean, default: false},
    role: {type:String, default: "user"},
    avatar: {type: Buffer, required: false}, // Avatar lưu dưới dạng binary
    ownership: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
})

const User = mongoose.model('User',UserSchema);
module.exports = User;