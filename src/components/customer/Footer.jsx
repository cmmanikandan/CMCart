import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../ui/BrandLogo';
import { ShieldCheck, Truck, RotateCcw, Headphones, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="hidden md:block bg-white dark:bg-[#151515] border-t border-neutral-200 dark:border-neutral-800 mt-auto transition-colors">
      {/* Value Proposition Highlights */}
      <div className="border-b border-neutral-100 dark:border-neutral-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Express Delivery
              </h5>
              <p className="text-[11px] sm:text-xs text-neutral-500">Free on orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                7 Days Easy Return
              </h5>
              <p className="text-[11px] sm:text-xs text-neutral-500">Doorstep return pickup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                100% Genuine
              </h5>
              <p className="text-[11px] sm:text-xs text-neutral-500">Authentic certified products</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946] shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                24/7 Dedicated Care
              </h5>
              <p className="text-[11px] sm:text-xs text-neutral-500">Instant chat & call support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2">
            <BrandLogo size="md" />
            <p className="mt-3 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              CMCart is India’s premier mass-market e-commerce destination, bringing high quality electronics, fashion, and home essentials with lightning-fast delivery and uncompromised value.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-neutral-500">
              <span>Android & iOS Ready</span>
              <span>•</span>
              <span>Verified Merchant Security</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li><Link to="/category/cat-electronics" className="hover:text-[#E63946] transition-colors">Electronics</Link></li>
              <li><Link to="/category/cat-fashion" className="hover:text-[#E63946] transition-colors">Fashion</Link></li>
              <li><Link to="/category/cat-home" className="hover:text-[#E63946] transition-colors">Home & Living</Link></li>
              <li><Link to="/category/cat-beauty" className="hover:text-[#E63946] transition-colors">Beauty & Personal Care</Link></li>
              <li><Link to="/category/cat-sports" className="hover:text-[#E63946] transition-colors">Sports & Fitness</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li><Link to="/orders" className="hover:text-[#E63946] transition-colors">Track Orders</Link></li>
              <li><Link to="/coupons" className="hover:text-[#E63946] transition-colors">Coupons & Deals</Link></li>
              <li><Link to="/help" className="hover:text-[#E63946] transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/help" className="hover:text-[#E63946] transition-colors">FAQ & Support</Link></li>
              <li><Link to="/settings" className="hover:text-[#E63946] transition-colors">Theme & Preferences</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3">
              Account & Portal
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li><Link to="/profile" className="hover:text-[#E63946] transition-colors">My Account</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#E63946] transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-[#E63946] transition-colors">Shopping Cart</Link></li>
              <li><Link to="/admin" className="text-[#E63946] font-semibold hover:underline">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Payment Badges */}
        <div className="border-t border-neutral-100 dark:border-neutral-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} CMCart Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-600 dark:text-neutral-400">Accepted Payments:</span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-bold text-[10px]">UPI</span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-bold text-[10px]">RuPay</span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-bold text-[10px]">Visa</span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-bold text-[10px]">Mastercard</span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-bold text-[10px]">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
