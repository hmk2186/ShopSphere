const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  toggleCustomerStatus,
  getCustomerOrders,
  getInventory,
  updateStock,
  getAllReviews,
  moderateReview,
  deleteReview,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin); // All routes in this file require Admin authorization

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAllCustomers);
router.get('/customers/:id/orders', getCustomerOrders);
router.put('/customers/:id/status', toggleCustomerStatus);
router.get('/inventory', getInventory);
router.put('/inventory/:id/stock', updateStock);
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/approve', moderateReview);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
