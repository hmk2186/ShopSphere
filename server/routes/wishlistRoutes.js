const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveToCart,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All wishlist routes require authentication

router.get('/', getWishlist);
router.post('/toggle/:productId', toggleWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/move-to-cart/:productId', moveToCart);

module.exports = router;
