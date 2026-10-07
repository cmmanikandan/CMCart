import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function CategoryCard({ category, layout = 'circle', className = '' }) {
  if (layout === 'circle') {
    return (
      <Link
        to={`/category/${category.id}`}
        className={`group flex flex-col items-center text-center shrink-0 w-20 sm:w-24 select-none ${className}`}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 p-1 border-2 border-transparent group-hover:border-[#E63946] transition-all overflow-hidden shadow-xs">
          <img
            src={getOptimizedImageUrl(category.image, { width: 160, quality: 80 })}
            alt={category.name}
            className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <span className="mt-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[#E63946] dark:group-hover:text-[#E63946] transition-colors truncate max-w-full">
          {category.name}
        </span>
      </Link>
    );
  }

  // Card grid layout for category listing page
  return (
    <Link
      to={`/category/${category.id}`}
      className={`group relative bg-white dark:bg-[#181818] rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${className}`}
    >
      <div className="aspect-4/3 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        <img
          src={getOptimizedImageUrl(category.image, { width: 500, quality: 80 })}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3 sm:p-4">
        <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E63946] dark:group-hover:text-[#E63946] transition-colors">
          {category.name}
        </h4>
        {category.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
            {category.description}
          </p>
        )}
        <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-2 block">
          {category.itemCount || 100}+ items
        </span>
      </div>
    </Link>
  );
}
