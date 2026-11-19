const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all reviews for a product with rating distribution breakdown
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments({ product: productId, isApproved: true });
    const reviews = await Review.find({ product: productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Calculate rating breakdown distribution (1-5 stars)
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const allRatings = await Review.find({ product: productId, isApproved: true }).select('rating');
    allRatings.forEach((r) => {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating]++;
      }
    });

    const breakdownPercent = {};
    const totalCount = allRatings.length;
    for (let i = 1; i <= 5; i++) {
      breakdownPercent[i] = totalCount > 0 ? Math.round((breakdown[i] / totalCount) * 100) : 0;
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      breakdown,
      breakdownPercent,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review for product (Verified purchaser eligible)
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product, rating (1-5), title, and review comment are required.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product.',
      });
    }

    // Check if user has purchased this product (Verified Purchase)
    const qualifyingOrder = await Order.findOne({
      user: req.user.id,
      'items.product': productId,
      orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
    });

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      order: qualifyingOrder ? qualifyingOrder._id : null,
      isVerifiedPurchase: Boolean(qualifyingOrder),
      rating: Number(rating),
      title,
      comment,
      isApproved: true,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been posted.',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete my own review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteMyReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteMyReview,
};
