import React from 'react';
import { Check, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

/**
 * Standardized CMCart Payment Status Badge
 * Rules:
 * PAID / CAPTURED / COLLECTED: GREEN (✓ PAID & CAPTURED / ✓ PAID / COLLECTED)
 * UNPAID: RED (● UNPAID)
 * UNPAID / COD PENDING: RED/AMBER WARNING (● UNPAID / COD PENDING)
 * REFUNDED: PURPLE (↺ REFUNDED)
 * FAILED: RED (✕ FAILED)
 */
export function PaymentStatusBadge({
  status = 'PAID',
  method = '',
  size = 'sm',
  className = ''
}) {
  const normStatus = String(status || '').toUpperCase();
  const isCOD = String(method || '').toLowerCase().includes('cash') || String(method || '').toLowerCase().includes('cod');
  const isPaid = normStatus === 'PAID' || normStatus === 'COMPLETED' || normStatus === 'CAPTURED' || normStatus === 'COLLECTED';
  const isRefunded = normStatus === 'REFUNDED';
  const isFailed = normStatus === 'FAILED';

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 rounded',
    sm: 'text-[11px] px-2.5 py-1 rounded-full',
    md: 'text-xs px-3 py-1.5 rounded-full'
  };

  if (isPaid) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-black select-none border border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400 ${sizeClasses[size] || sizeClasses.sm} ${className}`}
      >
        <Check className="w-3 h-3 stroke-[3]" />
        <span>PAID</span>
      </span>
    );
  }

  if (isRefunded) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-black select-none border border-purple-300 dark:border-purple-800 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ${sizeClasses[size] || sizeClasses.sm} ${className}`}
      >
        <RefreshCw className="w-3 h-3" />
        <span>REFUNDED</span>
      </span>
    );
  }

  if (isFailed) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-black select-none border border-rose-300 dark:border-rose-800 bg-rose-50 text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400 ${sizeClasses[size] || sizeClasses.sm} ${className}`}
      >
        <XCircle className="w-3 h-3" />
        <span>FAILED</span>
      </span>
    );
  }

  // Otherwise Unpaid
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-black select-none border border-rose-300 dark:border-rose-800 bg-rose-50 text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400 ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
      <span>UNPAID</span>
    </span>
  );
}
