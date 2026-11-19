const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart actions require authentication

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:productId', updateCartQuantity);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

module.exports = router;
