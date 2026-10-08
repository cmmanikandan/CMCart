import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { commerceDb } from '../services/supabase/supabaseClient';

const WishlistContext = createContext();
const WISHLIST_KEY = 'cmcart_wishlist_v1';

export function WishlistProvider({ children }) {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clear obsolete mock seed item
        return parsed.filter((item) => item.id !== 'prod-2');
      }
      return [];
    } catch {
      return [];
    }
  });

  // Purge products that were deleted or deactivated by admin from customer wishlist
  useEffect(() => {
    let isSubscribed = true;
    commerceDb.getProducts().then((liveProducts) => {
      if (!isSubscribed || !Array.isArray(liveProducts)) return;
      const validIds = new Set(
        liveProducts
          .filter((p) => p.status !== 'inactive' && p.status !== 'deleted')
          .map((p) => String(p.id))
      );
      setWishlist((prev) => {
        const cleaned = prev.filter((item) => validIds.has(String(item.id)));
        if (cleaned.length !== prev.length) {
          localStorage.setItem(WISHLIST_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      });
    }).catch((e) => console.warn('Wishlist product validation notice:', e));
    return () => { isSubscribed = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    if (!user) {
      showToast('Please sign in to add items to your wishlist!', 'warning');
      return false;
    }

    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast('Removed from Wishlist', 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast('Added to Wishlist!', 'success');
    }
    return true;
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    showToast('Removed from Wishlist', 'info');
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        count: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
