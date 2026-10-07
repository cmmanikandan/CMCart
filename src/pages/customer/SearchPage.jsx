import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ProductGrid } from '../../components/ui/ProductGrid';
import { FilterPanel } from '../../components/customer/FilterPanel';
import { BottomSheet } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState('popularity');

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: null,
    rating: null,
    minDiscount: null,
    brands: [],
  });

  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      try {
        const results = await commerceDb.getProducts({ search: query });
        setProducts(results);
        setFilteredProducts(results);
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

  const availableBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link to="/home" className="hover:text-[#E63946]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Search Results</span>
      </div>

      <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">
          Search Results
        </p>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
          "{query}"
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Showing results for <span className="font-semibold text-neutral-800 dark:text-neutral-200">{query}</span>.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-[#181818] p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Found <span className="font-bold text-neutral-900 dark:text-neutral-100">{filteredProducts.length}</span> items
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline text-neutral-500">Sort by:</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <aside className="hidden lg:block bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 sticky top-24">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            availableBrands={availableBrands}
          />
        </aside>

        <div className="lg:col-span-3">
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            emptyTitle={`No products found for "${query}"`}
            emptyDescription="Try checking for spelling mistakes or explore our categories for trending items."
          />
        </div>
      </div>

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
