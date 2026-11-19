import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import CouponWidget from './CouponWidget';

const OrderSummaryCard = ({ cart, onCheckout, checkoutButtonText = 'Proceed to Checkout', isCheckout = false }) => {
  if (!cart) return null;

  return (
    <div
      className="card p-4 border shadow-sm sticky-top"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        top: '90px',
      }}
    >
      <h5 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--text-primary)' }}>
        Order Summary
      </h5>

      {!isCheckout && <CouponWidget />}

      {/* Financials Breakdown */}
      <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.9rem' }}>
        <div className="d-flex justify-content-between text-secondary">
          <span>Items Subtotal ({cart.itemsCount || 0} items)</span>
          <span className="fw-semibold text-primary">${(cart.subtotal || 0).toFixed(2)}</span>
        </div>

        {cart.discount > 0 && (
          <div className="d-flex justify-content-between text-success">
            <span>Coupon Discount</span>
            <span className="fw-semibold">-${cart.discount.toFixed(2)}</span>
          </div>
        )}

        <div className="d-flex justify-content-between text-secondary">
          <span>Estimated Shipping</span>
          <span>
            {cart.shippingFee === 0 ? (
              <span className="badge badge-success">FREE</span>
            ) : (
              `$${cart.shippingFee.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="d-flex justify-content-between text-secondary">
          <span>Estimated Sales Tax (8%)</span>
          <span>${(cart.tax || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Grand Total */}
      <div className="d-flex justify-content-between align-items-center pt-3 border-top mb-4">
        <span className="fw-bold fs-6" style={{ color: 'var(--text-primary)' }}>
          Total Payable
        </span>
        <span className="fw-extrabold fs-4" style={{ color: 'var(--color-primary)' }}>
          ${(cart.grandTotal || 0).toFixed(2)}
        </span>
      </div>

      {/* Checkout CTA */}
      {onCheckout ? (
        <button
          onClick={onCheckout}
          className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 fs-6"
        >
          {checkoutButtonText} <ArrowRight size={18} />
        </button>
      ) : (
        <Link
          to="/checkout"
          className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 fs-6 text-decoration-none"
        >
          {checkoutButtonText} <ArrowRight size={18} />
        </Link>
      )}

      {/* Trust Seal */}
      <div className="d-flex align-items-center justify-content-center gap-2 text-muted mt-3" style={{ fontSize: '0.78rem' }}>
        <ShieldCheck size={16} className="text-success" />
        Guaranteed 256-Bit Encrypted Checkout
      </div>
    </div>
  );
};

export default OrderSummaryCard;
