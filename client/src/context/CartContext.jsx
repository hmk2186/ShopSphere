import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { notify } = useNotification();
  const [cart, setCart] = useState({
    items: [],
    itemsCount: 0,
    subtotal: 0,
    discount: 0,
    appliedCoupon: null,
    shippingFee: 0,
    tax: 0,
    grandTotal: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({
        items: [],
        itemsCount: 0,
        subtotal: 0,
        discount: 0,
        appliedCoupon: null,
        shippingFee: 0,
        tax: 0,
        grandTotal: 0,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.warn('[Cart] Fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      notify.warning('Please log in to add items to your cart.');
      return false;
    }

    try {
      setLoading(true);
      const res = await cartService.addItem(productId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
        notify.success('Added to your shopping cart!');
        return true;
      }
      return false;
    } catch (error) {
      notify.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await cartService.updateQuantity(productId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
        return true;
      }
      return false;
    } catch (error) {
      notify.error(error.message);
      return false;
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await cartService.removeItem(productId);
      if (res.success && res.cart) {
        setCart(res.cart);
        notify.info('Item removed from cart.');
        return true;
      }
      return false;
    } catch (error) {
      notify.error(error.message);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartService.clearCart();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await cartService.applyCoupon(code);
      if (res.success && res.cart) {
        setCart(res.cart);
        notify.success(`Coupon applied! Saved $${res.cart.discount}`);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (error) {
      notify.error(error.message);
      return { success: false, message: error.message };
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await cartService.removeCoupon();
      if (res.success && res.cart) {
        setCart(res.cart);
        notify.info('Coupon removed.');
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount: cart.itemsCount || 0,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
