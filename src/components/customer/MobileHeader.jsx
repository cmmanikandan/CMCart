import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ShoppingBag,
  Sun,
  Moon,
  ArrowLeft,
  X,
  History,
  TrendingUp,
  ArrowRight,
  Star,
  Layers,
  ChevronRight,
  Package
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { UserAvatar } from '../ui/UserAvatar';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function MobileHeader() {
  const { user } = useAuth();
  const { count: cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('cmcart_recent_searches');
      return stored ? JSON.parse(stored) : ['Headphones', 'Nike Sneakers', 'Apple Watch', 'Dumbbell'];
    } catch {
      return ['Headphones', 'Nike Sneakers', 'Apple Watch', 'Dumbbell'];
    }
  });

  const popularSearches = [
    'Wireless Earbuds',
    'Cotton T-Shirt',
    'Sony WH-1000XM5',
    'Face Serum',
    'Hardcover Books'
  ];

  const quickCategories = [
    { name: 'Electronics', id: 'cat-electronics' },
    { name: 'Fashion', id: 'cat-fashion' },
    { name: 'Home & Living', id: 'cat-home' },
    { name: 'Beauty', id: 'cat-beauty' },
    { name: 'Sports', id: 'cat-sports' }
  ];

  const navigate = useNavigate();

  // Live search query effect
  useEffect(() => {
    if (!showSearchModal) return;

    const trimmed = searchQuery.trim();
    if (trimmed.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        commerceDb.getProducts({ search: trimmed }).then((res) => {
          setSearchResults(res || []);
          setIsSearching(false);
        });
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, showSearchModal]);

  const handleExecuteSearch = (term) => {
    const finalTerm = (term !== undefined ? term : searchQuery).trim();
    if (!finalTerm) return;

    // Save recent search
    const updated = [finalTerm, ...recentSearches.filter((s) => s.toLowerCase() !== finalTerm.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('cmcart_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setShowSearchModal(false);
    setSearchQuery('');
    navigate(`/search?q=${encodeURIComponent(finalTerm)}`);
  };

  const handleClearRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('cmcart_recent_searches');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 transition-colors shadow-xs">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <BrandLogo size="sm" showText={true} />

          {/* Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Search Trigger */}
            <button
              onClick={() => setShowSearchModal(true)}
              aria-label="Open search"
              className="p-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-neutral-600" />}
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

            {/* Mobile Top Sign In / Profile Button */}
            {!user ? (
              <Link
                to="/login"
                className="ml-1 px-2.5 py-1.5 rounded-xl bg-[#E63946] text-white text-xs font-bold hover:bg-[#D62828] active:scale-95 transition-all shadow-xs shrink-0"
              >
                Sign In
              </Link>
            ) : (
              <Link to="/profile" className="ml-1 shrink-0 p-0.5">
                <UserAvatar
                  src={user.photoURL}
                  name={user.displayName}
                  alt={user.displayName || 'Profile'}
                  className="w-7 h-7 rounded-full object-cover border-2 border-[#E63946]"
                />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Search View with Back Button & Rich Results */}
      {showSearchModal && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#F7F7F7] dark:bg-[#111111] flex flex-col animate-in fade-in duration-150 text-neutral-900 dark:text-neutral-100">
          {/* Header Bar */}
          <div className="bg-white dark:bg-[#181818] border-b border-neutral-200 dark:border-neutral-800 px-3 py-2.5 flex items-center gap-2 shrink-0 shadow-xs">
            {/* Back Button */}
            <button
              onClick={() => {
                setShowSearchModal(false);
                setSearchQuery('');
              }}
              aria-label="Go back"
              className="p-2 -ml-1 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Search Input Box */}
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteSearch(searchQuery);
                }}
                autoFocus
                placeholder="Search products, brands, categories..."
                className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 text-sm pl-9 pr-9 py-2 rounded-xl border border-transparent focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020] focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={() => handleExecuteSearch(searchQuery)}
              disabled={!searchQuery.trim()}
              className="px-3 py-2 text-xs font-bold text-white bg-[#E63946] disabled:opacity-40 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500 rounded-xl transition-all cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>

          {/* Search Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* If query has text: show live results list */}
            {searchQuery.trim().length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {isSearching ? 'Searching...' : `Products Found (${searchResults.length})`}
                  </span>
                  {searchResults.length > 0 && (
                    <button
                      onClick={() => handleExecuteSearch(searchQuery)}
                      className="text-xs font-bold text-[#E63946] hover:underline flex items-center gap-1"
                    >
                      <span>View all results</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-xs">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setShowSearchModal(false);
                          setSearchQuery('');
                          navigate(`/product/${product.id}`);
                        }}
                        className="p-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer group"
                      >
                        <img
                          src={getOptimizedImageUrl(product.images?.[0] || product.image, { width: 120 })}
                          alt={product.name}
                          className="w-14 h-14 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          {product.brand && (
                            <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-wider mb-0.5 truncate">
                              {product.brand}
                            </p>
                          )}
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-[#E63946] transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                              ₹{product.current_price?.toLocaleString('en-IN')}
                            </span>
                            {product.original_price && product.original_price > product.current_price && (
                              <span className="text-[10px] text-neutral-400 line-through">
                                ₹{product.original_price?.toLocaleString('en-IN')}
                              </span>
                            )}
                            {product.rating && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded ml-auto">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {product.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E63946] transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  !isSearching && (
                    <div className="text-center py-12 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                      <Package className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        No products found for "{searchQuery}"
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Try searching with broader terms or browse the popular categories below.
                      </p>
                    </div>
                  )
                )}

                {searchResults.length > 0 && (
                  <button
                    onClick={() => handleExecuteSearch(searchQuery)}
                    className="w-full py-3 bg-[#E63946] hover:bg-[#C92332] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>View all {searchResults.length} results on Search Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* When query is empty: show Recent Searches, Trending Searches & Categories */
              <div className="space-y-5">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-neutral-400" />
                        Recent Searches
                      </span>
                      <button
                        onClick={handleClearRecent}
                        className="text-xs text-[#E63946] font-semibold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => handleExecuteSearch(term)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Trending Searches */}
                <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#E63946]" />
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleExecuteSearch(term)}
                        className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/60 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Categories */}
                <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-neutral-400" />
                    Browse Top Categories
                  </span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {quickCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setShowSearchModal(false);
                          setSearchQuery('');
                          navigate(`/category/${cat.id}`);
                        }}
                        className="p-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 rounded-xl text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
