import React from 'react';
import { PackageOpen, ShoppingBag, Heart, Bell, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export function EmptyState({
  title = 'No items found',
  description = 'Try searching with different keywords or exploring popular categories.',
  icon: Icon = PackageOpen,
  actionText = 'Start Shopping',
  actionLink = '/products',
  onAction = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 ${className}`}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-4 sm:mb-5">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-[#E63946]" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLink ? (
        <Link to={actionLink}>
          <Button variant="primary" size="md">
            {actionText}
          </Button>
        </Link>
      ) : onAction ? (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
}
