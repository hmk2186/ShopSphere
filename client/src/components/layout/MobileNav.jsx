import React from 'react';
import { Link } from 'react-router-dom';
import { X, Home, ShoppingBag, Heart, ShoppingCart, User, Package, MapPin, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import ThemeToggle from '../common/ThemeToggle';

const MobileNav = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 2000,
        display: 'flex',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '82%',
          maxWidth: '320px',
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          animation: 'slideInLeft 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 800,
              }}
            >
              S
            </div>
            <span className="fw-bold fs-5" style={{ color: 'var(--text-primary)' }}>
              ShopSphere
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="btn btn-sm p-1 border-0 text-muted"
              aria-label="Close Navigation"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* User Card if Authenticated */}
        {isAuthenticated ? (
          <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div className="d-flex align-items-center gap-3">
              <img
                src={user?.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div className="text-truncate">
                <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {user?.name}
                </div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 mb-3">
            <Link to="/login" onClick={onClose} className="btn btn-primary w-100 py-2">
              Sign In
            </Link>
            <Link to="/register" onClick={onClose} className="btn btn-outline-primary w-100 py-2">
              Create Account
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-grow-1 overflow-auto">
          <div className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
            Store Navigation
          </div>
          <nav className="d-flex flex-column gap-1 mb-4">
            <Link to="/" onClick={onClose} className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none" style={{ color: 'var(--text-primary)' }}>
              <Home size={18} className="text-primary" /> Home
            </Link>
            <Link to="/shop" onClick={onClose} className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none" style={{ color: 'var(--text-primary)' }}>
              <ShoppingBag size={18} className="text-primary" /> All Products
            </Link>
            <Link to="/cart" onClick={onClose} className="d-flex align-items-center justify-content-between p-2 rounded text-decoration-none" style={{ color: 'var(--text-primary)' }}>
              <span className="d-flex align-items-center gap-3">
                <ShoppingCart size={18} className="text-primary" /> Shopping Cart
              </span>
              {itemCount > 0 && <span className="badge rounded-pill bg-primary">{itemCount}</span>}
            </Link>
            <Link to="/wishlist" onClick={onClose} className="d-flex align-items-center justify-content-between p-2 rounded text-decoration-none" style={{ color: 'var(--text-primary)' }}>
              <span className="d-flex align-items-center gap-3">
                <Heart size={18} className="text-primary" /> Wishlist
              </span>
              {wishlistCount > 0 && <span className="badge rounded-pill badge-warning">{wishlistCount}</span>}
            </Link>
          </nav>

          <div className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
            Categories
          </div>
          <nav className="d-flex flex-column gap-1 mb-4">
            <Link to="/shop?category=electronics-audio" onClick={onClose} className="p-2 text-decoration-none text-muted" style={{ fontSize: '0.9rem' }}>
              Electronics & Audio
            </Link>
            <Link to="/shop?category=fashion-apparel" onClick={onClose} className="p-2 text-decoration-none text-muted" style={{ fontSize: '0.9rem' }}>
              Fashion & Apparel
            </Link>
            <Link to="/shop?category=home-living" onClick={onClose} className="p-2 text-decoration-none text-muted" style={{ fontSize: '0.9rem' }}>
              Home & Living
            </Link>
            <Link to="/shop?category=beauty-wellness" onClick={onClose} className="p-2 text-decoration-none text-muted" style={{ fontSize: '0.9rem' }}>
              Beauty & Wellness
            </Link>
            <Link to="/shop?category=sports-outdoors" onClick={onClose} className="p-2 text-decoration-none text-muted" style={{ fontSize: '0.9rem' }}>
              Sports & Outdoors
            </Link>
            <Link to="/shop?category=books-workspace" onClick={onClose} className="p-2 text-decoration-none text-muted" style={{ fontSize: '0.9rem' }}>
              Books & Workspace
            </Link>
          </nav>

          {isAuthenticated && (
            <>
              <div className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                Account Settings
              </div>
              <nav className="d-flex flex-column gap-1">
                {isAdmin && (
                  <Link to="/admin/dashboard" onClick={onClose} className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none text-primary fw-semibold">
                    <LayoutDashboard size={18} /> Admin Dashboard
                  </Link>
                )}
                <Link to="/account/profile" onClick={onClose} className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                  <User size={18} /> Profile
                </Link>
                <Link to="/account/orders" onClick={onClose} className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                  <Package size={18} /> My Orders
                </Link>
                <Link to="/account/addresses" onClick={onClose} className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                  <MapPin size={18} /> Addresses
                </Link>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="d-flex align-items-center gap-3 p-2 rounded text-danger border-0 text-start w-100 mt-2"
                  style={{ background: 'transparent' }}
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
