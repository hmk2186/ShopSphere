const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      default: 'ShopSphere',
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price must be positive'],
      default: null,
    },
    discountPercent: {
      type: Number,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100'],
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Inventory stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: null,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 4.5,
        min: [0, 'Rating cannot be below 0'],
        max: [5, 'Rating cannot exceed 5'],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Pre-validate hook to calculate slug, discountPercent, and SKU
productSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || (this.isModified('name') && !this.isModified('slug')))) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${randomSuffix}`;
  }

  if (!this.sku) {
    const prefix = this.brand ? this.brand.substring(0, 3).toUpperCase() : 'SPH';
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.sku = `${prefix}-${rand}`;
  }

  // Calculate discount percentage
  if (this.discountPrice && this.discountPrice < this.price) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  } else {
    this.discountPercent = 0;
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
