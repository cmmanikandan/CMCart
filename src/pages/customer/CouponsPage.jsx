import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Percent, Copy, Check, ArrowLeft, Tag, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    commerceDb.getCoupons().then(setCoupons);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
            Coupons & Festive Discounts
          </h1>
          <p className="text-xs text-neutral-500">Apply during checkout to unlock special promotional savings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white dark:bg-[#181818] rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#E63946] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-[#E63946]/10 text-[#E63946] rounded-lg font-mono font-black text-sm tracking-wider border border-[#E63946]/30">
                  {coupon.code}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Active
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {coupon.description}
              </h3>
              <p className="text-xs text-neutral-500">
                Minimum purchase of ₹{coupon.minimum_order_amount?.toLocaleString('en-IN') || 0}. Valid on all categories.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Limited Time Offer
              </span>

              <Button
                onClick={() => handleCopy(coupon.code)}
                variant="outline"
                size="sm"
                icon={copiedCode === coupon.code ? Check : Copy}
              >
                {copiedCode === coupon.code ? 'Copied' : 'Copy Code'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
