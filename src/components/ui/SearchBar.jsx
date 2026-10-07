import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, History, ArrowRight } from 'lucide-react';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function SearchBar({
  placeholder = 'Search for products, brands and more...',
  autoFocus = false,
  className = '',
  onClose = null,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('cmcart_recent_searches');
      return stored ? JSON.parse(stored) : ['Headphones', 'Nike Sneakers', 'Apple Watch', 'Dumbbell'];
    } catch {
      return ['Headphones', 'Nike'];
    }
  });

  const popularSearches = [
    'Wireless Earbuds',
    'Cotton T-Shirt',
    'Sony WH-1000XM5',
    'Face Serum',
    'Hardcover Books'
  ];

  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      commerceDb.getProducts({ search: query }).then((results) => {
        setSuggestions(results.slice(0, 5));
      });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) return;

    // Update recent searches
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('cmcart_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setIsOpen(false);
    if (onClose) onClose();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <div ref={searchContainerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-100/90 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 text-sm pl-10 pr-9 py-2.5 rounded-xl border border-transparent focus:border-[#E63946] focus:bg-white dark:focus:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-3 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete & Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#181818] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 overflow-hidden text-sm">
          {/* Live Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 py-1 block">
                Products
              </span>
              {suggestions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setIsOpen(false);
                    if (onClose) onClose();
                    navigate(`/product/${p.id}`);
                  }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 rounded-lg cursor-pointer transition-colors"
                >
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    className="w-9 h-9 object-cover rounded-md bg-neutral-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate text-xs sm:text-sm">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-[#E63946] font-semibold">
                      ₹{p.current_price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3 h-3" />
                  Recent Searches
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecentSearches([]);
                    localStorage.removeItem('cmcart_recent_searches');
                  }}
                  className="text-[11px] text-[#E63946] hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearchSubmit(term)}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Trending Searches */}
          <div className="p-3">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-[#E63946]" />
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {popularSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleSearchSubmit(term)}
                  className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/60 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
