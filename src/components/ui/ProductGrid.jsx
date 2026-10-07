import React from 'react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 8,
  columns = 'auto', // 'auto' | 2 | 3 | 4
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search keywords.',
  className = '',
}) {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const gridClass =
    columns === 2
      ? 'grid grid-cols-2 gap-3 sm:gap-4'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5';

  return (
    <div className={`${gridClass} ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
