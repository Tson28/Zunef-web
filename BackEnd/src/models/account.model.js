const mongoose = require('mongoose');

const AccountSchema = mongoose.Schema({
    name:{type:String,required: true},
    price:{type:Number,required:true},
    Discount:{type:Number,default:0},
    stock:{type:Number,default:0},
    duration:{
        type: String,
        enum: ['1_month', '3_months', '6_months', '1_year'],
        default: '1_month',
        required: true
    },
    category:{
        type: [String],
        default: [],
    },
    thumbnail:{type:String},
    imagepreview:{
        type: [String],
        default: [],

    },
    videopreview:{
        type: [String],
        default: [],
    },
    policy: {
        type: [String],
        default: [],
    },
    description: {
        type: [String],
        default: [],
    },
    // Thông tin đăng nhập được quản lý trong UserAccountInfo model riêng biệt
    // Loại sản phẩm
    productType: {
        type: String,
        enum: ['account', 'source-code'],
        default: 'account',
        required: true
    },
},{
    timestamps: true,
});

const Account = mongoose.model('AccountCollection',AccountSchema);
module.exports = Account;
