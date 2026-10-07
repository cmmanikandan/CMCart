import React from 'react';
import { Star } from 'lucide-react';

export function Rating({
  rating = 0,
  reviewCount = null,
  size = 'sm', // 'xs' | 'sm' | 'md'
  showBadge = false,
  className = '',
}) {
  const numRating = Number(rating || 0).toFixed(1);

  if (showBadge) {
    return (
      <div className={`inline-flex items-center gap-1 bg-[#16A34A] text-white px-1.5 py-0.5 rounded text-xs font-bold tracking-tight ${className}`}>
        <span>{numRating}</span>
        <Star className="w-3 h-3 fill-current" />
        {reviewCount !== null && (
          <span className="text-white/80 font-normal ml-0.5 text-[11px]">({reviewCount})</span>
        )}
      </div>
    );
  }

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const starClass = starSizes[size] || starSizes.sm;

  return (
    <div className={`inline-flex items-center gap-1 text-neutral-800 dark:text-neutral-200 select-none ${className}`}>
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starClass} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-300 dark:text-neutral-700'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold ml-0.5">{numRating}</span>
      {reviewCount !== null && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          ({reviewCount.toLocaleString('en-IN')})
        </span>
      )}
    </div>
  );
}
