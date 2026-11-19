import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import EmptyState from '../../components/common/EmptyState';
import RatingStars from '../../components/common/RatingStars';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist, moveToCart } = useWishlist();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const hasItems = wishlist && wishlist.length > 0;

  return (
    <div className="container-fluid px-3 px-lg-5 py-3">
      <Breadcrumbs items={[{ label: 'Saved Wishlist' }]} />

      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
        <div>
          <h2 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            My Wishlist
          </h2>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            {hasItems ? `${wishlist.length} saved products` : 'No saved products yet'}
          </span>
        </div>
      </div>

      {!hasItems ? (
        <EmptyState
          icon={<Heart size={48} />}
          title="Your Wishlist is Empty"
          description="Save items you love by clicking the heart icon on any product card, and find them here anytime."
          actionText="Discover Products"
          actionLink="/shop"
        />
      ) : (
        <div className="row g-3 g-md-4">
          {wishlist.map((product) => {
            if (!product) return null;
            const primaryImg =
              product.images && product.images.length > 0
                ? product.images[0].url
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';

            const price = product.discountPrice !== null ? product.discountPrice : product.price;

            return (
              <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 product-card">
                  <div className="product-card-img-wrapper">
                    <Link to={`/product/${product.slug || product._id}`}>
                      <img src={primaryImg} alt={product.name} className="product-card-img" />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="product-card-wishlist-btn text-danger"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="card-body p-3 d-flex flex-column">
                    <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                      {product.brand || 'ShopSphere'}
                    </span>
                    <h6 className="fw-bold mb-2 text-truncate" style={{ color: 'var(--text-primary)' }}>
                      <Link to={`/product/${product.slug || product._id}`} className="text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                        {product.name}
                      </Link>
                    </h6>
                    <div className="mb-2">
                      <RatingStars rating={product.ratings?.average || 4.5} size={13} showValue={false} />
                    </div>

                    <div className="mt-auto pt-2 d-flex align-items-center justify-content-between border-top">
                      <span className="fw-bold fs-5 text-primary">${price.toFixed(2)}</span>
                      <button
                        onClick={() => moveToCart(product._id)}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                      >
                        <ShoppingCart size={15} /> Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
