const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }

    const orderAmount = Number(amount) || 0;
    const validation = coupon.isValid(orderAmount);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const discount = coupon.calculateDiscount(orderAmount);

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' is valid!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      perCustomerLimit,
      isActive,
    } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A coupon with this code already exists.' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description: description || '',
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      usageLimit: usageLimit ? Number(usageLimit) : 100,
      perCustomerLimit: perCustomerLimit ? Number(perCustomerLimit) : 1,
      isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      perCustomerLimit,
      isActive,
    } = req.body;

    if (code) coupon.code = code.toUpperCase();
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (startDate) coupon.startDate = new Date(startDate);
    if (endDate) coupon.endDate = new Date(endDate);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (perCustomerLimit !== undefined) coupon.perCustomerLimit = Number(perCustomerLimit);
    if (isActive !== undefined) coupon.isActive = (isActive === true || isActive === 'true');

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
