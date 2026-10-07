import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import { Price } from './Price';
import { Rating } from './Rating';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function ProductCard({ product, className = '' }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product.id);
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, product.variants?.[0] || null, 1);
    }
  };

  return (
    <div
      className={`group relative bg-white dark:bg-[#181818] rounded-xl border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 hover:shadow-md flex flex-col overflow-hidden ${className}`}
    >
      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
        {product.is_deal_of_the_day && (
          <span className="bg-[#E63946] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" />
            DEAL
          </span>
        )}
        {product.is_best_seller && (
          <span className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
            BESTSELLER
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-[#181818]/90 backdrop-blur-xs flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-[#E63946] dark:hover:text-[#E63946] shadow-sm transition-transform active:scale-90 cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
            isFavorited ? 'fill-[#E63946] text-[#E63946]' : ''
          }`}
        />
      </button>

      {/* Product Image Link */}
      <Link
        to={`/product/${product.id}`}
        className="block relative aspect-square bg-[#FAFAFA] dark:bg-[#151515] overflow-hidden"
      >
        <img
          src={getOptimizedImageUrl(product.images?.[0], { width: 500, quality: 80 })}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Low Stock Indicator Pill */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2 bg-amber-500/95 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
            Only {product.stock} left
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-neutral-900 text-white text-xs font-bold px-3 py-1 rounded-md">
              OUT OF STOCK
            </span>
          </div>
        )}
      </Link>

      {/* Details Container */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400 dark:text-neutral-500 mb-1 truncate">
            {product.brand}
          </p>
        )}

        {/* Product Title */}
        <Link
          to={`/product/${product.id}`}
          className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors line-clamp-2 leading-snug mb-2 flex-1"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <Rating
            rating={product.rating}
            reviewCount={product.review_count}
            size="xs"
            showBadge={true}
          />
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-auto pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <Price
            currentPrice={product.current_price}
            originalPrice={product.original_price}
            discountPercentage={product.discount_percentage}
            size="sm"
          />

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Add to cart"
            className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 hover:bg-[#E63946] text-neutral-700 hover:text-white dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-[#E63946] dark:hover:text-white flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
