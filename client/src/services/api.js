import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Token expired or invalid
      localStorage.removeItem('shopsphere_token');
      localStorage.removeItem('shopsphere_user');
      window.dispatchEvent(new Event('shopsphere_logout'));
    }

    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Category Service
export const categoryService = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (formData) =>
    api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Product Service
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getByIdentifier: (identifier) => api.get(`/products/${identifier}`),
  getFeatured: () => api.get('/products/curated/featured'),
  getTrending: () => api.get('/products/curated/trending'),
  getNewArrivals: () => api.get('/products/curated/new-arrivals'),
  getRelated: (id) => api.get(`/products/${id}/related`),
  create: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart Service
export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity) => api.post('/cart/items', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

// Wishlist Service
export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  toggle: (productId) => api.post(`/wishlist/toggle/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/move-to-cart/${productId}`),
};

// Address Service
export const addressService = {
  getAll: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
};

// Order Service
export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  getInvoice: (id) => api.get(`/orders/${id}/invoice`),
};

// Payment Service
export const paymentService = {
  createRazorpayOrder: (orderId) => api.post('/payments/razorpay/create-order', { orderId }),
  verifyRazorpayPayment: (payload) => api.post('/payments/razorpay/verify', payload),
};

// Review Service
export const reviewService = {
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Coupon Service
export const couponService = {
  validate: (code, amount) => api.post('/coupons/validate', { code, amount }),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

// Admin Service
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getOrderDetails: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, orderStatus, note) => api.put(`/admin/orders/${id}/status`, { orderStatus, note }),
  getAllCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomerOrders: (id) => api.get(`/admin/customers/${id}/orders`),
  toggleCustomerStatus: (id) => api.put(`/admin/customers/${id}/status`),
  getInventory: (params) => api.get('/admin/inventory', { params }),
  updateStock: (id, stock) => api.put(`/admin/inventory/${id}/stock`, { stock }),
  getAllReviews: (params) => api.get('/admin/reviews', { params }),
  moderateReview: (id, isApproved) => api.put(`/admin/reviews/${id}/approve`, { isApproved }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

export default api;
