import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { productService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotification } from '../../context/NotificationContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import RatingStars from '../../components/common/RatingStars';
import Badge from '../../components/common/Badge';
import ImageGallery from '../../components/products/ImageGallery';
import ReviewSection from '../../components/products/ReviewSection';
import ProductGrid from '../../components/products/ProductGrid';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { notify } = useNotification();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'shipping'

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await productService.getByIdentifier(slug);
        if (res.success && res.product) {
          setProduct(res.product);
          setQuantity(1);

          // Fetch related products
          if (res.product._id) {
            const relRes = await productService.getRelated(res.product._id);
            if (relRes.success) setRelatedProducts(relRes.products || []);
          }
        } else {
          notify.error('Product not found');
          navigate('/shop');
        }
      } catch (err) {
        notify.error(err.message);
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, navigate, notify]);

  if (loading || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading product...</span>
        </div>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    await addToCart(product._id, quantity);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    const success = await addToCart(product._id, quantity);
    setIsAdding(false);
    if (success) {
      navigate('/checkout');
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-5 py-3">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Shop', link: '/shop' },
          { label: product.category?.name || 'Category', link: `/shop?category=${product.category?.slug}` },
          { label: product.name },
        ]}
      />

      {/* Main Product Layout */}
      <div className="row g-4 g-lg-5 mt-1">
        {/* Left Column: Image Gallery */}
        <div className="col-12 col-lg-6">
          <ImageGallery images={product.images} />
        </div>

        {/* Right Column: Information, Pricing, Actions */}
        <div className="col-12 col-lg-6">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '0.06em' }}>
              {product.brand || 'ShopSphere'}
            </span>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              SKU: <strong>{product.sku}</strong>
            </span>
          </div>

          <h1 className="fw-extrabold mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.85rem', lineHeight: 1.3 }}>
            {product.name}
          </h1>

          {/* Rating and Reviews Counter */}
          <div className="d-flex align-items-center gap-3 mb-3">
            <RatingStars
              rating={product.ratings?.average || 4.5}
              count={product.ratings?.count || 0}
              size={16}
            />
            {product.isTrending && (
              <span className="badge badge-tangerine d-flex align-items-center gap-1">
                <Sparkles size={12} /> Popular Choice
              </span>
            )}
          </div>

          {/* Price & Discount */}
          <div className="p-3 rounded-3 mb-3 d-flex align-items-baseline gap-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <span className="display-6 fw-extrabold" style={{ color: 'var(--color-primary)' }}>
              ${currentPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="fs-5 text-muted text-decoration-line-through">
                  ${product.price.toFixed(2)}
                </span>
                <Badge variant="secondary" pill>
                  Save {product.discountPercent}%
                </Badge>
              </>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="mb-4">
            {isOutOfStock ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge badge-warning">
                Hurry! Only {product.stock} items left in stock
              </span>
            ) : (
              <span className="badge badge-success d-inline-flex align-items-center gap-1">
                <Check size={14} /> In Stock & Ready to Ship
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-secondary mb-4" style={{ fontSize: '0.96rem', lineHeight: 1.6 }}>
            {product.shortDescription || product.description}
          </p>

          {/* Quantity Selector & Action Buttons */}
          <div className="d-flex flex-column gap-3 mb-4">
            <div className="d-flex align-items-center gap-3">
              <span className="fw-semibold text-secondary" style={{ fontSize: '0.9rem' }}>
                Quantity:
              </span>
              <div
                className="d-flex align-items-center border rounded"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="btn btn-sm p-2 border-0 text-muted"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="px-3 fw-bold" style={{ minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="btn btn-sm p-2 border-0 text-muted"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="btn btn-primary flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 fs-6"
              >
                {isAdding ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || isAdding}
                className="btn btn-secondary flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 fs-6"
              >
                <Zap size={18} /> Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product._id)}
                className={`btn btn-outline-secondary p-3 rounded-circle d-flex align-items-center justify-content-center ${
                  isFavorited ? 'text-danger border-danger' : ''
                }`}
                style={{ width: '50px', height: '50px', flexShrink: 0 }}
                title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isFavorited ? '#EF4444' : 'none'} />
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Badges */}
          <div className="card p-3 border mb-4" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
            <div className="d-flex flex-column gap-2" style={{ fontSize: '0.84rem' }}>
              <div className="d-flex align-items-center gap-2 text-secondary">
                <Truck size={16} className="text-primary" /> Free shipping on orders over $100
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary">
                <ShieldCheck size={16} className="text-success" /> 100% Verified Authentic Merchandise
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary">
                <RotateCcw size={16} className="text-primary" /> 14-day hassle-free return window
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Detailed Description */}
      <div className="mt-5">
        <ul className="nav nav-tabs border-bottom mb-4" style={{ borderColor: 'var(--border-color)' }}>
          <li className="nav-item">
            <button
              className={`nav-link border-0 fw-bold pb-3 ${activeTab === 'specs' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
              style={{ background: 'transparent', fontSize: '1rem' }}
              onClick={() => setActiveTab('specs')}
            >
              Technical Specifications & Details
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link border-0 fw-bold pb-3 ${activeTab === 'shipping' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
              style={{ background: 'transparent', fontSize: '1rem' }}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Returns Policy
            </button>
          </li>
        </ul>

        {activeTab === 'specs' ? (
          <div className="card p-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h6 className="fw-bold mb-3">Product Overview</h6>
            <p className="text-secondary mb-4" style={{ lineHeight: 1.7 }}>
              {product.description}
            </p>

            {product.specifications && product.specifications.length > 0 && (
              <>
                <h6 className="fw-bold mb-3">Key Specifications</h6>
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i}>
                          <th style={{ width: '30%', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                            {spec.key}
                          </th>
                          <td style={{ color: 'var(--text-primary)' }}>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="card p-4 border" style={{ backgroundColor: 'var(--bg-card)', lineHeight: 1.7 }}>
            <h6 className="fw-bold mb-2">Fast & Secure Shipping</h6>
            <p className="text-secondary mb-3">
              Orders are dispatched within 24 hours of payment confirmation. Domestic orders typically arrive in 2-4 business days. Real-time carrier tracking is automatically provisioned for every shipment.
            </p>
            <h6 className="fw-bold mb-2">14-Day Return Guarantee</h6>
            <p className="text-secondary mb-0">
              If you are not completely satisfied with your purchase, you may initiate a return within 14 calendar days of delivery in original packaging for a full refund or exchange.
            </p>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <ReviewSection
        productId={product._id}
        averageRating={product.ratings?.average || 4.5}
        reviewsCount={product.ratings?.count || 0}
      />

      {/* Related Products Rail */}
      {relatedProducts.length > 0 && (
        <div className="mt-5 pt-4">
          <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            You May Also Like
          </h4>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
