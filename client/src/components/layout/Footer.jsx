import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Truck, RotateCcw, Headphones, Send } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const Footer = () => {
  const { notify } = useNotification();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      notify.error('Please enter a valid email address.');
      return;
    }
    notify.success('Thank you for subscribing to ShopSphere insider deals!');
    setNewsletterEmail('');
  };

  return (
    <footer className="border-top mt-auto" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      {/* 1. Value Proposition Row */}
      <div className="border-bottom py-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="container-fluid px-3 px-lg-5">
          <div className="row g-4 text-center text-md-start">
            <div className="col-6 col-md-3 d-flex flex-column flex-md-row align-items-center gap-3">
              <div
                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                <Truck size={24} />
              </div>
              <div>
                <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  Free Global Delivery
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Orders over $100 eligible
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3 d-flex flex-column flex-md-row align-items-center gap-3">
              <div
                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  Secure Checkout
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  256-bit bank encryption
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3 d-flex flex-column flex-md-row align-items-center gap-3">
              <div
                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                <RotateCcw size={24} />
              </div>
              <div>
                <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  14-Day Free Returns
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Hassle-free guarantee
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3 d-flex flex-column flex-md-row align-items-center gap-3">
              <div
                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}
              >
                <Headphones size={24} />
              </div>
              <div>
                <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  24/7 Dedicated Support
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Live concierge assistance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Links */}
      <div className="py-5">
        <div className="container-fluid px-3 px-lg-5">
          <div className="row g-4 justify-content-between">
            {/* Brand Statement & Newsletter */}
            <div className="col-12 col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-3">
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
                <span className="brand-font fw-extrabold fs-4" style={{ color: 'var(--text-primary)' }}>
                  ShopSphere
                </span>
              </div>
              <p className="text-muted mb-4" style={{ fontSize: '0.9rem', maxWidth: '360px', lineHeight: 1.6 }}>
                ShopSphere is a premium multi-category online destination curated for quality, design, and longevity.
                Experience modern shopping backed by verified authenticity and effortless fulfillment.
              </p>

              <form onSubmit={handleSubscribe} className="position-relative" style={{ maxWidth: '360px' }}>
                <input
                  type="email"
                  className="form-control pe-5"
                  placeholder="Enter your email for 15% off..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{ height: '44px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-subtle)' }}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary position-absolute end-0 top-50 translate-middle-y me-1 rounded-circle p-0 d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px' }}
                  aria-label="Subscribe"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Categories
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: '0.88rem' }}>
                <li><Link to="/shop?category=electronics-audio" className="text-muted text-decoration-none">Electronics & Audio</Link></li>
                <li><Link to="/shop?category=fashion-apparel" className="text-muted text-decoration-none">Fashion & Apparel</Link></li>
                <li><Link to="/shop?category=home-living" className="text-muted text-decoration-none">Home & Living</Link></li>
                <li><Link to="/shop?category=beauty-wellness" className="text-muted text-decoration-none">Beauty & Wellness</Link></li>
                <li><Link to="/shop?category=sports-outdoors" className="text-muted text-decoration-none">Sports & Outdoors</Link></li>
                <li><Link to="/shop?category=books-workspace" className="text-muted text-decoration-none">Books & Workspace</Link></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Customer Care
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: '0.88rem' }}>
                <li><Link to="/account/orders" className="text-muted text-decoration-none">Track Your Order</Link></li>
                <li><Link to="/cart" className="text-muted text-decoration-none">Shopping Cart</Link></li>
                <li><Link to="/wishlist" className="text-muted text-decoration-none">Saved Wishlist</Link></li>
                <li><Link to="/account/profile" className="text-muted text-decoration-none">My Account</Link></li>
                <li><a href="mailto:support@shopsphere.com" className="text-muted text-decoration-none">Contact Support</a></li>
              </ul>
            </div>

            {/* Payments & Security */}
            <div className="col-12 col-md-4 col-lg-3">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Accepted Payments
              </h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                We support Razorpay (Cards, UPI, NetBanking) and Cash on Delivery for flexible, zero-friction transactions.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge border" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                  Razorpay Secure
                </span>
                <span className="badge border" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                  Visa / Mastercard
                </span>
                <span className="badge border" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                  UPI & NetBanking
                </span>
                <span className="badge border" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                  Cash on Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Copyright Row */}
      <div className="border-top py-3 text-center" style={{ borderColor: 'var(--border-color)', fontSize: '0.82rem' }}>
        <div className="container-fluid px-3 px-lg-5 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
          <span className="text-muted">
            &copy; {new Date().getFullYear()} ShopSphere Inc. All rights reserved. Designed with Cobalt & Tangerine architecture.
          </span>
          <div className="d-flex gap-3 text-muted">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
