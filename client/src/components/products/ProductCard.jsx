import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isFavorited = isInWishlist(product._id);
  const primaryImg =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    const success = await addToCart(product._id, 1);
    setIsAdding(false);

    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlist(product._id);
  };

  return (
    <div className="card product-card">
      {/* 1. Image Viewport with Badges & Wishlist Trigger */}
      <div className="product-card-img-wrapper">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={primaryImg}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className={`product-card-wishlist-btn ${isFavorited ? 'active' : ''}`}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Toggle Wishlist"
        >
          <Heart size={18} fill={isFavorited ? '#EF4444' : 'none'} stroke={isFavorited ? '#EF4444' : 'currentColor'} />
        </button>

        {/* Promo Badges (Top Left) */}
        <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1" style={{ zIndex: 4 }}>
          {hasDiscount && (
            <Badge variant="secondary" pill>
              -{product.discountPercent || Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
            </Badge>
          )}
          {product.isNewArrival && (
            <Badge variant="primary" pill>
              New
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="danger" pill>
              Sold Out
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Card Content & Metadata */}
      <div className="card-body p-3 d-flex flex-column">
        {/* Brand & Category */}
        <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
          <span className="text-muted text-uppercase fw-semibold">{product.brand || 'ShopSphere'}</span>
          {product.category?.name && (
            <span className="text-muted text-truncate" style={{ maxWidth: '100px' }}>
              {product.category.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h6 className="card-title fw-bold mb-2 text-truncate-2" style={{ minHeight: '2.5rem', lineHeight: 1.35 }}>
          <Link
            to={`/product/${product.slug || product._id}`}
            className="text-decoration-none"
            style={{ color: 'var(--text-primary)' }}
          >
            {product.name}
          </Link>
        </h6>

        {/* Ratings */}
        <div className="mb-2">
          <RatingStars
            rating={product.ratings?.average || 4.5}
            count={product.ratings?.count || 0}
            size={13}
          />
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-2 d-flex align-items-center justify-content-between border-top" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="d-flex flex-column">
            <span className="fw-extrabold fs-5 lh-1" style={{ color: 'var(--text-primary)' }}>
              ${currentPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-muted text-decoration-line-through mt-1" style={{ fontSize: '0.8rem' }}>
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`btn btn-sm d-flex align-items-center justify-content-center p-2 rounded-circle border-0 ${
              justAdded ? 'btn-success text-white' : 'btn-primary'
            }`}
            style={{ width: '38px', height: '38px' }}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            aria-label="Add to cart"
          >
            {justAdded ? (
              <Check size={18} />
            ) : isAdding ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
