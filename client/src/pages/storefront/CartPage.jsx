import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartItemRow from '../../components/cart/CartItemRow';
import OrderSummaryCard from '../../components/cart/OrderSummaryCard';
import EmptyState from '../../components/common/EmptyState';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <div className="container-fluid px-3 px-lg-5 py-3">
      <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />

      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
        <div>
          <h2 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Shopping Cart
          </h2>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            {hasItems ? `${cart.itemsCount} items in your bag` : 'Your cart is currently empty'}
          </span>
        </div>

        {hasItems && (
          <button
            onClick={() => {
              if (window.confirm('Clear all items from your cart?')) clearCart();
            }}
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
          >
            <Trash2 size={15} /> Clear Cart
          </button>
        )}
      </div>

      {!hasItems ? (
        <EmptyState
          icon={<ShoppingCart size={48} />}
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our curated catalogue and find something extraordinary!"
          actionText="Start Shopping"
          actionLink="/shop"
        />
      ) : (
        <div className="row g-4">
          {/* Left Column: Cart Items List */}
          <div className="col-12 col-lg-8">
            <div className="d-flex flex-column">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="mt-3">
              <Link to="/shop" className="text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Order Financial Summary */}
          <div className="col-12 col-lg-4">
            <OrderSummaryCard cart={cart} checkoutButtonText="Proceed to Checkout" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
