const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlugOrId,
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public Curated rails
router.get('/curated/featured', getFeaturedProducts);
router.get('/curated/trending', getTrendingProducts);
router.get('/curated/new-arrivals', getNewArrivals);
router.get('/:id/related', getRelatedProducts);

// Core catalogue endpoints
router.get('/', getProducts);
router.get('/:identifier', getProductBySlugOrId);

// Admin Product management
router.post('/', protect, admin, upload.array('images', 6), createProduct);
router.put('/:id', protect, admin, upload.array('images', 6), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
