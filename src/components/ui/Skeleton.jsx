import React from 'react';

export function Skeleton({ className = '', variant = 'rect' }) {
  const variantClasses = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div
      className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 ${variantClasses[variant] || ''} ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#181818] rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-3 flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center gap-2 mt-auto">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}
