const mongoose = require('mongoose')

const userAccountInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountCollection',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  // Thông tin đăng nhập tài khoản
  username: {
    type: String,
    default: null
  },
  password: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  additionalInfo: {
    type: String,
    default: null
  },
  // Trạng thái tài khoản
  isReady: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Index để tối ưu query
userAccountInfoSchema.index({ userId: 1, orderId: 1 })
userAccountInfoSchema.index({ orderId: 1 })
userAccountInfoSchema.index({ productId: 1 })
userAccountInfoSchema.index({ isReady: 1 })

// Middleware để cập nhật lastUpdated khi document được modify
userAccountInfoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date()
  }
  next()
})

// Virtual để tính toán trạng thái hết hạn
userAccountInfoSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false
  return new Date() > this.expiresAt
})

// Method để đánh dấu tài khoản đã sẵn sàng
userAccountInfoSchema.methods.markAsReady = function(adminId) {
  this.isReady = true
  this.deliveredAt = new Date()
  this.updatedBy = adminId
  this.lastUpdated = new Date()
  return this.save()
}

// Method để cập nhật thông tin đăng nhập
userAccountInfoSchema.methods.updateLoginInfo = function(loginData, adminId) {
  if (loginData.username !== undefined) this.username = loginData.username
  if (loginData.password !== undefined) this.password = loginData.password
  if (loginData.email !== undefined) this.email = loginData.email
  if (loginData.additionalInfo !== undefined) this.additionalInfo = loginData.additionalInfo
  if (loginData.expiresAt !== undefined) this.expiresAt = loginData.expiresAt
  if (loginData.notes !== undefined) this.notes = loginData.notes
  
  this.updatedBy = adminId
  this.lastUpdated = new Date()
  
  // Tự động đánh dấu là ready nếu có đủ thông tin cơ bản
  if (this.username && this.password && !this.isReady) {
    this.isReady = true
    this.deliveredAt = new Date()
  }
  
  return this.save()
}

// Static method để tạo account info mới sau khi thanh toán
userAccountInfoSchema.statics.createFromOrder = async function(orderData) {
  const accountInfo = new this({
    userId: orderData.userId,
    orderId: orderData.orderId,
    productId: orderData.productId,
    productName: orderData.productName,
    isReady: false
  })
  
  return await accountInfo.save()
}

// Static method để lấy thông tin theo orderId và userId
userAccountInfoSchema.statics.findByOrderAndUser = function(orderId, userId) {
  return this.findOne({ orderId, userId })
    .populate('productId', 'name price category')
    .populate('userId', 'name email')
    .populate('updatedBy', 'name email')
}

module.exports = mongoose.model('UserAccountInfo', userAccountInfoSchema)