import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ArrowUpDown } from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import ProductGrid from '../../components/products/ProductGrid';
import ProductFilters from '../../components/products/ProductFilters';
import Pagination from '../../components/common/Pagination';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States from URL or defaults
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.success) setCategories(res.categories || []);
    });
  }, []);

  // Update query params helper
  const updateParams = useCallback((newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === '' || val === null || val === undefined || val === false) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset page to 1 if filter changed (unless page itself is changing)
    if (!('page' in newParams)) {
      next.delete('page');
    }
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  // Fetch Products whenever URL search params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          search,
          category,
          minPrice,
          maxPrice,
          minRating,
          inStock: inStock ? 'true' : undefined,
          sort,
          page,
          limit: 12,
        };

        const res = await productService.getAll(params);
        if (res.success) {
          setProducts(res.products || []);
          setTotalProducts(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.warn('[Shop] Fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [search, category, minPrice, maxPrice, minRating, inStock, sort, page]);

  // Handlers
  const handleCategoryChange = (catSlug) => updateParams({ category: catSlug });
  const handlePriceChange = (min, max) => updateParams({ minPrice: min, maxPrice: max });
  const handleRatingChange = (stars) => updateParams({ minRating: stars });
  const handleStockChange = (checked) => updateParams({ inStock: checked });
  const handleSortChange = (e) => updateParams({ sort: e.target.value });
  const handlePageChange = (newPage) => updateParams({ page: newPage });

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Find category name for display
  const currentCategoryName = categories.find((c) => c.slug === category || c._id === category)?.name;

  return (
    <div className="container-fluid px-3 px-lg-5 py-3">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Shop', link: '/shop' },
          ...(currentCategoryName ? [{ label: currentCategoryName }] : []),
          ...(search ? [{ label: `Search: "${search}"` }] : []),
        ]}
      />

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 py-3 border-bottom mb-4">
        <div>
          <h2 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            {currentCategoryName || (search ? `Results for "${search}"` : 'All Products')}
          </h2>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Showing {products.length} of {totalProducts} products
          </span>
        </div>

        {/* Sorting Dropdown & Mobile Filter Trigger */}
        <div className="d-flex align-items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-outline-secondary d-lg-none d-inline-flex align-items-center gap-2"
          >
            <Filter size={16} /> Filters
          </button>

          {/* Sort Selector */}
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted text-nowrap d-none d-sm-inline" style={{ fontSize: '0.88rem' }}>
              Sort by:
            </span>
            <select
              className="form-select form-select-sm"
              value={sort}
              onChange={handleSortChange}
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(category || search || minPrice || maxPrice || minRating || inStock) && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
          <span className="text-muted" style={{ fontSize: '0.82rem' }}>
            Active Filters:
          </span>

          {currentCategoryName && (
            <span className="badge badge-primary d-inline-flex align-items-center gap-1">
              Category: {currentCategoryName}
              <button
                onClick={() => handleCategoryChange('')}
                className="btn btn-sm p-0 border-0 text-primary ms-1"
                aria-label="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {search && (
            <span className="badge badge-primary d-inline-flex align-items-center gap-1">
              Search: "{search}"
              <button
                onClick={() => updateParams({ search: '' })}
                className="btn btn-sm p-0 border-0 text-primary ms-1"
                aria-label="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="badge badge-primary d-inline-flex align-items-center gap-1">
              Price: ${minPrice || '0'} - ${maxPrice || '1000+'}
              <button
                onClick={() => handlePriceChange('', '')}
                className="btn btn-sm p-0 border-0 text-primary ms-1"
                aria-label="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {minRating && (
            <span className="badge badge-primary d-inline-flex align-items-center gap-1">
              {minRating}+ Stars
              <button
                onClick={() => handleRatingChange('')}
                className="btn btn-sm p-0 border-0 text-primary ms-1"
                aria-label="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {inStock && (
            <span className="badge badge-primary d-inline-flex align-items-center gap-1">
              In Stock Only
              <button
                onClick={() => handleStockChange(false)}
                className="btn btn-sm p-0 border-0 text-primary ms-1"
                aria-label="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            onClick={handleClearFilters}
            className="btn btn-link btn-sm text-decoration-none text-muted p-0 ms-2"
            style={{ fontSize: '0.8rem' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Grid & Sidebar Layout */}
      <div className="row g-4">
        {/* Desktop Sidebar (col-lg-3) */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="sticky-top" style={{ top: '90px' }}>
            <ProductFilters
              categories={categories}
              selectedCategory={category}
              onCategoryChange={handleCategoryChange}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
              minRating={minRating}
              onRatingChange={handleRatingChange}
              inStock={inStock}
              onStockChange={handleStockChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Product Grid Column (col-12 col-lg-9) */}
        <div className="col-12 col-lg-9">
          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Mobile Filters Offcanvas */}
      {mobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1060,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '340px',
              height: '100%',
              backgroundColor: 'var(--bg-card)',
              padding: '1.25rem',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="mb-0 fw-bold">Filters</h5>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-sm p-1 border-0"
              >
                <X size={20} />
              </button>
            </div>

            <ProductFilters
              categories={categories}
              selectedCategory={category}
              onCategoryChange={(val) => {
                handleCategoryChange(val);
                setMobileFilterOpen(false);
              }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
              minRating={minRating}
              onRatingChange={handleRatingChange}
              inStock={inStock}
              onStockChange={handleStockChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
