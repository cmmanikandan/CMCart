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
  MessageSquare,
  ArrowLeft,
  Camera,
  ThumbsUp,
  X,
  Filter
} from 'lucide-react';
import { Price } from '../../components/ui/Price';
import { Rating } from '../../components/ui/Rating';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/ui/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // New review form & filter states
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewHoverRating, setNewReviewHoverRating] = useState(0);
  const [newReviewImages, setNewReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');
  const [reviewVerifiedOnly, setReviewVerifiedOnly] = useState(false);
  const [helpfulVotedIds, setHelpfulVotedIds] = useState(new Set());
  const [reviewLightboxPhoto, setReviewLightboxPhoto] = useState(null);

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

          // Get reviews, category products, and recommended bestsellers
          const [revs, catProds, allCatalog] = await Promise.all([
            commerceDb.getReviews(item.id),
            commerceDb.getProducts({ category: item.category_id }),
            commerceDb.getProducts()
          ]);
          setReviews(revs || []);
          setRelatedProducts((catProds || []).filter((p) => p.id !== item.id).slice(0, 4));
          setRecommendedProducts(
            (allCatalog || [])
              .filter((p) => p.id !== item.id && p.category_id !== item.category_id)
              .slice(0, 4)
          );
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
    if (!user) {
      showToast('Please sign in to add items to your cart', 'warning');
      navigate('/login');
      return;
    }
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    if (!user) {
      showToast('Please sign in to complete your purchase', 'warning');
      navigate('/login');
      return;
    }
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

  const handleReviewImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewReviewImages((prev) => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVoteHelpful = async (revId) => {
    if (helpfulVotedIds.has(revId)) {
      showToast('You already voted this review as helpful!', 'info');
      return;
    }
    await commerceDb.voteHelpfulReview(revId);
    setHelpfulVotedIds((prev) => new Set(prev).add(revId));
    setReviews((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r))
    );
    showToast('Marked review as helpful. Thank you!', 'success');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      showToast('Please enter your review comments.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const added = await commerceDb.addReview({
        product_id: product.id,
        user_name: 'Verified Customer',
        rating: newReviewRating,
        title: newReviewTitle.trim(),
        comment: newReviewComment.trim(),
        images: newReviewImages,
        is_verified_purchase: true,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      });
      setReviews([added, ...reviews]);
      setNewReviewTitle('');
      setNewReviewComment('');
      setNewReviewImages([]);
      setNewReviewRating(5);
      showToast('Thank you! Your verified review has been published.', 'success');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 md:pb-10">
      {/* Breadcrumb with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-[#E63946] hover:border-[#E63946] transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto no-scrollbar py-1 min-w-0">
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
                onClick={() => {
                  if (!user) {
                    showToast('Please sign in to save items to your wishlist', 'warning');
                    navigate('/login');
                    return;
                  }
                  toggleWishlist(product);
                }}
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
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              Customer Ratings & Reviews
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Check className="w-3 h-3" /> 100% Verified
              </span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Real feedback and ratings from customers who purchased this item.
            </p>
          </div>
          <Link
            to="/reviews"
            className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Store Reviews</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Rating Breakdown Overview */}
        <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 dark:bg-neutral-850/50 border border-neutral-200/70 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-neutral-200/60 dark:border-neutral-800 pb-4 md:pb-0 md:pr-4">
            <span className="text-4xl font-black text-neutral-900 dark:text-neutral-100">
              {product.rating}
            </span>
            <div className="flex text-amber-400 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-current' : 'text-neutral-300'}`}
                />
              ))}
            </div>
            <p className="text-[11px] font-semibold text-neutral-500">
              {reviews.length || product.review_count || 0} Ratings & Customer Reviews
            </p>
          </div>

          <div className="md:col-span-8 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const starCount = reviews.filter((r) => Math.floor(r.rating) === star).length;
              const total = reviews.length || 1;
              const pct = Math.round((starCount / total) * 100);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRatingFilter(reviewRatingFilter === String(star) ? 'all' : String(star))}
                  className={`w-full flex items-center gap-2.5 text-xs p-1 rounded-lg transition-colors cursor-pointer ${
                    reviewRatingFilter === String(star)
                      ? 'bg-neutral-200/60 dark:bg-neutral-700/60'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="w-8 font-bold flex items-center gap-0.5 text-neutral-700 dark:text-neutral-300">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct || (star === 5 ? 75 : star === 4 ? 20 : 5)}%` }}
                      className={`h-full rounded-full ${
                        star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <span className="w-10 text-right text-[11px] font-semibold text-neutral-400">
                    {starCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setReviewRatingFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reviewRatingFilter === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setReviewRatingFilter(String(s))}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                  reviewRatingFilter === String(s)
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {s} ★
              </button>
            ))}
          </div>

          <button
            onClick={() => setReviewVerifiedOnly(!reviewVerifiedOnly)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              reviewVerifiedOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Verified Buyers Only
          </button>
        </div>

        {/* Interactive Write a Review Box */}
        <form onSubmit={handleReviewSubmit} className="p-4 sm:p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#E63946]" />
              Rate & Review This Product
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchaser
            </span>
          </div>

          {/* Star Picker with Hover */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Your Rating:</span>
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setNewReviewHoverRating(star)}
                  onMouseLeave={() => setNewReviewHoverRating(0)}
                  onClick={() => setNewReviewRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                  aria-label={`Select ${star} stars`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (newReviewHoverRating || newReviewRating)
                        ? 'fill-current text-amber-400'
                        : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {newReviewHoverRating || newReviewRating} / 5 Stars
            </span>
          </div>

          <input
            type="text"
            value={newReviewTitle}
            onChange={(e) => setNewReviewTitle(e.target.value)}
            placeholder="Review Title (e.g. Excellent sound & fast delivery)"
            className="w-full bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E63946]"
          />

          <textarea
            value={newReviewComment}
            onChange={(e) => setNewReviewComment(e.target.value)}
            placeholder="Share your experience with this product (quality, build, battery, performance)..."
            rows={2}
            required
            className="w-full bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs focus:outline-none focus:border-[#E63946]"
          />

          {/* Photo Attachment Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:border-[#E63946] cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Add Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReviewImageUpload}
                  className="hidden"
                />
              </label>

              {newReviewImages.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {newReviewImages.map((img, idx) => (
                    <div key={idx} className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700">
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewReviewImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingReview}
            >
              Submit Verified Review
            </Button>
          </div>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews
            .filter((r) => {
              if (reviewRatingFilter !== 'all' && Math.floor(r.rating) !== parseInt(reviewRatingFilter, 10)) {
                return false;
              }
              if (reviewVerifiedOnly && !r.is_verified_purchase) {
                return false;
              }
              return true;
            })
            .map((rev) => {
              const isVoted = helpfulVotedIds.has(rev.id);
              return (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={rev.user_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {rev.user_name}
                          </p>
                          {rev.is_verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#16A34A] font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                              <Check className="w-2.5 h-2.5" />
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400">{rev.date || 'Recent'}</p>
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
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {rev.title}
                    </p>
                  )}

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Customer Uploaded Photos */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {rev.images.map((imgUrl, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => setReviewLightboxPhoto(imgUrl)}
                          className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:scale-105 transition-transform"
                        >
                          <img src={imgUrl} alt="Review thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
                    <span>Helpful review?</span>
                    <button
                      type="button"
                      onClick={() => handleVoteHelpful(rev.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isVoted
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-[#E63946]'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{rev.helpful_count || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}

          {reviews.length === 0 && (
            <p className="text-xs text-neutral-500 py-4 text-center">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>

      {/* Lightbox for review photo modal */}
      {reviewLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setReviewLightboxPhoto(null)}
        >
          <div
            className="relative max-w-xl max-h-[80vh] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-neutral-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReviewLightboxPhoto(null)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={reviewLightboxPhoto}
              alt="Review full"
              className="w-full h-full max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Frequently Bought Together Combo Bundle */}
      {recommendedProducts.length > 0 && (
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#E63946]">
                COMBO SAVINGS DEAL
              </span>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Frequently Bought Together
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Extra 10% Combo Savings
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Product 1 */}
              <div className="flex items-center gap-2.5">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-contain bg-neutral-100 dark:bg-neutral-800 p-1 border border-neutral-200 dark:border-neutral-700"
                />
                <div className="max-w-[160px] sm:max-w-[200px]">
                  <p className="text-xs font-bold truncate">{product.name}</p>
                  <p className="text-xs text-[#E63946] font-bold">₹{product.current_price?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <span className="text-xl font-black text-neutral-400">+</span>

              {/* Product 2 */}
              <div className="flex items-center gap-2.5">
                <img
                  src={recommendedProducts[0].images?.[0]}
                  alt={recommendedProducts[0].name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-contain bg-neutral-100 dark:bg-neutral-800 p-1 border border-neutral-200 dark:border-neutral-700"
                />
                <div className="max-w-[160px] sm:max-w-[200px]">
                  <p className="text-xs font-bold truncate">{recommendedProducts[0].name}</p>
                  <p className="text-xs text-[#E63946] font-bold">₹{recommendedProducts[0].current_price?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Bundle Total & CTA */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Bundle Total</span>
                <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                  ₹{Math.round((product.current_price + (recommendedProducts[0].current_price || 0)) * 0.9).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-neutral-400 line-through ml-1.5">
                  ₹{(product.current_price + (recommendedProducts[0].current_price || 0)).toLocaleString('en-IN')}
                </span>
              </div>
              <Button
                onClick={() => {
                  addToCart(product, 1, selectedVariant?.name);
                  addToCart(recommendedProducts[0], 1);
                  showToast('Combo bundle added to Cart with 10% discount!', 'success');
                }}
                variant="primary"
                size="sm"
                icon={Sparkles}
              >
                Add Both to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Related Products Scroller */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Customers Also Viewed in {product.category_name || 'Category'}
          </h3>
          <p className="text-xs text-neutral-500 mb-4">Popular alternatives and similar products.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Customer Recommended For You */}
      {recommendedProducts.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Customer Recommended Deals
          </h3>
          <p className="text-xs text-neutral-500 mb-4">Trending picks and customer favorites across all categories.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-3 pb-safe flex items-center gap-2 shadow-lg">
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
