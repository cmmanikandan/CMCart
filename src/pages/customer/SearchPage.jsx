import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowLeft,
  LayoutGrid,
  List,
  ShoppingBag,
  X,
  Package,
  Heart,
  Star,
  Truck,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { ProductGrid } from '../../components/ui/ProductGrid';
import { FilterPanel } from '../../components/customer/FilterPanel';
import { BottomSheet } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Price } from '../../components/ui/Price';
import { Rating } from '../../components/ui/Rating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [inputQuery, setInputQuery] = useState(query);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: null,
    rating: null,
    minDiscount: null,
    brands: [],
  });

  // Sync input query with url search query
  useEffect(() => {
    setInputQuery(query);
  }, [query]);

  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      try {
        const results = await commerceDb.getProducts({ search: query });
        setProducts(results || []);
        setFilteredProducts(results || []);
      } finally {
        setLoading(false);
      }
    }
    executeSearch();
  }, [query]);

  useEffect(() => {
    let result = [...products];

    if (filters.minPrice !== null && filters.minPrice > 0) {
      result = result.filter((p) => p.current_price >= filters.minPrice);
    }
    if (filters.maxPrice !== null) {
      result = result.filter((p) => p.current_price <= filters.maxPrice);
    }
    if (filters.rating !== null) {
      result = result.filter((p) => p.rating >= filters.rating);
    }
    if (filters.minDiscount !== null) {
      result = result.filter((p) => p.discount_percentage >= filters.minDiscount);
    }
    if (filters.brands && filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    if (sortOption === 'price_asc') {
      result.sort((a, b) => a.current_price - b.current_price);
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => b.current_price - a.current_price);
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'discount') {
      result.sort((a, b) => b.discount_percentage - a.discount_percentage);
    }

    setFilteredProducts(result);
  }, [filters, sortOption, products]);

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: null,
      rating: null,
      minDiscount: null,
      brands: [],
    });
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery.trim() });
    }
  };

  const availableBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  return (
    <div className="space-y-5">
      {/* Header Row with Back Button & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-[#E63946] hover:border-[#E63946] transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Link to="/home" className="hover:text-[#E63946]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">Search Results</span>
        </div>
      </div>

      {/* Search Header Banner & Query Refinement Bar */}
      <div className="bg-white dark:bg-[#181818] p-4 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#E63946] uppercase tracking-wider font-bold mb-0.5">
              SEARCH RESULTS
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
              "{query}"
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Showing matching items for <span className="font-semibold text-neutral-800 dark:text-neutral-200">{query || 'all'}</span>
            </p>
          </div>

          {/* Inline Search Input Refiner */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Refine search..."
                className="w-full bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl border border-transparent focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020] focus:outline-none"
              />
              {inputQuery && (
                <button
                  type="button"
                  onClick={() => setInputQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Flipkart-Style Search Deals Hero Card */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-900 via-[#1C1C1C] to-rose-950 text-white p-5 sm:p-7 border border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="bg-[#E63946] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              TOP DEALS ON {query ? `"${query.toUpperCase()}"` : 'CATALOG'}
            </span>
            <span className="text-amber-400 text-xs font-bold">
              ★ Best Price Guarantee
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            Curated Mass-Market Discounts on Verified Brands
          </h2>
          <p className="text-xs text-neutral-300">
            Enjoy up to 50% discount with free express doorstep dispatch on orders above ₹999.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs font-semibold">
          <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">⚡ 100% Genuine</span>
          <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">🔄 7-Day Returns</span>
        </div>
      </div>

      {/* Control Bar: Count, View Mode Switcher, Sort and Filters */}
      <div className="bg-white dark:bg-[#181818] p-3 sm:p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 flex-wrap shadow-xs">
        <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Found <span className="font-bold text-neutral-900 dark:text-neutral-100">{filteredProducts.length}</span> items
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-700 text-[#E63946] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-700 text-[#E63946] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Sheet Trigger */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline" />
            <span className="hidden sm:inline text-neutral-500">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-none rounded-lg px-2.5 py-1.5 font-semibold text-xs focus:ring-1 focus:ring-[#E63946] cursor-pointer"
            >
              <option value="popularity">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Discount Percentage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Results Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 sticky top-24 shadow-xs">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            availableBrands={availableBrands}
          />
        </aside>

        {/* Products Content: Grid or List */}
        <div className="lg:col-span-3">
          {viewMode === 'list' && filteredProducts.length > 0 ? (
            <div className="space-y-4">
              {filteredProducts.map((p) => {
                const isWished = wishlist && wishlist.some((w) => w.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-4 sm:p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs group flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                  >
                    {/* Left: Image Container */}
                    <div className="shrink-0 relative w-full sm:w-44 md:w-48 aspect-square sm:aspect-auto sm:h-48 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-700/60 overflow-hidden flex items-center justify-center">
                      <Link to={`/product/${p.id}`} className="w-full h-full flex items-center justify-center p-2">
                        <img
                          src={getOptimizedImageUrl(p.images?.[0] || p.image, { width: 300 })}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      {p.discount_percentage > 0 && (
                        <span className="absolute top-2 left-2 bg-[#E63946] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                          {p.discount_percentage}% OFF
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(p)}
                        aria-label="Toggle wishlist"
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-[#181818]/90 backdrop-blur-xs flex items-center justify-center text-neutral-400 hover:text-[#E63946] shadow-xs transition-colors cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${isWished ? 'fill-[#E63946] text-[#E63946]' : ''}`} />
                      </button>
                    </div>

                    {/* Middle: Title, Ratings, CMCart Assured Badge & Specs list */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        {p.brand && (
                          <span className="text-[11px] font-bold text-[#E63946] uppercase tracking-wider block mb-0.5">
                            {p.brand}
                          </span>
                        )}
                        <Link
                          to={`/product/${p.id}`}
                          className="text-sm sm:text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#E63946] line-clamp-2 leading-snug transition-colors"
                        >
                          {p.name}
                        </Link>
                      </div>

                      {/* Rating & CMCart Assured badge (Flipkart-style) */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold shadow-xs">
                          <span>{p.rating || 4.2}</span>
                          <Star className="w-3 h-3 fill-white" />
                        </div>
                        <span className="text-xs text-neutral-500 font-medium">
                          ({(p.review_count || 128).toLocaleString()} Ratings)
                        </span>
                        {/* CMCart Assured badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black italic tracking-wider shadow-xs">
                          <span>CMCart</span>
                          <span className="text-amber-300 font-extrabold">Plus</span>
                          <span>✓</span>
                        </span>
                        {p.is_best_seller && (
                          <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
                            BESTSELLER
                          </span>
                        )}
                      </div>

                      {/* Flipkart style bullet specs */}
                      <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 pt-1">
                        <li className="flex items-center gap-1.5">
                          <span className="text-neutral-400">•</span>
                          <span>1 Year Comprehensive Manufacturer Warranty</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-neutral-400">•</span>
                          <span>7 Days Easy Replacement Policy</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-neutral-400">•</span>
                          <span>100% Genuine & Verified CMCart Partner Product</span>
                        </li>
                      </ul>

                      {/* Bank Offer Banner */}
                      <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/60 inline-block">
                        Bank Offer: 5% Cashback with Axis Bank | Flat ₹500 off on UPI
                      </p>
                    </div>

                    {/* Right: Pricing, Free Delivery & Quick Actions */}
                    <div className="w-full sm:w-48 md:w-56 shrink-0 sm:text-right border-t sm:border-t-0 sm:border-l border-neutral-100 dark:border-neutral-800/80 pt-3 sm:pt-0 sm:pl-5 flex flex-col justify-between self-stretch space-y-3">
                      <div>
                        <div className="flex items-baseline sm:justify-end gap-2">
                          <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
                            ₹{p.current_price?.toLocaleString('en-IN')}
                          </span>
                          {p.original_price > p.current_price && (
                            <span className="text-xs text-neutral-400 line-through">
                              ₹{p.original_price?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {p.discount_percentage > 0 && (
                          <p className="text-xs font-bold text-[#16A34A] sm:text-right mt-0.5">
                            {p.discount_percentage}% off discount
                          </p>
                        )}
                        <p className="text-xs text-[#16A34A] font-semibold flex items-center sm:justify-end gap-1 mt-1">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Free delivery</span>
                        </p>
                        <p className="text-[10px] text-neutral-400 sm:text-right mt-0.5">
                          Delivery by Tomorrow, 11 PM
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 pt-2">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(p, null, 1);
                          }}
                          variant="primary"
                          size="sm"
                          icon={ShoppingBag}
                          className="w-full text-xs font-bold h-9 justify-center shadow-xs"
                        >
                          Add to Cart
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(p, null, 1);
                            navigate('/checkout');
                          }}
                          variant="outline"
                          size="sm"
                          icon={Zap}
                          className="w-full text-xs font-bold h-9 justify-center border-neutral-300 dark:border-neutral-700"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              emptyTitle={`No products found for "${query}"`}
              emptyDescription="Try checking for spelling mistakes or explore our categories for trending items."
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Filter Search Results"
      >
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          availableBrands={availableBrands}
        />
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={() => {
              clearFilters();
              setShowMobileFilters(false);
            }}
          >
            Clear
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => setShowMobileFilters(false)}
          >
            Apply Filters
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
