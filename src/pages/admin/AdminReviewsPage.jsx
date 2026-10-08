import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { Rating } from '../../components/ui/Rating';

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    commerceDb.getReviews().then(setReviews);
    const handleUpdate = () => commerceDb.getReviews().then(setReviews);
    window.addEventListener('cmcart_dataset_updated', handleUpdate);
    return () => window.removeEventListener('cmcart_dataset_updated', handleUpdate);
  }, []);

  const handleDelete = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
    showToast('Review removed from catalog', 'info');
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
          FEEDBACK & MODERATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
          Product Review Moderation
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Monitor verified customer feedback, ratings and community reports.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#181818] rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-neutral-400" />
          </div>
          <div className="text-center max-w-xs">
            <p className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">No Reviews Yet</p>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Customer product reviews will appear here once shoppers start submitting feedback. Reviews need approval before going live.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>Reviews auto-appear here after customers submit them</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-5 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-start justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{r.user_name}</span>
                  <Rating rating={r.rating} size="xs" />
                  <span className="text-[10px] text-neutral-400">• {r.date}</span>
                  {r.is_verified_purchase && (
                    <span className="text-[10px] font-semibold text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      Verified Buyer
                    </span>
                  )}
                </div>
                {r.title && <p className="font-bold text-xs">{r.title}</p>}
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{r.comment}</p>
              </div>

              <button
                onClick={() => handleDelete(r.id)}
                className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
