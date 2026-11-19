const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Coupon expiration date is required'],
    },
    usageLimit: {
      type: Number,
      default: 100,
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perCustomerLimit: {
      type: Number,
      default: 1,
      min: [1, 'Per customer limit must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.methods.isValid = function (orderAmount) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is currently inactive' };
  if (this.startDate > now) return { valid: false, message: 'Coupon promotion has not started yet' };
  if (this.endDate < now) return { valid: false, message: 'Coupon has expired' };
  if (this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit has been reached' };
  if (orderAmount < this.minOrderAmount) {
    return { valid: false, message: `Minimum order amount for this coupon is $${this.minOrderAmount}` };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = Math.min(this.discountValue, orderAmount);
  }
  return Math.round(discount * 100) / 100;
};

module.exports = mongoose.model('Coupon', couponSchema);
