import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { commerceDb } from '../services/supabase/supabaseClient';

const CartContext = createContext();
const CART_STORAGE_KEY = 'cmcart_cart_items_v2';
const SAVED_STORAGE_KEY = 'cmcart_saved_items_v2';

export function CartProvider({ children }) {
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [
        // Seeded initial item for instant preview
        {
          id: 'cart-init-1',
          productId: 'prod-1',
          name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
          variant: 'Midnight Black',
          price: 26990,
          originalPrice: 34990,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          stock: 24
        }
      ];
    } catch {
      return [];
    }
  });

  const [savedForLater, setSavedForLater] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    return cartItems.map((i) => i.id);
  });

  // Keep selectedItemIds in sync when cart items are added/removed
  useEffect(() => {
    setSelectedItemIds((prev) => {
      const currentIds = cartItems.map((i) => i.id);
      // If newly added items exist, select them by default
      const newlyAdded = currentIds.filter((id) => !prev.includes(id));
      if (newlyAdded.length > 0) {
        return [...prev.filter((id) => currentIds.includes(id)), ...newlyAdded];
      }
      return prev.filter((id) => currentIds.includes(id));
    });
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedForLater));
  }, [savedForLater]);

  const toggleSelectItem = (cartItemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(cartItemId) ? prev.filter((id) => id !== cartItemId) : [...prev, cartItemId]
    );
  };

  const selectAllItems = () => {
    setSelectedItemIds(cartItems.map((i) => i.id));
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
  };

  const addToCart = (product, variant = null, quantity = 1) => {
    const variantName = variant?.name || (typeof variant === 'string' ? variant : 'Default');
    const existingIndex = cartItems.findIndex(
      (item) => item.productId === product.id && item.variant === variantName
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
      showToast(`Updated ${product.name} quantity to ${updated[existingIndex].quantity}`, 'success');
    } else {
      const newItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        name: product.name,
        variant: variantName,
        price: variant?.price || product.current_price,
        originalPrice: product.original_price,
        quantity: quantity,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        stock: product.stock || 20
      };
      setCartItems((prev) => [...prev, newItem]);
      setSelectedItemIds((prev) => [...prev, newItem.id]);
      showToast(`Added ${product.name} to Cart`, 'success');
    }
  };

  const removeFromCart = (cartItemId) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
    if (item) showToast(`Removed ${item.name} from Cart`, 'info');
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const saveForLaterItem = (cartItemId) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
    setSavedForLater((prev) => [...prev, item]);
    showToast(`Saved "${item.name}" for later`, 'info');
  };

  const moveToCart = (savedItemId) => {
    const item = savedForLater.find((i) => i.id === savedItemId);
    if (!item) return;
    setSavedForLater((prev) => prev.filter((i) => i.id !== savedItemId));
    setCartItems((prev) => [...prev, item]);
    showToast(`Moved "${item.name}" back to Cart`, 'success');
  };

  const removeSavedItem = (savedItemId) => {
    setSavedForLater((prev) => prev.filter((i) => i.id !== savedItemId));
  };

  const applyCoupon = async (code) => {
    const coupons = await commerceDb.getCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);

    if (!found) {
      showToast('Invalid coupon code', 'error');
      return { success: false, message: 'Invalid coupon code' };
    }

    if (subtotal < (found.minimum_order_amount || 0)) {
      showToast(`Minimum order amount of ₹${found.minimum_order_amount} required`, 'error');
      return { success: false, message: `Minimum order of ₹${found.minimum_order_amount} required` };
    }

    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied successfully!`, 'success');
    return { success: true, coupon: found };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedItemIds([]);
    setAppliedCoupon(null);
  };

  const clearPurchasedItems = () => {
    setCartItems((prev) => prev.filter((item) => !selectedItemIds.includes(item.id)));
    setSelectedItemIds([]);
    setAppliedCoupon(null);
  };

  // Calculations ONLY for selected items
  const selectedCartItems = cartItems.filter((item) => selectedItemIds.includes(item.id));

  const subtotal = selectedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalOriginal = selectedCartItems.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0);
  const catalogDiscount = Math.max(0, totalOriginal - subtotal);

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      couponDiscount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
      if (appliedCoupon.maximum_discount_amount) {
        couponDiscount = Math.min(couponDiscount, appliedCoupon.maximum_discount_amount);
      }
    } else {
      couponDiscount = appliedCoupon.discount_value;
    }
  }

  // Delivery: Free if subtotal > 999 or FREESHIP coupon
  const deliveryFee = subtotal === 0 || subtotal >= 999 || appliedCoupon?.code === 'FREESHIP' ? 0 : 99;
  
  // Tax 18% GST display breakdown (typically included or computed)
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const taxAmount = Math.round(taxableAmount * 0.18);
  const totalAmount = taxableAmount + deliveryFee;

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const selectedCount = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedItemIds,
        selectedCartItems,
        toggleSelectItem,
        selectAllItems,
        deselectAllItems,
        savedForLater,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveForLater: saveForLaterItem,
        moveToCart,
        removeSavedItem,
        applyCoupon,
        removeCoupon,
        clearCart,
        clearPurchasedItems,
        appliedCoupon,
        subtotal,
        totalOriginal,
        catalogDiscount,
        couponDiscount,
        deliveryFee,
        taxAmount,
        totalAmount,
        count: totalCount,
        selectedCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
