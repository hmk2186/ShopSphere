import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Flame,
  TrendingUp,
  Award,
  Zap,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import ProductGrid from '../../components/products/ProductGrid';
import AnnouncementBar from '../../components/layout/AnnouncementBar';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flash Deal Countdown state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, featRes, trendRes, newRes] = await Promise.all([
          categoryService.getAll(),
          productService.getFeatured(),
          productService.getTrending(),
          productService.getNewArrivals(),
        ]);

        if (catRes.success) setCategories(catRes.categories || []);
        if (featRes.success) setFeaturedProducts(featRes.products || []);
        if (trendRes.success) setTrendingProducts(trendRes.products || []);
        if (newRes.success) setNewArrivals(newRes.products || []);
      } catch (err) {
        console.warn('[Home] Data fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="pb-5">
      <AnnouncementBar />

      {/* 1. Hero Showcase Section */}
      <section className="py-4 py-md-5 mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container-fluid px-3 px-lg-5">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Sparkles size={16} className="text-warning" />
                <span className="fw-bold" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                  Cobalt & Tangerine Collection 2026
                </span>
              </div>

              <h1 className="display-4 fw-extrabold mb-3 lh-sm" style={{ color: 'var(--text-primary)' }}>
                Elevate Everyday Living with <span style={{ color: 'var(--color-primary)' }}>Curated</span> Excellence.
              </h1>

              <p className="lead text-secondary mb-4" style={{ fontSize: '1.1rem', maxWidth: '580px', lineHeight: 1.6 }}>
                Discover masterfully crafted audio, sustainable apparel, minimal workspace architecture, and wellness essentials delivered straight to your door.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link to="/shop" className="btn btn-primary px-4 py-3 fw-bold d-inline-flex align-items-center gap-2 fs-6">
                  Explore Catalogue <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=electronics-audio" className="btn btn-outline-secondary px-4 py-3 fw-bold fs-6">
                  Shop Sound & Tech
                </Link>
              </div>

              {/* Quick stats banner */}
              <div className="row g-3 mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="col-4">
                  <div className="fw-extrabold fs-4" style={{ color: 'var(--color-primary)' }}>500+</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>Curated Items</div>
                </div>
                <div className="col-4">
                  <div className="fw-extrabold fs-4" style={{ color: 'var(--color-secondary)' }}>99.8%</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>Customer Approval</div>
                </div>
                <div className="col-4">
                  <div className="fw-extrabold fs-4" style={{ color: 'var(--color-primary)' }}>24h</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>Express Dispatch</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="position-relative">
                <div
                  className="rounded-4 overflow-hidden shadow-lg"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
                    alt="AcousticPro Studio Headphones"
                    className="img-fluid rounded-3 w-100"
                    style={{ objectFit: 'cover', maxHeight: '420px' }}
                  />
                  <div className="p-3 d-flex align-items-center justify-content-between">
                    <div>
                      <span className="badge badge-tangerine mb-1">Featured Spotlight</span>
                      <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '240px' }}>
                        AcousticPro Studio Wireless
                      </h6>
                    </div>
                    <div className="text-end">
                      <span className="fw-extrabold fs-5 text-primary">$249.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Rail */}
      <section className="container-fluid px-3 px-lg-5 mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Explore Categories
            </h3>
            <span className="text-muted" style={{ fontSize: '0.88rem' }}>
              Hand-picked selections crafted for your modern lifestyle
            </span>
          </div>
          <Link to="/shop" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
            Browse All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="row g-3 g-md-4">
          {categories.map((cat) => (
            <div key={cat._id} className="col-6 col-md-4 col-lg-2">
              <Link
                to={`/shop?category=${cat.slug}`}
                className="card text-decoration-none h-100 p-3 text-center border overflow-hidden hover-card"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  className="rounded-circle mx-auto mb-3 overflow-hidden d-flex align-items-center justify-content-center"
                  style={{ width: '80px', height: '80px', backgroundColor: 'var(--bg-subtle)' }}
                >
                  <img
                    src={cat.image?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h6 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {cat.name}
                </h6>
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                  {cat.productCount || 'Explore'} Items
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Deal of the Day Tangerine Flash Banner */}
      <section className="container-fluid px-3 px-lg-5 mb-5">
        <div
          className="rounded-4 p-4 p-lg-5 text-white position-relative overflow-hidden shadow-md"
          style={{
            background: 'linear-gradient(135deg, #FF8A35 0%, #E57218 50%, #B84D05 100%)',
          }}
        >
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-8">
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2 fw-bold"
                style={{ backgroundColor: '#FFFFFF', color: '#151C32', fontSize: '0.78rem' }}
              >
                <Flame size={16} className="text-danger" /> Tangerine Flash Deal
              </div>
              <h2 className="fw-extrabold display-6 mb-2">Save 25% on Premium Workspace & Sound</h2>
              <p className="mb-4 text-white-50" style={{ maxWidth: '520px', fontSize: '0.98rem' }}>
                Apply code <strong className="text-white">SPHERE25</strong> at checkout. Valid across noise-cancelling audio, walnut desk stands, and ergonomic accessories.
              </p>

              {/* Countdown Stepper */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <Clock size={20} />
                <span className="fw-semibold me-2">Ending in:</span>
                <div className="d-flex gap-2 text-center">
                  <div
                    className="rounded px-2 py-1 fw-bold"
                    style={{ backgroundColor: '#FFFFFF', color: '#151C32', minWidth: '42px' }}
                  >
                    <div>{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Hrs</div>
                  </div>
                  <div
                    className="rounded px-2 py-1 fw-bold"
                    style={{ backgroundColor: '#FFFFFF', color: '#151C32', minWidth: '42px' }}
                  >
                    <div>{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Min</div>
                  </div>
                  <div
                    className="rounded px-2 py-1 fw-bold"
                    style={{ backgroundColor: '#FFFFFF', color: '#151C32', minWidth: '42px' }}
                  >
                    <div>{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Sec</div>
                  </div>
                </div>
              </div>

              <Link
                to="/shop?category=electronics-audio"
                className="btn px-4 py-2 fw-bold"
                style={{ backgroundColor: '#FFFFFF', color: '#151C32' }}
              >
                Claim Flash Deal Now
              </Link>
            </div>

            <div className="col-12 col-md-4 text-center d-none d-md-block">
              <img
                src="https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=500&q=80"
                alt="Workspace Monitor Stand"
                className="img-fluid rounded-3 shadow-lg"
                style={{ maxHeight: '220px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trending Products Grid */}
      <section className="container-fluid px-3 px-lg-5 mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                Trending Right Now
              </h3>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                Most viewed and purchased items this week
              </span>
            </div>
          </div>
          <Link to="/shop?sort=popular" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </div>

        <ProductGrid products={trendingProducts} loading={loading} />
      </section>

      {/* 5. Best Sellers Rail */}
      <section className="container-fluid px-3 px-lg-5 mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
              <Award size={20} />
            </div>
            <div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                Best Sellers
              </h3>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                Top rated customer favorites with verified reviews
              </span>
            </div>
          </div>
          <Link to="/shop?sort=rating" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* 6. Promotional Split Banners */}
      <section className="container-fluid px-3 px-lg-5 mb-5">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div
              className="p-4 p-lg-5 rounded-4 position-relative overflow-hidden h-100 d-flex flex-column justify-content-between"
              style={{
                background: 'linear-gradient(135deg, #151C32 0%, #1E2B54 100%)',
                color: '#FFF',
                minHeight: '260px',
              }}
            >
              <div>
                <span className="badge badge-primary mb-2">Sustainable Fashion</span>
                <h3 className="fw-bold mb-2">Timeless Merino & Raw Selvedge</h3>
                <p className="text-white-50 mb-4" style={{ maxWidth: '380px', fontSize: '0.9rem' }}>
                  Natural thermoregulation and handcrafted Japanese shuttle-loom woven denim.
                </p>
              </div>
              <Link to="/shop?category=fashion-apparel" className="btn btn-primary d-inline-flex align-items-center gap-2 align-self-start">
                Shop Apparel <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div
              className="p-4 p-lg-5 rounded-4 position-relative overflow-hidden h-100 d-flex flex-column justify-content-between"
              style={{
                background: 'linear-gradient(135deg, #315FEA 0%, #234BCA 100%)',
                color: '#FFF',
                minHeight: '260px',
              }}
            >
              <div>
                <span
                  className="badge mb-2"
                  style={{ backgroundColor: '#FFFFFF', color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  Performance Gear
                </span>
                <h3 className="fw-bold mb-2">Adventure Waterproof TPU Packs</h3>
                <p className="text-white-50 mb-4" style={{ maxWidth: '380px', fontSize: '0.9rem' }}>
                  Submersible protection for alpine climbs, rainy commutes, and camera gear.
                </p>
              </div>
              <Link
                to="/shop?category=sports-outdoors"
                className="btn fw-bold d-inline-flex align-items-center gap-2 align-self-start"
                style={{ backgroundColor: '#FFFFFF', color: 'var(--color-primary)' }}
              >
                Explore Gear <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. New Arrivals Grid */}
      <section className="container-fluid px-3 px-lg-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                New Arrivals
              </h3>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                Fresh releases recently added to the marketplace
              </span>
            </div>
          </div>
          <Link to="/shop?sort=newest" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </div>

        <ProductGrid products={newArrivals} loading={loading} />
      </section>
    </div>
  );
};

export default HomePage;
