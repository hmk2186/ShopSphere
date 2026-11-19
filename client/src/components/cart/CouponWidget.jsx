import React, { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CouponWidget = () => {
  const { cart, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setLoading(true);
    await applyCoupon(couponCode.trim());
    setLoading(false);
    setCouponCode('');
  };

  const applied = cart?.appliedCoupon;

  return (
    <div
      className="card p-3 mb-3 border"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="d-flex align-items-center gap-2 mb-2 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
        <Tag size={16} className="text-secondary" />
        Promotional Coupon
      </div>

      {applied ? (
        <div
          className="d-flex align-items-center justify-content-between p-2 rounded"
          style={{ backgroundColor: 'var(--color-success-bg)', border: '1px dashed var(--color-success)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <Check size={16} className="text-success" />
            <div>
              <span className="fw-bold text-success" style={{ fontSize: '0.88rem' }}>
                {applied.code}
              </span>
              <span className="text-muted ms-2" style={{ fontSize: '0.78rem' }}>
                -${applied.discountAmount.toFixed(2)} applied
              </span>
            </div>
          </div>
          <button
            onClick={removeCoupon}
            className="btn btn-sm p-1 border-0 text-danger"
            title="Remove coupon"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm text-uppercase"
            placeholder="e.g. SPHERE25"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !couponCode.trim()}
            className="btn btn-sm btn-secondary text-nowrap px-3"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </form>
      )}

      {/* Recommended suggestions hint */}
      {!applied && (
        <div className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
          Try codes: <strong className="text-primary">SPHERE25</strong> (25% off) or{' '}
          <strong className="text-primary">WELCOME10</strong> (10% off)
        </div>
      )}
    </div>
  );
};

export default CouponWidget;
