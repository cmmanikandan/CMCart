import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Zap,
  Sparkles,
  Award,
  Clock,
  ChevronRight,
  Percent,
  TrendingUp,
  Tag
} from 'lucide-react';
import { BannerCarousel, Banner } from '../../components/ui/Banner';
import { CategoryCard } from '../../components/ui/CategoryCard';
import { ProductCard } from '../../components/ui/ProductCard';
import { ProductGrid } from '../../components/ui/ProductGrid';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function HomePage() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer for Deal of the Day
  const [timeLeft, setTimeLeft] = useState({ hours: 9, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, bans, all] = await Promise.all([
          commerceDb.getCategories(),
          commerceDb.getBanners(),
          commerceDb.getProducts(),
        ]);
        setCategories(cats);
        setBanners(bans);
        setDealProducts(all.filter((p) => p.is_deal_of_the_day || p.discount_percentage >= 20));
        setBestSellers(all.filter((p) => p.is_best_seller));
        setNewArrivals(all.filter((p) => p.is_new_arrival));
        setFeaturedProducts(all.filter((p) => p.is_featured));
        setRecommended(all.slice(2, 8));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* 1. Hero Promotional Banner Carousel */}
      <section className="-mt-1 sm:-mt-2">
        <BannerCarousel banners={banners} />
      </section>

      {/* 2. Top Categories Bar (Horizontal scroll on mobile, flex/grid on desktop) */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Explore Popular Categories</span>
          </h2>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-semibold text-[#E63946] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} layout="circle" />
          ))}
        </div>
      </section>

      {/* 3. Deals of the Day (With countdown timer & horizontal mobile scrolling) */}
      <section className="bg-white dark:bg-[#181818] p-4 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
                Deals of the Day
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Unbeatable discounts up to 60% off</p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            <Clock className="w-4 h-4 text-[#E63946]" />
            <span>Ends in:</span>
            <div className="flex items-center gap-1 font-mono font-bold">
              <span className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-1.5 py-0.5 rounded">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              :
              <span className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-1.5 py-0.5 rounded">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              :
              <span className="bg-[#E63946] text-white px-1.5 py-0.5 rounded">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Scroller / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {dealProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Best Sellers Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/products?filter=bestsellers"
            className="text-xs sm:text-sm font-semibold text-[#E63946] hover:underline flex items-center"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={bestSellers.slice(0, 6)} loading={loading} />
      </section>

      {/* 5. Mid-page High-Impact Promotional Banner */}
      <section>
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-900 to-[#171717] text-white p-6 sm:p-10 border border-neutral-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="bg-[#E63946] text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md inline-block mb-3">
              FESTIVAL CLEARANCE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
              Extra 15% Instant Off with Code <span className="text-[#E63946]">BIGSAVER15</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Valid on all purchases above ₹1,499. Apply coupon during checkout for instant deduction.
            </p>
          </div>
          <Link to="/products?filter=deals" className="shrink-0 w-full md:w-auto">
            <Button variant="primary" size="lg" className="w-full md:w-auto">
              Claim Discount Now
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. New Arrivals Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Fresh New Arrivals
            </h2>
          </div>
          <Link
            to="/products?filter=new"
            className="text-xs sm:text-sm font-semibold text-[#E63946] hover:underline flex items-center"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={newArrivals.slice(0, 6)} loading={loading} />
      </section>

      {/* 7. Featured & Recommended For You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E63946]" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Recommended For You
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-[#E63946] hover:underline flex items-center"
          >
            <span>View More</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={recommended} loading={loading} />
      </section>

      {/* 8. Recently Viewed Section */}
      <section className="bg-white dark:bg-[#181818] p-4 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Recently Viewed by You
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
