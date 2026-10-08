import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Percent,
  Copy,
  Check,
  ArrowLeft,
  Tag,
  Clock,
  Building,
  Sparkles,
  Truck,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedCode, setCopiedCode] = useState(null);
  const [applyingCode, setApplyingCode] = useState(null);

  const { applyCoupon, appliedCoupon } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Curated offers categorized by Bank Deals, Festive Discounts & Free Shipping
  const ALL_OFFERS = [
    {
      id: 'coup-bank-1',
      code: 'AXIS10',
      category: 'Bank Deals',
      bank: 'Axis Bank',
      bankIcon: '🔴',
      title: '10% Instant Discount on Axis Bank Cards',
      description: 'Get 10% instant off up to ₹1,500 on Axis Bank Credit & Debit Card transactions.',
      minOrder: 2999,
      maxDiscount: 1500,
      expiry: 'Valid till 31 Oct 2026',
      badge: 'Bank Exclusive'
    },
    {
      id: 'coup-bank-2',
      code: 'HDFC1000',
      category: 'Bank Deals',
      bank: 'HDFC Bank',
      bankIcon: '🔵',
      title: 'Flat ₹1,000 Off on HDFC Credit Cards & EMI',
      description: 'Applicable on premium electronics, smartphones, and fashion orders above ₹5,999.',
      minOrder: 5999,
      maxDiscount: 1000,
      expiry: 'Valid till 28 Oct 2026',
      badge: 'Trending Deal'
    },
    {
      id: 'coup-bank-3',
      code: 'ICICI750',
      category: 'Bank Deals',
      bank: 'ICICI Bank',
      bankIcon: '🟠',
      title: 'Flat ₹750 Instant Cashback with ICICI Bank',
      description: 'Enjoy instant card-level discount on ICICI Bank Netbanking and Cards.',
      minOrder: 3499,
      maxDiscount: 750,
      expiry: 'Valid till 15 Nov 2026',
      badge: 'Popular'
    },
    {
      id: 'coup-fest-1',
      code: 'FESTIVE25',
      category: 'Festive Discounts',
      title: 'Mega Festive Dhamaka: 25% OFF',
      description: 'Save 25% up to ₹2,500 across all catalog collections for the festival season.',
      minOrder: 1999,
      maxDiscount: 2500,
      expiry: 'Ends in 4 Days',
      badge: 'Biggest Savings'
    },
    {
      id: 'coup-fest-2',
      code: 'WELCOME50',
      category: 'Festive Discounts',
      title: 'New Shopper Welcome: Flat ₹500 OFF',
      description: 'Flat ₹500 deduction on your shopping basket of ₹1,999 and above.',
      minOrder: 1999,
      maxDiscount: 500,
      expiry: 'For New Customers',
      badge: 'Welcome Special'
    },
    {
      id: 'coup-fest-3',
      code: 'BIGSAVER15',
      category: 'Festive Discounts',
      title: '15% Off Site-Wide Super Saver',
      description: 'Save up to ₹1,200 instantly on all cart items with no brand restrictions.',
      minOrder: 1499,
      maxDiscount: 1200,
      expiry: 'Ongoing Promo',
      badge: 'Verified Code'
    },
    {
      id: 'coup-ship-1',
      code: 'FREESHIP',
      category: 'Free Shipping',
      title: 'Free Express Priority Delivery',
      description: 'Zero delivery fee waiver on orders across India with guaranteed express fulfillment.',
      minOrder: 0,
      maxDiscount: 99,
      expiry: 'No Expiry',
      badge: 'Zero Delivery Fee'
    }
  ];

  const categories = [
    { id: 'All', label: 'All Offers (7)' },
    { id: 'Bank Deals', label: 'Bank Deals (Axis, HDFC, ICICI)' },
    { id: 'Festive Discounts', label: 'Festive Discounts' },
    { id: 'Free Shipping', label: 'Free Shipping Vouchers' }
  ];

  const filteredOffers = ALL_OFFERS.filter((o) => {
    if (activeCategory === 'All') return true;
    return o.category === activeCategory;
  });

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyDirect = async (code) => {
    setApplyingCode(code);
    const success = await applyCoupon(code);
    setApplyingCode(null);
    if (success) {
      showToast(`Coupon "${code}" applied to your cart!`, 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-14 px-1">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:text-[#E63946] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
                Offers & Promo Coupons
              </h1>
              <span className="text-[10px] font-bold bg-[#E63946]/10 text-[#E63946] px-2 py-0.5 rounded-full">
                Live Discounts
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Copy codes or apply them directly to your active cart for instant deductions.
            </p>
          </div>
        </div>

        {/* Quick Cart Status Pill */}
        {appliedCoupon && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <div>
              <span className="font-bold text-[#16A34A]">{appliedCoupon.code} Applied</span>
              <p className="text-[10px] text-neutral-500">Active on your current checkout</p>
            </div>
            <Link to="/cart" className="ml-2 font-bold text-[#E63946] hover:underline">
              View Cart →
            </Link>
          </div>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeCategory === c.id
                ? 'bg-[#E63946] text-white shadow-xs'
                : 'bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredOffers.map((offer) => {
          const isApplied = appliedCoupon?.code === offer.code;

          return (
            <div
              key={offer.id}
              className={`bg-white dark:bg-[#181818] rounded-2xl border-2 transition-all p-5 sm:p-6 flex flex-col justify-between shadow-xs relative overflow-hidden group ${
                isApplied
                  ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10'
                  : 'border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#E63946]'
              }`}
            >
              {/* Top Accent Strip */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 font-mono font-black text-sm tracking-widest rounded-lg border border-[#E63946]/30">
                    {offer.code}
                  </span>
                  {offer.badge && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {offer.badge}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {offer.expiry}
                </span>
              </div>

              {/* Offer Description */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm sm:text-base font-black text-neutral-900 dark:text-neutral-100 group-hover:text-[#E63946] transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {offer.description}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400 font-medium">
                  <span>Min Order: ₹{offer.minOrder.toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span>Max Saving: ₹{offer.maxDiscount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons: 1-click Copy Code and 1-click Apply Directly to Cart */}
              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(offer.code)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#E63946] transition-colors py-1 cursor-pointer"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                {isApplied ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Applied to Cart</span>
                  </span>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleApplyDirect(offer.code)}
                    loading={applyingCode === offer.code}
                    variant="primary"
                    size="sm"
                    icon={ShoppingBag}
                    className="text-xs font-bold"
                  >
                    Apply to Cart
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
