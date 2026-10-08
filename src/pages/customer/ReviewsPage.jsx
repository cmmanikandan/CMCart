import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  Check,
  ThumbsUp,
  Camera,
  X,
  Filter,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { Rating } from '../../components/ui/Rating';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Review Form Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [formProductId, setFormProductId] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formUserName, setFormUserName] = useState('');
  const [formImages, setFormImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpfulVotedIds, setHelpfulVotedIds] = useState(new Set());

  const { showToast } = useToast();

  const ratingDescriptions = {
    1: '1 ★ - Poor / Disappointing',
    2: '2 ★ - Below Average',
    3: '3 ★ - Average / Decent',
    4: '4 ★ - Very Good',
    5: '5 ★ - Excellent / Outstanding'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(false);
    const [revs, prods] = await Promise.all([
      commerceDb.getReviews(),
      commerceDb.getProducts()
    ]);
    setReviews(revs || []);
    setProducts(prods || []);
    if (prods && prods.length > 0 && !formProductId) {
      setFormProductId(prods[0].id);
    }
  };

  const getProduct = (pid) => {
    return products.find((p) => p.id === pid);
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

  // Image Upload Handler (Supports real image file reader as Base64 dataURL)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormImages((prev) => [...prev, uploadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSampleImage = (url) => {
    if (!formImages.includes(url)) {
      setFormImages((prev) => [...prev, url]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formComment.trim()) {
      showToast('Please provide a comment for your review.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = await commerceDb.addReview({
        product_id: formProductId,
        user_name: formUserName.trim() || 'Verified Shopper',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
        images: formImages,
        is_verified_purchase: true
      });

      setReviews((prev) => [newReview, ...prev]);
      showToast('Review submitted successfully! Thank you for your feedback.', 'success');
      setIsWriteModalOpen(false);
      // Reset form
      setFormTitle('');
      setFormComment('');
      setFormImages([]);
      setFormRating(5);
    } catch {
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Logic
  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter !== 'all' && Math.floor(r.rating) !== parseInt(ratingFilter, 10)) {
      return false;
    }
    if (verifiedOnly && !r.is_verified_purchase) {
      return false;
    }
    if (withPhotosOnly && (!r.images || r.images.length === 0)) {
      return false;
    }
    return true;
  });

  // Calculate statistics
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviewsCount).toFixed(1)
    : '5.0';

  const countsByStar = {
    5: reviews.filter((r) => Math.floor(r.rating) === 5).length,
    4: reviews.filter((r) => Math.floor(r.rating) === 4).length,
    3: reviews.filter((r) => Math.floor(r.rating) === 3).length,
    2: reviews.filter((r) => Math.floor(r.rating) === 2).length,
    1: reviews.filter((r) => Math.floor(r.rating) === 1).length
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            aria-label="Back to profile"
            className="p-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 hover:text-[#E63946] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              Customer Ratings & Reviews
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine
              </span>
            </h1>
            <p className="text-xs text-neutral-500">
              Authentic verified purchase feedback from shoppers across India.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsWriteModalOpen(true)}
          variant="primary"
          size="sm"
          icon={PlusCircle}
          className="shadow-sm self-start sm:self-auto"
        >
          Write a Review
        </Button>
      </div>

      {/* Overview & Score Card */}
      <div className="p-5 sm:p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 pb-4 md:pb-0 md:pr-4">
          <div className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-neutral-100">
            {averageRating}
          </div>
          <div className="flex text-amber-400 my-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(averageRating) ? 'fill-current' : 'text-neutral-300'}`}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-neutral-500">
            Based on {totalReviewsCount} verified reviews
          </p>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="md:col-span-8 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = countsByStar[star] || 0;
            const pct = totalReviewsCount ? Math.round((count / totalReviewsCount) * 100) : 0;
            return (
              <button
                key={star}
                onClick={() => setRatingFilter(ratingFilter === String(star) ? 'all' : String(star))}
                className={`w-full flex items-center gap-3 text-xs p-1 rounded-lg transition-colors cursor-pointer group ${
                  ratingFilter === String(star)
                    ? 'bg-neutral-100 dark:bg-neutral-800'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <span className="w-10 font-bold flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                  {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all ${
                      star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                  />
                </div>
                <span className="w-12 text-right font-semibold text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200">
                  {pct}% ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="bg-white dark:bg-[#181818] p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
        {/* Star Rating Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Rating:
          </span>
          <button
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              ratingFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            All ({totalReviewsCount})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setRatingFilter(String(s))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                ratingFilter === String(s)
                  ? 'bg-[#E63946] text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {s} ★
            </button>
          ))}
        </div>

        {/* Checkbox Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              verifiedOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Verified Buyers Only
          </button>

          <button
            onClick={() => setWithPhotosOnly(!withPhotosOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              withPhotosOnly
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-sky-600" />
            With Photos
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => {
            const product = getProduct(rev.product_id);
            const isHelpfulVoted = helpfulVotedIds.has(rev.id);

            return (
              <div
                key={rev.id}
                className="p-5 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3.5 shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Reviewer Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={rev.user_name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          {rev.user_name}
                        </p>
                        {rev.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">{rev.date || 'Recent purchase'}</p>
                    </div>
                  </div>

                  {/* Rating Stars & Badge */}
                  <div className="flex items-center gap-2">
                    <Rating rating={rev.rating} size="sm" />
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                      {rev.rating}.0 ★
                    </span>
                  </div>
                </div>

                {/* Purchased Product Reference Bar */}
                {product && (
                  <Link
                    to={`/product/${product.id}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-100 dark:border-neutral-800/60"
                  >
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-[#181818] p-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-[#E63946] font-bold">
                        ₹{product.current_price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                  </Link>
                )}

                {/* Review Title */}
                {rev.title && (
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {rev.title}
                  </h4>
                )}

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {rev.comment}
                </p>

                {/* Uploaded Customer Photos Gallery */}
                {rev.images && rev.images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      Customer Photos ({rev.images.length})
                    </span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {rev.images.map((imgUrl, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => setSelectedPhoto(imgUrl)}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:scale-105 transition-transform cursor-pointer relative group"
                        >
                          <img
                            src={imgUrl}
                            alt={`Review photo ${imgIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold bg-black/60 px-1 rounded">
                              View
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Helpful Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400">
                  <span className="text-[11px] text-neutral-500">
                    Did you find this helpful?
                  </span>
                  <button
                    onClick={() => handleVoteHelpful(rev.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isHelpfulVoted
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-[#E63946] hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.helpful_count || 0})</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
            <Star className="w-8 h-8 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              No reviews match the selected filter
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try changing the star rating filter or turn off "With Photos" to see more customer feedback.
            </p>
            <Button
              onClick={() => {
                setRatingFilter('all');
                setVerifiedOnly(false);
                setWithPhotosOnly(false);
              }}
              variant="outline"
              size="sm"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Interactive Write a Review Modal */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title="Write a Customer Review"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Posting as a Verified CMCart Purchaser</span>
          </div>

          {/* Select Product */}
          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Select Product Purchased *
            </label>
            <select
              value={formProductId}
              onChange={(e) => setFormProductId(e.target.value)}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#E63946]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.current_price?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Your Name / Display Alias
            </label>
            <input
              type="text"
              value={formUserName}
              onChange={(e) => setFormUserName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#E63946]"
            />
          </div>

          {/* Interactive Star Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setFormHoverRating(star)}
                    onMouseLeave={() => setFormHoverRating(0)}
                    onClick={() => setFormRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (formHoverRating || formRating)
                          ? 'fill-current text-amber-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 ml-2">
                {ratingDescriptions[formHoverRating || formRating]}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Review Headline / Title
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Outstanding audio quality and comfortable fit!"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#E63946]"
            />
          </div>

          {/* Detailed Feedback */}
          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Detailed Experience & Feedback *
            </label>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Tell others what you loved or disliked about this product. Mention durability, battery, packaging, fit..."
              rows={3}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#E63946]"
            />
          </div>

          {/* Image Upload Component */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Attach Customer Photos (Optional)
              </label>
              <span className="text-[11px] text-neutral-400">Max 5 photos</span>
            </div>

            {/* Upload Button & Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:border-[#E63946] cursor-pointer transition-colors">
                <Camera className="w-4 h-4 text-[#E63946]" />
                <span>Upload From Device</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Sample Photo Presets */}
              <button
                type="button"
                onClick={() =>
                  handleAddSampleImage(
                    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80'
                  )
                }
                className="text-[11px] font-semibold text-neutral-500 hover:text-[#E63946] px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer"
              >
                + Smartwatch Unboxing
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddSampleImage(
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
                  )
                }
                className="text-[11px] font-semibold text-neutral-500 hover:text-[#E63946] px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer"
              >
                + Headphones Photo
              </button>
            </div>

            {/* Uploaded Images Preview Thumbnails */}
            {formImages.length > 0 && (
              <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                {formImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 group">
                    <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-rose-600 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWriteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal for Full Image Zoom */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-neutral-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
              aria-label="Close photo"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Customer photo full"
              className="w-full h-full max-h-[75vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
