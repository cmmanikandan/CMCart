import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Price } from '../../components/ui/Price';
import { EmptyState } from '../../components/ui/EmptyState';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, null, 1);
    removeFromWishlist(product.id);
  };

  if (!wishlist || wishlist.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is waiting."
        description="Explore more and shortlist your favorite electronics, apparel, and lifestyle products."
        actionText="Continue Shopping"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Items saved for later. Move to cart anytime before stock runs out.
          </p>
        </div>
      </div>

      {/* Grid of Wishlist Items: Strictly 4 columns on large screens for uniform alignment */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden shadow-xs flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
          >
            {/* Image Link with Discount & Heart Icon */}
            <div className="relative aspect-square bg-[#FAFAFA] dark:bg-[#151515] overflow-hidden">
              <Link to={`/product/${item.id}`} className="block w-full h-full">
                <img
                  src={getOptimizedImageUrl(item.images?.[0] || item.image, { width: 400 })}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Discount Chip */}
              {item.discount_percentage > 0 && (
                <span className="absolute top-2.5 left-2.5 bg-[#E63946] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                  {item.discount_percentage}% OFF
                </span>
              )}

              {/* Unwishlist Heart Button */}
              <button
                type="button"
                onClick={() => removeFromWishlist(item.id)}
                aria-label="Remove from wishlist"
                title="Remove from wishlist"
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 dark:bg-[#181818]/95 backdrop-blur-xs flex items-center justify-center text-[#E63946] hover:scale-110 active:scale-90 transition-transform cursor-pointer shadow-xs border border-neutral-200/50 dark:border-neutral-700/50"
              >
                <Heart className="w-4.5 h-4.5 fill-[#E63946] text-[#E63946]" />
              </button>
            </div>

            {/* Info Body with strictly fixed vertical slots for horizontal alignment */}
            <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
              <div>
                {/* Brand */}
                <div className="h-4 mb-1">
                  {item.brand && (
                    <span className="text-[10px] sm:text-xs font-bold text-[#E63946] uppercase tracking-wider block truncate">
                      {item.brand}
                    </span>
                  )}
                </div>

                {/* Title (fixed 2 lines height) */}
                <Link
                  to={`/product/${item.id}`}
                  className="h-9 sm:h-10 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#E63946] line-clamp-2 leading-snug block mb-2 transition-colors"
                >
                  {item.name}
                </Link>

                {/* Rating if present */}
                <div className="h-5 flex items-center gap-1.5 mb-2">
                  {item.rating ? (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                      <span>{item.rating}</span>
                      <Star className="w-2.5 h-2.5 fill-white" />
                    </div>
                  ) : null}
                  {item.is_in_stock === false && (
                    <span className="text-[10px] font-bold text-red-500">Out of Stock</span>
                  )}
                </div>

                {/* Price (fixed height slot) */}
                <div className="min-h-[38px] flex items-center mb-3">
                  <Price
                    currentPrice={item.current_price || item.price}
                    originalPrice={item.original_price}
                    discountPercentage={item.discount_percentage}
                    size="sm"
                  />
                </div>
              </div>

              {/* Move to Cart Action */}
              <Button
                onClick={() => handleMoveToCart(item)}
                variant="primary"
                size="sm"
                icon={ShoppingBag}
                className="w-full text-xs font-bold h-9 shadow-xs"
              >
                Move to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
