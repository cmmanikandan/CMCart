import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Bookmark,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  X,
  Truck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useCart } from '../../context/CartContext';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function CartPage() {
  const {
    cartItems,
    selectedItemIds,
    selectedCartItems,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    selectedCount,
    savedForLater,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    subtotal,
    catalogDiscount,
    couponDiscount,
    deliveryFee,
    taxAmount,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const isAllSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCode);
    setCouponLoading(false);
    setCouponCode('');
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our top deals and start shopping."
          actionText="Start Shopping"
          actionLink="/products"
        />

        {/* Display Saved For Later items if any */}
        {savedForLater && savedForLater.length > 0 && (
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-4">
              Saved For Later ({savedForLater.length})
            </h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {savedForLater.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#E63946] font-bold">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => moveToCart(item.id)}
                      variant="primary"
                      size="sm"
                    >
                      Move to Cart
                    </Button>
                    <button
                      onClick={() => removeSavedItem(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      <div className="bg-white dark:bg-[#181818] p-4 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
            Shopping Cart ({cartItems.length} items)
          </h1>
          {deliveryFee === 0 && (
            <p className="text-xs text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              Your order qualifies for FREE Express Delivery!
            </p>
          )}
        </div>

        {/* Select All Bar */}
        <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/60 px-3.5 py-2 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
          <input
            type="checkbox"
            id="cart-select-all"
            checked={isAllSelected}
            onChange={handleToggleSelectAll}
            className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946] accent-[#E63946] cursor-pointer"
          />
          <label htmlFor="cart-select-all" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
            Select All ({selectedItemIds.length}/{cartItems.length} for checkout)
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800/80 p-4 sm:p-6">
            {cartItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-60 bg-neutral-50/50 dark:bg-neutral-800/20 -mx-2 px-2 rounded-xl'
                  }`}
                >
                  {/* Select Checkbox & Item Image */}
                  <div className="flex items-center gap-3 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(item.id)}
                      aria-label={`Select ${item.name}`}
                      className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946] accent-[#E63946] cursor-pointer shrink-0"
                    />
                    <Link to={`/product/${item.productId}`} className="shrink-0">
                      <img
                        src={getOptimizedImageUrl(item.image, { width: 160 })}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700"
                      />
                    </Link>
                  </div>

                {/* Info & Quantity controls */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#E63946] line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.variant && item.variant !== 'Default' && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Variant: <span className="text-neutral-700 dark:text-neutral-300 font-medium">{item.variant}</span>
                      </p>
                    )}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Stepper */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/50 flex-wrap gap-2">
                    <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <button
                        onClick={() => saveForLater(item.id)}
                        className="flex items-center gap-1 text-neutral-500 hover:text-[#E63946] transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save for later</span>
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-neutral-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

          {/* Saved For Later items */}
          {savedForLater && savedForLater.length > 0 && (
            <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Saved For Later ({savedForLater.length})
              </h3>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {savedForLater.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#E63946] font-bold">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => moveToCart(item.id)}
                        variant="outline"
                        size="sm"
                      >
                        Move to Cart
                      </Button>
                      <button
                        onClick={() => removeSavedItem(item.id)}
                        className="p-1 text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Price Summary & Checkout (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Code Accordion */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 mb-2.5">
              <Tag className="w-4 h-4 text-[#E63946]" />
              Apply Discount Coupon
            </span>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <div>
                    <span className="text-xs font-bold text-[#16A34A]">{appliedCoupon.code}</span>
                    <p className="text-[10px] text-neutral-500">{appliedCoupon.description}</p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-neutral-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME50, BIGSAVER15"
                  className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs uppercase font-semibold focus:outline-none focus:border-[#E63946]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={couponLoading}
                >
                  Apply
                </Button>
              </form>
            )}

            <div className="mt-2.5 flex gap-1.5 flex-wrap text-[11px]">
              <span className="text-neutral-400">Available:</span>
              <button
                type="button"
                onClick={() => setCouponCode('WELCOME50')}
                className="text-[#E63946] font-semibold hover:underline"
              >
                WELCOME50
              </button>
              <span className="text-neutral-300">•</span>
              <button
                type="button"
                onClick={() => setCouponCode('BIGSAVER15')}
                className="text-[#E63946] font-semibold hover:underline"
              >
                BIGSAVER15
              </button>
            </div>
          </div>

          {/* Price Breakdown Summary */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Order Price Details
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Total Items MRP</span>
                <span>₹{(subtotal + catalogDiscount).toLocaleString('en-IN')}</span>
              </div>

              {catalogDiscount > 0 && (
                <div className="flex justify-between text-[#16A34A] font-semibold">
                  <span>Product Discount</span>
                  <span>-₹{catalogDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#16A34A] font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Estimated Taxes (18% GST)</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Delivery Charges</span>
                {deliveryFee === 0 ? (
                  <span className="text-[#16A34A] font-semibold">FREE</span>
                ) : (
                  <span>₹{deliveryFee}</span>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-base font-black text-neutral-900 dark:text-neutral-100">
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              variant="primary"
              size="lg"
              disabled={selectedCount === 0}
              className="w-full mt-4"
              icon={ArrowRight}
              iconPosition="right"
            >
              {selectedCount === 0
                ? 'Select items to checkout'
                : `Proceed to Checkout (${selectedCount} ${selectedCount === 1 ? 'item' : 'items'})`}
            </Button>

            {selectedCount === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center font-medium">
                Please check at least one product above to checkout.
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Safe & Secure 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">
            Payable ({selectedCount} items)
          </span>
          <span className="text-base font-black text-neutral-900 dark:text-neutral-100">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <Button
          onClick={() => navigate('/checkout')}
          variant="primary"
          size="md"
          disabled={selectedCount === 0}
          icon={ArrowRight}
          iconPosition="right"
        >
          Checkout ({selectedCount})
        </Button>
      </div>
    </div>
  );
}
