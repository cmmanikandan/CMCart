import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#E63946]/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] rounded-lg gap-2',
    lg: 'text-base px-6 py-3 min-h-[48px] rounded-xl gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-[#E63946] hover:bg-[#C92332] text-white shadow-sm hover:shadow active:bg-[#B31D2B]',
    secondary:
      'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 shadow-sm',
    outline:
      'border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-800 dark:bg-[#181818] dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-[#222222]',
    ghost:
      'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    danger:
      'bg-[#DC2626] hover:bg-red-700 text-white shadow-sm',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
