import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useNotification } from './NotificationContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { fetchCart } = useCart();
  const { notify } = useNotification();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      if (res.success && res.wishlist) {
        setWishlist(res.wishlist);
      }
    } catch (err) {
      console.warn('[Wishlist] Fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      notify.warning('Please log in to manage your wishlist.');
      return false;
    }

    try {
      const res = await wishlistService.toggle(productId);
      if (res.success) {
        setWishlist(res.wishlist || []);
        if (res.isAdded) {
          notify.success('Saved to your wishlist!');
        } else {
          notify.info('Removed from your wishlist.');
        }
        return res.isAdded;
      }
      return false;
    } catch (error) {
      notify.error(error.message);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await wishlistService.remove(productId);
      if (res.success) {
        setWishlist(res.wishlist || []);
        notify.info('Removed from wishlist.');
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  const moveToCart = async (productId) => {
    try {
      const res = await wishlistService.moveToCart(productId);
      if (res.success) {
        setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
        await fetchCart();
        notify.success('Moved to shopping cart!');
        return true;
      }
      return false;
    } catch (error) {
      notify.error(error.message);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
