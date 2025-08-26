const mongoose = require('mongoose');

const sourceCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Source code name is required'],
    trim: true,
    maxlength: [200, 'Source code name cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  thumbnailImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  },
  videoPreview: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  }],
  videoTutorial: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  }],
  imagePreview: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  }],
  policy: [{
    type: String,
    trim: true,
    maxlength: [500, 'Each policy item cannot exceed 500 characters']
  }],
  description: [{
    type: String,
    trim: true,
    maxlength: [1000, 'Each description item cannot exceed 1000 characters']
  }],
  sourceCodeFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files',
    required: [true, 'Source code file is required']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for better performance
sourceCodeSchema.index({ slug: 1 });
sourceCodeSchema.index({ name: 'text', tags: 'text' });
sourceCodeSchema.index({ category: 1 });
sourceCodeSchema.index({ isActive: 1 });
sourceCodeSchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug if not provided
sourceCodeSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Virtual for discounted price
sourceCodeSchema.virtual('discountedPrice').get(function() {
  if (this.discountPercent > 0) {
    return this.price * (1 - this.discountPercent / 100);
  }
  return this.price;
});

// Ensure virtual fields are serialized
sourceCodeSchema.set('toJSON', { virtuals: true });
sourceCodeSchema.set('toObject', { virtuals: true });

const SourceCode = mongoose.model('SourceCode', sourceCodeSchema);
module.exports = SourceCode;