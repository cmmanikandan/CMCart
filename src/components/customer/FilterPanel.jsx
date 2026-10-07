import React from 'react';
import { Star, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export function FilterPanel({
  filters,
  onChange,
  onClear,
  availableBrands = [],
  availableCategories = [],
  className = '',
}) {
  const handlePriceChange = (min, max) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleBrandToggle = (brand) => {
    const current = filters.brands || [];
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onChange({ ...filters, brands: updated });
  };

  const handleRatingChange = (rating) => {
    onChange({ ...filters, rating: filters.rating === rating ? null : rating });
  };

  const handleDiscountChange = (discount) => {
    onChange({ ...filters, minDiscount: filters.minDiscount === discount ? null : discount });
  };

  return (
    <div className={`space-y-6 text-sm select-none ${className}`}>
      {/* Header with Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-xs">
          Filter Products
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-[#E63946] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Clear All
        </button>
      </div>

      {/* 1. Price Range */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3">
          Price Range
        </h4>
        <div className="space-y-2">
          {[
            { label: 'All Prices', min: 0, max: null },
            { label: 'Under ₹1,000', min: 0, max: 1000 },
            { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
            { label: '₹5,000 - ₹20,000', min: 5000, max: 20000 },
            { label: 'Over ₹20,000', min: 20000, max: null },
          ].map((range, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer"
            >
              <input
                type="radio"
                name="priceRange"
                checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                onChange={() => handlePriceChange(range.min, range.max)}
                className="w-4 h-4 text-[#E63946] focus:ring-[#E63946]"
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Customer Rating */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-2">
          {[4, 3, 2].map((stars) => (
            <label
              key={stars}
              onClick={() => handleRatingChange(stars)}
              className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer transition-colors text-xs ${
                filters.rating === stars
                  ? 'border-[#E63946] bg-[#E63946]/5 font-bold text-neutral-900 dark:text-neutral-100'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < stars ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
                  />
                ))}
              </div>
              <span>{stars}★ & above</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Discount Percentage */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3">
          Discounts & Offers
        </h4>
        <div className="space-y-2">
          {[10, 20, 30, 40].map((pct) => (
            <label
              key={pct}
              className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer"
            >
              <input
                type="radio"
                name="discountRange"
                checked={filters.minDiscount === pct}
                onChange={() => handleDiscountChange(pct)}
                className="w-4 h-4 text-[#E63946] focus:ring-[#E63946]"
              />
              <span>{pct}% or more</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Brand List */}
      {availableBrands.length > 0 && (
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3">
            Brands
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(filters.brands || []).includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
                />
                <span className="truncate">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
