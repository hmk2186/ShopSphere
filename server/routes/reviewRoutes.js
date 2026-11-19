const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  deleteMyReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteMyReview);

module.exports = router;
