import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowRight, Sparkles } from 'lucide-react';
import { CategoryCard } from '../../components/ui/CategoryCard';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commerceDb.getCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <span className="text-[11px] font-extrabold text-[#E63946] uppercase tracking-wider block mb-1">
          DIRECTORY
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
          All Shopping Categories
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Explore our vast catalog of top-rated brands across electronics, apparel, home, and personal care.
        </p>
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} layout="grid" />
        ))}
      </div>
    </div>
  );
}
