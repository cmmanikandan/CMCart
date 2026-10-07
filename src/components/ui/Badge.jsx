import React from 'react';

export function Badge({
  children,
  variant = 'default', // 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'
  size = 'sm',
  className = '',
}) {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide uppercase',
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-sm px-2.5 py-1 rounded-md font-medium',
  };

  const variantClasses = {
    default:
      'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
    primary:
      'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-semibold',
    success:
      'bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 font-semibold',
    warning:
      'bg-amber-50 text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 font-semibold',
    error:
      'bg-rose-50 text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40 font-semibold',
    outline:
      'border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300',
  };

  return (
    <span className={`inline-flex items-center gap-1 select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
