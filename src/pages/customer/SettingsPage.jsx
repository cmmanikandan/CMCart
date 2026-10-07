import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  ArrowLeft,
  Check,
  Smartphone
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(true);
  const [currency, setCurrency] = useState('INR');

  const handleToggleOrderNotifs = () => {
    setOrderNotifs(!orderNotifs);
    showToast(`Order notifications ${!orderNotifs ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleTogglePromoNotifs = () => {
    setPromoNotifs(!promoNotifs);
    showToast(`Promotional offers ${!promoNotifs ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
            Settings & Preferences
          </h1>
          <p className="text-xs text-neutral-500">Configure visual theme, notifications and store parameters.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance & Theme (Requirement #26) */}
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Appearance & Interface Theme
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                {isDark ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </h4>
                <p className="text-xs text-neutral-500">
                  {isDark ? 'Deep contrast #111111 surfaces' : 'Clean crisp white and #F7F7F7 background'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${
                isDark ? 'bg-[#E63946]' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Notification Preferences
          </h3>

          <div className="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            <div className="flex items-center justify-between pt-2">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Order Delivery Updates
                </h4>
                <p className="text-xs text-neutral-500">Real-time notifications for dispatched and delivered items</p>
              </div>
              <input
                type="checkbox"
                checked={orderNotifs}
                onChange={handleToggleOrderNotifs}
                className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Deals & Promotional Discounts
                </h4>
                <p className="text-xs text-neutral-500">Festival flash sales, coupon drops and special events</p>
              </div>
              <input
                type="checkbox"
                checked={promoNotifs}
                onChange={handleTogglePromoNotifs}
                className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
              />
            </div>
          </div>
        </div>

        {/* Regional & Currency */}
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Regional Preferences
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Currency Display</h4>
                <p className="text-xs text-neutral-500">Indian Rupee (₹ INR)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#E63946] bg-[#E63946]/10 px-2.5 py-1 rounded-md">
              ₹ INR
            </span>
          </div>
        </div>

        {/* Device & Architecture Details */}
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2 text-xs text-neutral-500">
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">CMCart Mobile Architecture</p>
          <p>Version: 2.4.0 (Production Release)</p>
          <p>Capacitor Android & PWA Engine Active</p>
          <p className="text-[11px] text-neutral-400">Connected to Supabase PostgreSQL & Firebase Auth</p>
        </div>
      </div>
    </div>
  );
}
