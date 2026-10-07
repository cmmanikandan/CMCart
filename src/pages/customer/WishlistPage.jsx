import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
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

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            {/* Image Link */}
            <div className="relative aspect-square bg-[#FAFAFA] dark:bg-[#151515] overflow-hidden">
              <Link to={`/product/${item.id}`} className="block w-full h-full">
                <img
                  src={getOptimizedImageUrl(item.images?.[0] || item.image, { width: 400 })}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <button
                onClick={() => removeFromWishlist(item.id)}
                aria-label="Remove item"
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center text-neutral-500 hover:text-[#DC2626] transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="p-3 sm:p-4 flex flex-col flex-1">
              <Link
                to={`/product/${item.id}`}
                className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#E63946] line-clamp-2 leading-snug mb-2 flex-1"
              >
                {item.name}
              </Link>

              <Price
                currentPrice={item.current_price || item.price}
                originalPrice={item.original_price}
                discountPercentage={item.discount_percentage}
                size="sm"
                className="mb-3"
              />

              <Button
                onClick={() => handleMoveToCart(item)}
                variant="primary"
                size="sm"
                icon={ShoppingBag}
                className="w-full text-xs"
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
