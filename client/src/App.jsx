import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';

// Common & Guards
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Storefront Pages
import HomePage from './pages/storefront/HomePage';
import ShopPage from './pages/storefront/ShopPage';
import ProductDetailPage from './pages/storefront/ProductDetailPage';
import CartPage from './pages/storefront/CartPage';
import WishlistPage from './pages/storefront/WishlistPage';

// Checkout Pages
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderSuccessPage from './pages/checkout/OrderSuccessPage';
import OrderTrackingPage from './pages/checkout/OrderTrackingPage';

// Account Pages
import ProfilePage from './pages/account/ProfilePage';
import OrdersPage from './pages/account/OrdersPage';
import AddressesPage from './pages/account/AddressesPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/auth/PasswordPages';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Mobile Bottom Nav Component
const MobileBottomBar = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <div className="mobile-bottom-nav">
      <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={18} />
        <span>Home</span>
      </Link>
      <Link to="/shop" className={`mobile-nav-item ${location.pathname.startsWith('/shop') ? 'active' : ''}`}>
        <ShoppingBag size={18} />
        <span>Shop</span>
      </Link>
      <Link to="/cart" className={`mobile-nav-item ${location.pathname === '/cart' ? 'active' : ''}`}>
        <div className="position-relative">
          <ShoppingCart size={18} />
          {itemCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary text-white"
              style={{ fontSize: '0.6rem', padding: '0.2em 0.4em' }}
            >
              {itemCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </Link>
      <Link to="/wishlist" className={`mobile-nav-item ${location.pathname === '/wishlist' ? 'active' : ''}`}>
        <div className="position-relative">
          <Heart size={18} />
          {wishlistCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-warning"
              style={{ fontSize: '0.6rem', padding: '0.2em 0.4em' }}
            >
              {wishlistCount}
            </span>
          )}
        </div>
        <span>Wishlist</span>
      </Link>
      <Link to="/account/profile" className={`mobile-nav-item ${location.pathname.startsWith('/account') ? 'active' : ''}`}>
        <User size={18} />
        <span>Account</span>
      </Link>
    </div>
  );
};

// Storefront Wrapper to include Navbar and Footer
const StorefrontLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="main-content">{children}</div>
      <Footer />
      <MobileBottomBar />
    </>
  );
};

// 404 Not Found Page
const NotFoundPage = () => (
  <div className="container py-5 text-center my-5">
    <h1 className="display-1 fw-extrabold text-primary">404</h1>
    <h3 className="fw-bold mb-3">Page Not Found</h3>
    <p className="text-muted mb-4">The page you are looking for does not exist or has been relocated.</p>
    <Link to="/" className="btn btn-primary px-4 py-2">
      Return to Storefront
    </Link>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Storefront Routes */}
                  <Route path="/" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
                  <Route path="/shop" element={<StorefrontLayout><ShopPage /></StorefrontLayout>} />
                  <Route path="/product/:slug" element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
                  <Route path="/register" element={<StorefrontLayout><RegisterPage /></StorefrontLayout>} />
                  <Route path="/forgot-password" element={<StorefrontLayout><ForgotPasswordPage /></StorefrontLayout>} />
                  <Route path="/reset-password" element={<StorefrontLayout><ResetPasswordPage /></StorefrontLayout>} />

                  {/* Customer Protected Routes */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <StorefrontLayout><CartPage /></StorefrontLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <StorefrontLayout><WishlistPage /></StorefrontLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <StorefrontLayout><CheckoutPage /></StorefrontLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-success/:orderId"
                    element={
                      <ProtectedRoute>
                        <StorefrontLayout><OrderSuccessPage /></StorefrontLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/profile"
                    element={
                      <ProtectedRoute>
                        <StorefrontLayout><ProfilePage /></StorefrontLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute>
                        <StorefrontLayout><OrdersPage /></StorefrontLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders/:id"
                    element={
                      <ProtectedRoute>
                        <StorefrontLayout><OrderTrackingPage /></StorefrontLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/addresses"
                    element={
                      <ProtectedRoute>
                        <StorefrontLayout><AddressesPage /></StorefrontLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Console Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>

                  {/* 404 Catch-All */}
                  <Route path="*" element={<StorefrontLayout><NotFoundPage /></StorefrontLayout>} />
                </Routes>
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
