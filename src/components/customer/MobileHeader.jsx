import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, ShoppingBag } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { useCart } from '../../context/CartContext';
import { SearchBar } from '../ui/SearchBar';

export function MobileHeader() {
  const { count: cartCount } = useCart();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 transition-colors">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <BrandLogo size="sm" showText={true} />

          {/* Action Icons: Search trigger, Notifications, Cart */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setShowSearchModal(true)}
              aria-label="Open search"
              className="p-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E63946] rounded-full" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative p-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-[#E63946]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#E63946] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Full-width mobile search overlay */}
      {showSearchModal && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-[#181818] p-4 flex flex-col animate-in fade-in duration-150">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1">
              <SearchBar
                autoFocus={true}
                onClose={() => setShowSearchModal(false)}
              />
            </div>
            <button
              onClick={() => setShowSearchModal(false)}
              className="px-3 py-2 text-sm font-semibold text-[#E63946]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
