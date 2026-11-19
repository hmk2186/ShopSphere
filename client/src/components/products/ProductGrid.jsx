import React from 'react';
import ProductCard from './ProductCard';
import SkeletonCard from '../common/SkeletonCard';
import EmptyState from '../common/EmptyState';
import { ShoppingBag } from 'lucide-react';

const ProductGrid = ({ products = [], loading = false, emptyTitle = 'No products found' }) => {
  if (loading) {
    return (
      <div className="product-grid">
        <SkeletonCard count={8} />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={40} />}
        title={emptyTitle}
        description="Try adjusting your search criteria, price range, or category filter to discover more products."
        actionText="View All Products"
        actionLink="/shop"
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
