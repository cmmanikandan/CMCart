import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  ArrowUpDown,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  List,
  ShoppingBag,
  Star,
  Truck,
  Zap,
  Heart,
  ShieldCheck,
  CheckCircle2
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

export function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeSubcategory, setActiveSubcategory] = useState('All');

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: null,
    rating: null,
    minDiscount: null,
    brands: [],
  });

  // Category-specific subcategory pills
  const SUBCATEGORIES_MAP = {
    electronics: ['All', 'Headphones & Audio', 'Smartwatches', 'Smartphones', 'Laptops & PCs', 'Accessories', 'Gaming'],
    fashion: ['All', 'Men Footwear', 'Streetwear', 'Winterwear', 'Watches & Accessories', 'Bags'],
    beauty: ['All', 'Serums & Skincare', 'Haircare', 'Fragrances', 'Bath & Body'],
    home: ['All', 'Living & Decor', 'Kitchenware', 'Lighting', 'Organizers'],
    sports: ['All', 'Fitness Equipment', 'Running Shoes', 'Sportswear', 'Yoga & Wellness'],
    books: ['All', 'Fiction & Bestsellers', 'Self-Help', 'Academic', 'Comics & Manga']
  };

  useEffect(() => {
    async function loadCategory() {
      setLoading(true);
      try {
        const cats = await commerceDb.getCategories();
        const found = cats.find((c) => c.id === id || c.slug === id);
        setCategory(found || {
          id,
          name: id.replace(/-/g, ' ').toUpperCase(),
          description: 'Explore the curated catalog collection with top deals and verified warranty.'
        });

        const prods = await commerceDb.getProducts({ category: id });
        setProducts(prods || []);
        setFilteredProducts(prods || []);
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [id]);

  // Apply filters, subcategory selection, and sorting
  useEffect(() => {
    let result = [...products];

    // Subcategory pill filter
    if (activeSubcategory !== 'All') {
      result = result.filter((p) => {
        const text = `${p.name} ${p.brand || ''} ${p.description || ''}`.toLowerCase();
        const sub = activeSubcategory.toLowerCase();
        return text.includes(sub) || sub.includes(p.brand?.toLowerCase() || '___');
      });
    }

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
  }, [filters, sortOption, products, activeSubcategory]);

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: null,
      rating: null,
      minDiscount: null,
      brands: [],
    });
    setActiveSubcategory('All');
  };

  const availableBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
  const subcategories = SUBCATEGORIES_MAP[id?.toLowerCase()] || ['All', 'Bestsellers', 'Top Rated', 'Deals of the Day', 'New Arrivals'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14 px-1">
      {/* Breadcrumb Navigation with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-[#E63946] hover:border-[#E63946] transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 min-w-0">
          <Link to="/home" className="hover:text-[#E63946]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/categories" className="hover:text-[#E63946]">Categories</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {category?.name || 'Category'}
          </span>
        </div>
      </div>

      {/* Flipkart-Style Category Hero Banner */}
      {category && (
        <div className="relative rounded-3xl bg-gradient-to-r from-neutral-950 via-[#1C1618] to-[#2B0E12] text-white p-6 sm:p-8 md:p-10 overflow-hidden shadow-md border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
          {category.image && (
            <img
              src={category.image}
              alt={category.name}
              className="absolute right-0 top-0 w-full md:w-2/3 h-full object-cover opacity-20 pointer-events-none"
            />
          )}

          <div className="relative z-10 max-w-xl space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase bg-[#E63946] px-3 py-1 rounded-full shadow-xs">
                FLIPKART SUPER DEALS
              </span>
              <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                UP TO 70% OFF
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight capitalize">
              {category.name} Store
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-lg">
              {category.description || 'Explore India’s favorite collection with guaranteed express doorstep delivery & official warranty.'}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-300 flex-wrap">
              <span className="bg-white/10 px-3 py-1 rounded-lg">✓ 100% Genuine Certified</span>
              <span className="bg-white/10 px-3 py-1 rounded-lg">⚡ Free Express Delivery</span>
              <span className="bg-white/10 px-3 py-1 rounded-lg">🔄 7-Day Easy Return</span>
            </div>
          </div>

          {category.image && (
            <div className="relative z-10 shrink-0 hidden md:block">
              <img
                src={category.image}
                alt={category.name}
                className="w-36 h-36 object-cover rounded-2xl border-2 border-white/20 shadow-xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Subcategory Filter Pills (Flipkart-Style) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {subcategories.map((sub) => (
          <button
            key={sub}
            type="button"
            onClick={() => setActiveSubcategory(sub)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubcategory === sub
                ? 'bg-[#E63946] text-white shadow-xs'
                : 'bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Control Bar: Items Count, Grid/List Switcher, Mobile Filter, Sort Dropdown */}
      <div className="bg-white dark:bg-[#181818] p-3 sm:p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 flex-wrap shadow-xs">
        <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Showing <span className="font-bold text-neutral-900 dark:text-neutral-100">{filteredProducts.length}</span> products
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-700 text-[#E63946] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-700 text-[#E63946] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline" />
            <span className="hidden sm:inline text-neutral-500">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-none rounded-xl px-2.5 py-1.5 font-semibold text-xs focus:ring-1 focus:ring-[#E63946] cursor-pointer"
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
        <aside className="hidden lg:block bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 sticky top-24 shadow-xs">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            availableBrands={availableBrands}
          />
        </aside>

        {/* Product Display Area: Grid OR List */}
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
                    {/* Left: Product Image with Discount & Wishlist */}
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

                    {/* Middle: Title, Ratings, Flipkart-style CMCart Assured Badge & Specs list */}
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

                      {/* Rating & CMCart Assured badge */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold shadow-xs">
                          <span>{p.rating || 4.2}</span>
                          <Star className="w-3 h-3 fill-white" />
                        </div>
                        <span className="text-xs text-neutral-500 font-medium">
                          ({(p.review_count || 128).toLocaleString()} Ratings)
                        </span>
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

                      {/* Bullet specs */}
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
                          <span>100% Genuine Product from Certified Partner</span>
                        </li>
                      </ul>

                      {/* Bank Offer Tag */}
                      <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/60 inline-block">
                        Bank Offer: 5% Cashback with Axis Bank | Extra ₹500 off on UPI
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
            <ProductGrid products={filteredProducts} loading={loading} />
          )}
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
