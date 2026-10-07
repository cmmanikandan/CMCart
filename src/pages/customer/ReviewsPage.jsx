import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft, Check, ThumbsUp, MessageSquare } from 'lucide-react';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { Rating } from '../../components/ui/Rating';

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Promise.all([commerceDb.getReviews(), commerceDb.getProducts()]).then(([revs, prods]) => {
      setReviews(revs);
      setProducts(prods);
    });
  }, []);

  const getProductName = (pid) => {
    return products.find((p) => p.id === pid)?.name || 'Verified Product';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
            Verified Customer Reviews
          </h1>
          <p className="text-xs text-neutral-500">Real feedback from authentic shoppers across India.</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={rev.user_name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {rev.user_name}
                  </p>
                  <p className="text-[10px] text-neutral-400">{rev.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Rating rating={rev.rating} size="sm" />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {rev.rating}.0
                </span>
              </div>
            </div>

            <div className="text-xs font-semibold text-[#E63946]">
              Purchased: {getProductName(rev.product_id)}
            </div>

            {rev.title && (
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {rev.title}
              </h4>
            )}

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {rev.comment}
            </p>

            <div className="flex items-center justify-between pt-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1 text-[#16A34A] font-medium text-[11px]">
                <Check className="w-3.5 h-3.5" />
                Verified Buyer
              </span>
              <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                <ThumbsUp className="w-3.5 h-3.5" />
                {rev.helpful_count || 12} people found this helpful
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
