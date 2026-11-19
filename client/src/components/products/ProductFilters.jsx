import React from 'react';
import { Filter, RotateCcw, Star, Check } from 'lucide-react';

const ProductFilters = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  inStock,
  onStockChange,
  onClearFilters,
}) => {
  return (
    <div
      className="card p-4 border"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
        <div className="d-flex align-items-center gap-2 fw-bold fs-6" style={{ color: 'var(--text-primary)' }}>
          <Filter size={18} className="text-primary" />
          Filter Products
        </div>
        <button
          onClick={onClearFilters}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 border-0 py-1 px-2"
          style={{ fontSize: '0.8rem' }}
        >
          <RotateCcw size={14} /> Clear
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className="mb-4">
        <label className="form-label fw-bold mb-2">Category</label>
        <div className="d-flex flex-column gap-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`btn btn-sm text-start border-0 px-2 py-1 rounded d-flex justify-content-between align-items-center ${
              !selectedCategory ? 'fw-bold text-primary' : 'text-secondary'
            }`}
            style={{
              backgroundColor: !selectedCategory ? 'var(--color-primary-light)' : 'transparent',
              fontSize: '0.88rem',
            }}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check size={14} />}
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat._id;
            return (
              <button
                key={cat._id}
                onClick={() => onCategoryChange(cat.slug)}
                className={`btn btn-sm text-start border-0 px-2 py-1 rounded d-flex justify-content-between align-items-center ${
                  isSelected ? 'fw-bold text-primary' : 'text-secondary'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                  fontSize: '0.88rem',
                }}
              >
                <span className="text-truncate" style={{ maxWidth: '170px' }}>{cat.name}</span>
                {cat.productCount !== undefined && (
                  <span className="badge rounded-pill text-muted" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range Filter */}
      <div className="mb-4">
        <label className="form-label fw-bold mb-2">Price Range ($)</label>
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            min="0"
            max="1000"
            placeholder="Min"
            className="form-control form-control-sm text-center"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            min="0"
            max="1000"
            placeholder="Max"
            className="form-control form-control-sm text-center"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
          />
        </div>
      </div>

      {/* 3. Star Rating Filter */}
      <div className="mb-4">
        <label className="form-label fw-bold mb-2">Customer Rating</label>
        <div className="d-flex flex-column gap-1">
          {[4, 3, 2].map((stars) => {
            const isSelected = Number(minRating) === stars;
            return (
              <button
                key={stars}
                onClick={() => onRatingChange(isSelected ? '' : stars)}
                className={`btn btn-sm text-start border-0 px-2 py-1 rounded d-flex align-items-center justify-content-between ${
                  isSelected ? 'fw-bold text-primary' : 'text-secondary'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                  fontSize: '0.85rem',
                }}
              >
                <div className="d-flex align-items-center gap-1">
                  <Star size={14} fill="#FF8A35" stroke="#FF8A35" />
                  <span>{stars} Stars & Above</span>
                </div>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Availability Filter */}
      <div>
        <label className="form-label fw-bold mb-2">Availability</label>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="inStockOnly"
            checked={Boolean(inStock)}
            onChange={(e) => onStockChange(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <label className="form-check-label text-secondary" htmlFor="inStockOnly" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>
            In Stock Only
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
