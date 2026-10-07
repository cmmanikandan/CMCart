import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Check,
  ChevronRight,
  Share2,
  Tag,
  MapPin,
  Clock,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Price } from '../../components/ui/Price';
import { Rating } from '../../components/ui/Rating';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/ui/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('560038');
  const [pincodeVerified, setPincodeVerified] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // New review form
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const item = await commerceDb.getProductById(id);
        if (item) {
          setProduct(item);
          setSelectedImage(0);
          setSelectedVariant(item.variants?.[0] || null);

          // Get reviews & related products
          const [revs, allProds] = await Promise.all([
            commerceDb.getReviews(item.id),
            commerceDb.getProducts({ category: item.category_id }),
          ]);
          setReviews(revs);
          setRelatedProducts(allProds.filter((p) => p.id !== item.id).slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-7xl mx-auto py-8">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
            <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-[#E63946] font-semibold">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    navigate('/checkout');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeVerified(true);
      showToast('Delivery available to pincode ' + pincode + ' in 2 business days!', 'success');
    } else {
      showToast('Please enter a valid 6-digit postal pincode', 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'info');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const added = await commerceDb.addReview({
        product_id: product.id,
        user_name: 'Verified Customer',
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      });
      setReviews([added, ...reviews]);
      setNewReviewComment('');
      showToast('Thank you for reviewing this product!', 'success');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 md:pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto no-scrollbar py-1">
        <Link to="/home" className="hover:text-[#E63946] shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link to="/categories" className="hover:text-[#E63946] shrink-0">Categories</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link to={`/category/${product.category_id}`} className="hover:text-[#E63946] shrink-0">
          {product.category_name || 'Category'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
          {product.name}
        </span>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square bg-white dark:bg-[#181818] rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden shadow-xs flex items-center justify-center p-4">
            <img
              src={getOptimizedImageUrl(product.images?.[selectedImage] || product.images?.[0], {
                width: 900,
                quality: 85,
              })}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
            />

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#181818] text-neutral-600 dark:text-neutral-300 shadow-md flex items-center justify-center hover:text-[#E63946] transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorited ? 'fill-[#E63946] text-[#E63946]' : ''}`}
                />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#181818] text-neutral-600 dark:text-neutral-300 shadow-md flex items-center justify-center hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.is_deal_of_the_day && (
                <span className="bg-[#E63946] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  TOP DEAL
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white dark:bg-[#181818] border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                    selectedImage === idx
                      ? 'border-[#E63946] shadow-sm scale-105'
                      : 'border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img, { width: 150 })}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Actions (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {product.brand && (
              <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider block mb-1">
                {product.brand}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating & Review summary */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <Rating
                rating={product.rating}
                reviewCount={product.review_count}
                size="md"
                showBadge={true}
              />
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500 font-medium">
                SKU: <strong className="text-neutral-700 dark:text-neutral-300">{product.sku}</strong>
              </span>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800">
            <Price
              currentPrice={selectedVariant?.price || product.current_price}
              originalPrice={product.original_price}
              discountPercentage={product.discount_percentage}
              size="xl"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Inclusive of all taxes. Free express shipping on this order.
            </p>
          </div>

          {/* Special Bank Offers */}
          {product.offers && product.offers.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                Available Offers
              </span>
              <div className="space-y-1.5">
                {product.offers.map((offer, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300"
                  >
                    <Tag className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>{offer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-2.5">
                Select Option: <strong className="text-neutral-900 dark:text-neutral-100">{selectedVariant?.name}</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                      selectedVariant?.id === v.id
                        ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946] ring-1 ring-[#E63946]'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {v.color && (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: v.color }}
                      />
                    )}
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Stock Indicator */}
          <div className="flex items-center gap-6 pt-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Quantity
              </span>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-[#181818] w-28">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-9 h-9 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Stock Status
              </span>
              {isOutOfStock ? (
                <Badge variant="error" size="sm">Out of Stock</Badge>
              ) : product.stock <= 5 ? (
                <Badge variant="warning" size="sm">Only {product.stock} items left!</Badge>
              ) : (
                <Badge variant="success" size="sm">In Stock & Ready to Ship</Badge>
              )}
            </div>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                Delivery Options
              </span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs w-44 focus:outline-none focus:border-[#E63946]"
              />
              <Button type="submit" variant="outline" size="sm">
                Check
              </Button>
            </form>
            {pincodeVerified && (
              <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                <p className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  Fast delivery by Tomorrow, 8:00 PM
                </p>
                <p className="text-neutral-500">Free doorstep shipping on this order</p>
              </div>
            )}
          </div>

          {/* Desktop Purchase Action CTAs */}
          <div className="hidden md:grid grid-cols-2 gap-4 pt-2">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              variant="outline"
              size="lg"
              icon={ShoppingBag}
              className="w-full"
            >
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              variant="primary"
              size="lg"
              icon={Zap}
              className="w-full"
            >
              Buy Now
            </Button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs text-neutral-500">
            <div className="p-2.5 bg-white dark:bg-[#181818] rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <ShieldCheck className="w-5 h-5 mx-auto text-[#16A34A] mb-1" />
              <span>100% Genuine</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-[#181818] rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <RotateCcw className="w-5 h-5 mx-auto text-[#E63946] mb-1" />
              <span>7 Days Return</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-[#181818] rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <Truck className="w-5 h-5 mx-auto text-sky-500 mb-1" />
              <span>Express Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description & Specifications Tabs */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Product Description
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-4xl">
            {product.description}
          </p>
        </div>

        {/* Specifications Table */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Technical Specifications
            </h3>
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden max-w-2xl">
              <table className="w-full text-xs sm:text-sm text-left">
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/40' : 'bg-white dark:bg-[#181818]'}
                    >
                      <td className="py-2.5 px-4 font-semibold text-neutral-500 w-1/3 border-b border-neutral-100 dark:border-neutral-800">
                        {key}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews & Feedback Section */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Customer Ratings & Reviews
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Verified purchases and feedback from authentic customers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Rating rating={product.rating} size="md" showBadge={true} />
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              {product.rating} out of 5 ({product.review_count} ratings)
            </span>
          </div>
        </div>

        {/* Write a Review Box */}
        <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
            Write a Review
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Your Rating:</span>
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewReviewRating(star)}
                  className="cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${star <= newReviewRating ? 'fill-current' : 'text-neutral-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={newReviewComment}
            onChange={(e) => setNewReviewComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={2}
            required
            className="w-full bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs focus:outline-none focus:border-[#E63946]"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingReview}
            >
              Submit Review
            </Button>
          </div>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={rev.user_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {rev.user_name}
                      </p>
                      <p className="text-[10px] text-neutral-400">{rev.date}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                </div>
                {rev.title && (
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {rev.title}
                  </p>
                )}
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {rev.comment}
                </p>
                {rev.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#16A34A] font-semibold">
                    <Check className="w-3 h-3" />
                    Verified Purchase
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-500 py-4 text-center">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>

      {/* Related Products Scroller */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Customers Also Viewed
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Purchase Bar (Requirement #14 & #43) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-3 flex items-center gap-2 shadow-lg">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant="outline"
          size="md"
          icon={ShoppingBag}
          className="flex-1"
        >
          Add to Cart
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          variant="primary"
          size="md"
          icon={Zap}
          className="flex-1"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
