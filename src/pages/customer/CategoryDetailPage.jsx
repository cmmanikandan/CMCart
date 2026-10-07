import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, ChevronRight } from 'lucide-react';
import { ProductGrid } from '../../components/ui/ProductGrid';
import { FilterPanel } from '../../components/customer/FilterPanel';
import { BottomSheet } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function CategoryDetailPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
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
    async function loadCategory() {
      setLoading(true);
      try {
        const cats = await commerceDb.getCategories();
        const found = cats.find((c) => c.id === id || c.slug === id);
        setCategory(found || { id, name: id.replace(/-/g, ' ').toUpperCase(), description: '' });

        const prods = await commerceDb.getProducts({ category: id });
        setProducts(prods);
        setFilteredProducts(prods);
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [id]);

  // Apply filters and sorting
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

    // Sort
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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link to="/home" className="hover:text-[#E63946]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/categories" className="hover:text-[#E63946]">Categories</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
          {category?.name || 'Category'}
        </span>
      </div>

      {/* Category Banner Header */}
      {category && (
        <div className="relative rounded-2xl bg-neutral-900 text-white p-6 sm:p-10 overflow-hidden shadow-sm">
          {category.image && (
            <img
              src={category.image}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          )}
          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-[#E63946] px-2.5 py-1 rounded inline-block mb-2">
              CATEGORY STORE
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{category.name}</h1>
            {category.description && (
              <p className="text-xs sm:text-sm text-neutral-300 mt-2">{category.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Control Bar: Items Count, Mobile Filter Trigger, Sort Select */}
      <div className="bg-white dark:bg-[#181818] p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Showing <span className="font-bold text-neutral-900 dark:text-neutral-100">{filteredProducts.length}</span> items
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline text-neutral-500">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-none rounded-lg px-2.5 py-1.5 font-semibold text-xs focus:ring-1 focus:ring-[#E63946] cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Desktop Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Left Sidebar Filter */}
        <aside className="hidden lg:block bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 sticky top-24">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            availableBrands={availableBrands}
          />
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          <ProductGrid products={filteredProducts} loading={loading} />
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Filter & Refine"
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
