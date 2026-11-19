import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import ThemeToggle from '../common/ThemeToggle';
import MobileNav from './MobileNav';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, cart } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync search input with URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearchTerm(q);
  }, [location.search]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="container-fluid px-3 px-lg-5">
          <div className="d-flex align-items-center justify-content-between py-2 py-md-3 gap-2 gap-md-4">
            {/* 1. Mobile Menu Trigger & Brand Logo */}
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm p-1 d-lg-none border-0 text-muted"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <Menu size={24} />
              </button>

              <Link to="/" className="d-flex align-items-center text-decoration-none gap-2">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 12px rgba(49, 95, 234, 0.25)',
                  }}
                >
                  S
                </div>
                <div className="d-flex flex-column">
                  <span
                    className="brand-font fw-extrabold fs-4 lh-1"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary) 30%, var(--color-secondary) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    ShopSphere
                  </span>
                  <span
                    className="text-muted d-none d-sm-block"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Marketplace
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. Desktop Navigation Categories Bar */}
            <nav className="d-none d-lg-flex align-items-center gap-4">
              <Link to="/shop" className="fw-semibold text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                All Products
              </Link>
              <Link to="/shop?category=electronics-audio" className="text-decoration-none text-muted hover-primary">
                Electronics
              </Link>
              <Link to="/shop?category=fashion-apparel" className="text-decoration-none text-muted hover-primary">
                Fashion
              </Link>
              <Link to="/shop?category=home-living" className="text-decoration-none text-muted hover-primary">
                Home
              </Link>
              <Link to="/shop?category=beauty-wellness" className="text-decoration-none text-muted hover-primary">
                Beauty
              </Link>
            </nav>

            {/* 3. Search Bar (Universal with debounced enter) */}
            <form
              onSubmit={handleSearchSubmit}
              className="d-none d-md-flex flex-grow-1 mx-2 mx-xl-4 position-relative"
              style={{ maxWidth: '440px' }}
            >
              <input
                type="text"
                className="form-control ps-4 pe-5"
                placeholder="Search products, brands, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: '42px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              />
              <button
                type="submit"
                className="btn position-absolute end-0 top-50 translate-middle-y me-1 rounded-circle p-1 d-flex align-items-center justify-content-center"
                style={{
                  color: 'var(--color-primary)',
                  width: '34px',
                  height: '34px',
                  background: 'transparent',
                }}
                aria-label="Submit search"
              >
                <Search size={18} />
              </button>
            </form>

            {/* 4. Action Icons: Theme, Wishlist, Cart, User Account */}
            <div className="d-flex align-items-center gap-2 gap-sm-3">
              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="btn btn-sm d-flex align-items-center justify-content-center p-2 rounded-circle border-0 position-relative"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  width: '38px',
                  height: '38px',
                }}
                title="View Saved Wishlist"
              >
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      color: '#FFF',
                      fontSize: '0.68rem',
                      padding: '0.25em 0.5em',
                    }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Pill */}
              <Link
                to="/cart"
                className="btn d-flex align-items-center gap-2 py-1 px-3 border-0"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-pill)',
                  height: '38px',
                  boxShadow: '0 2px 10px rgba(var(--color-primary-rgb), 0.25)',
                }}
                title="View Shopping Cart"
              >
                <div className="position-relative d-flex align-items-center">
                  <ShoppingCart size={18} />
                  {itemCount > 0 && (
                    <span
                      className="badge rounded-pill ms-1"
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#FFFFFF',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {itemCount}
                    </span>
                  )}
                </div>
                {cart?.grandTotal > 0 && (
                  <span className="fw-bold d-none d-sm-inline" style={{ fontSize: '0.86rem' }}>
                    ${cart.grandTotal.toFixed(2)}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Dropdown */}
              {isAuthenticated ? (
                <div className="position-relative">
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="btn btn-sm d-flex align-items-center gap-2 p-1 border-0"
                    style={{ background: 'transparent' }}
                    aria-expanded={dropdownOpen}
                  >
                    <img
                      src={user?.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user?.name || 'User'}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--color-primary)',
                      }}
                    />
                    <ChevronDown size={14} className="text-muted d-none d-md-inline" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg"
                      style={{
                        minWidth: '220px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        zIndex: 1050,
                      }}
                    >
                      <div className="px-3 py-2 border-bottom">
                        <div className="fw-bold text-truncate" style={{ color: 'var(--text-primary)' }}>
                          {user?.name}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                          {user?.email}
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="dropdown-item d-flex align-items-center gap-2 py-2 text-primary fw-semibold"
                        >
                          <LayoutDashboard size={16} />
                          Admin Console
                        </Link>
                      )}

                      <Link to="/account/profile" className="dropdown-item d-flex align-items-center gap-2 py-2">
                        <User size={16} />
                        My Profile
                      </Link>

                      <Link to="/account/orders" className="dropdown-item d-flex align-items-center gap-2 py-2">
                        <Package size={16} />
                        Order History
                      </Link>

                      <Link to="/account/addresses" className="dropdown-item d-flex align-items-center gap-2 py-2">
                        <MapPin size={16} />
                        Saved Addresses
                      </Link>

                      <div className="dropdown-divider my-1"></div>

                      <button
                        onClick={logout}
                        className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="/login"
                    className="btn btn-sm btn-outline-primary d-none d-sm-inline-flex align-items-center"
                    style={{ height: '36px', padding: '0 1rem' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-sm btn-secondary d-none d-md-inline-flex align-items-center"
                    style={{ height: '36px', padding: '0 1rem' }}
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-sm btn-outline-secondary d-sm-none p-2 rounded-circle"
                    title="Sign In"
                  >
                    <User size={18} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar Row (320px–767px) */}
          <div className="d-md-none pb-2 pt-1">
            <form onSubmit={handleSearchSubmit} className="position-relative w-100">
              <input
                type="text"
                className="form-control ps-4 pe-5"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: '38px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.88rem',
                }}
              />
              <button
                type="submit"
                className="btn position-absolute end-0 top-50 translate-middle-y me-1 p-1 border-0"
                style={{ color: 'var(--color-primary)' }}
                aria-label="Submit search"
              >
                <Search size={16} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Offcanvas Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

export default Navbar;
