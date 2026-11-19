import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart, Plus, Minus } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

const CartItemRow = ({ item, onUpdateQuantity, onRemove }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!item || !item.product) return null;

  const product = item.product;
  const isFavorited = isInWishlist(product._id);
  const primaryImg =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';

  return (
    <div
      className="card p-3 mb-3 border"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        {/* Left: Product Image & Details */}
        <div className="d-flex align-items-center gap-3">
          <Link
            to={`/product/${product.slug || product._id}`}
            style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
          >
            <img
              src={primaryImg}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Link>

          <div>
            <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
              {product.brand || 'ShopSphere'}
            </span>
            <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>
              <Link
                to={`/product/${product.slug || product._id}`}
                className="text-decoration-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {product.name}
              </Link>
            </h6>
            <div className="fw-bold text-primary" style={{ fontSize: '0.92rem' }}>
              ${item.price.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Right: Quantity Stepper, Line Subtotal & Actions */}
        <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 gap-md-4 mt-2 mt-sm-0">
          {/* Stepper */}
          <div
            className="d-flex align-items-center border rounded"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
          >
            <button
              onClick={() => onUpdateQuantity(product._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="btn btn-sm p-1 border-0 text-muted"
              style={{ width: '32px', height: '32px' }}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="px-2 fw-bold" style={{ minWidth: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product._id, item.quantity + 1)}
              disabled={item.availableStock !== undefined && item.quantity >= item.availableStock}
              className="btn btn-sm p-1 border-0 text-muted"
              style={{ width: '32px', height: '32px' }}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Subtotal */}
          <div className="text-end" style={{ minWidth: '80px' }}>
            <div className="fw-extrabold fs-6" style={{ color: 'var(--text-primary)' }}>
              ${item.subtotal.toFixed(2)}
            </div>
          </div>

          {/* Action Icons */}
          <div className="d-flex align-items-center gap-1">
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`btn btn-sm p-2 rounded-circle border-0 ${isFavorited ? 'text-danger' : 'text-muted'}`}
              title={isFavorited ? 'In Wishlist' : 'Save for later'}
            >
              <Heart size={16} fill={isFavorited ? '#EF4444' : 'none'} />
            </button>
            <button
              onClick={() => onRemove(product._id)}
              className="btn btn-sm p-2 rounded-circle border-0 text-danger"
              title="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;
