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
  Tag,
  Copy,
  Check
} from 'lucide-react';
import { BannerCarousel } from '../../components/ui/Banner';
import { CategoryCard } from '../../components/ui/CategoryCard';
import { ProductCard } from '../../components/ui/ProductCard';
import { ProductGrid } from '../../components/ui/ProductGrid';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

// Helper for Real Deal Countdown based on actual ISO end timestamp
function calculateTimeLeft(endTimestamp) {
  if (!endTimestamp) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  const diff = new Date(endTimestamp).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isExpired: false };
}

export function HomePage() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [activeDeals, setActiveDeals] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const { showToast } = useToast();

  // Load all dynamic storefront CMS data
  useEffect(() => {
    async function loadStorefrontData() {
      try {
        const [secs, cats, bans, prods, dls, cpons] = await Promise.all([
          commerceDb.getHomepageSections({ activeOnly: true }),
          commerceDb.getCategories(),
          commerceDb.getBanners(),
          commerceDb.getProducts(),
          commerceDb.getDeals({ activeOnly: true }),
          commerceDb.getCoupons()
        ]);
        setSections(secs);
        setCategories(cats);
        setBanners(bans);
        setAllProducts(prods);
        setActiveDeals(dls);
        setCoupons(cpons);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStorefrontData();
  }, []);

  // Primary active deal
  const currentDeal = activeDeals[0] || null;
  const [dealTimeLeft, setDealTimeLeft] = useState(() =>
    calculateTimeLeft(currentDeal?.end_at)
  );

  useEffect(() => {
    if (!currentDeal?.end_at) return;
    const interval = setInterval(() => {
      setDealTimeLeft(calculateTimeLeft(currentDeal.end_at));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentDeal?.end_at]);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon code ${code} copied!`, 'success');
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 sm:h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full" />
        <div className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full" />
        <div className="h-72 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full" />
      </div>
    );
  }

  // ==================================================
  // DYNAMIC SECTION RENDERER
  // Evaluates sections configured and ordered by Admin
  // ==================================================
  const renderSection = (section) => {
    switch (section.section_type) {
      case 'hero_banner':
        return (
          <section key={section.id} className="-mt-1 sm:-mt-2">
            <BannerCarousel banners={banners.filter((b) => b.is_active !== false)} />
          </section>
        );

      case 'categories':
        return (
          <section key={section.id}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>{section.title || 'Explore Popular Categories'}</span>
                </h2>
                {section.subtitle && (
                  <p className="text-xs text-neutral-500 mt-0.5">{section.subtitle}</p>
                )}
              </div>
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
        );

      case 'deals': {
        // If deal is expired, skip or show expired notice
        if (dealTimeLeft.isExpired && !currentDeal) return null;

        // Merge deal prices with catalogue products
        const dealProductsList = (currentDeal?.products || []).map((dp) => {
          const matched = allProducts.find((p) => p.id === dp.product_id) || {};
          return {
            ...matched,
            ...dp,
            current_price: dp.deal_price || matched.current_price,
            original_price: dp.original_price || matched.original_price,
            discount_percentage: dp.discount_percentage || matched.discount_percentage,
            deal_badge: currentDeal.deal_badge || 'DEAL'
          };
        });

        const displayItems =
          dealProductsList.length > 0
            ? dealProductsList
            : allProducts.filter((p) => p.is_deal_of_the_day || p.discount_percentage >= 20);

        return (
          <section
            key={section.id}
            className="bg-white dark:bg-[#181818] p-4 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs"
          >
            {/* Header with Title and Real Countdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
                      {section.title || currentDeal?.title || 'Deals of the Day'}
                    </h2>
                    {currentDeal?.deal_badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#E63946] text-white">
                        [{currentDeal.deal_badge}]
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {section.subtitle || currentDeal?.subtitle || 'Unbeatable discounts up to 60% off'}
                  </p>
                </div>
              </div>

              {/* Real Countdown Timer calculated from ISO End Timestamp */}
              {!dealTimeLeft.isExpired ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  <Clock className="w-4 h-4 text-[#E63946]" />
                  <span>Ends in:</span>
                  <div className="flex items-center gap-1 font-mono font-bold">
                    {dealTimeLeft.days > 0 && (
                      <>
                        <span className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-1.5 py-0.5 rounded">
                          {String(dealTimeLeft.days).padStart(2, '0')}d
                        </span>
                        :
                      </>
                    )}
                    <span className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-1.5 py-0.5 rounded">
                      {String(dealTimeLeft.hours).padStart(2, '0')}
                    </span>
                    :
                    <span className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-1.5 py-0.5 rounded">
                      {String(dealTimeLeft.minutes).padStart(2, '0')}
                    </span>
                    :
                    <span className="bg-[#E63946] text-white px-1.5 py-0.5 rounded animate-pulse">
                      {String(dealTimeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded">
                  Deal Expired
                </span>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {displayItems.slice(0, 8).map((product) => (
                <ProductCard key={product.id || product.product_id} product={product} />
              ))}
            </div>
          </section>
        );
      }

      case 'best_sellers': {
        const bestSellerProducts = allProducts.filter((p) => p.is_best_seller);
        return (
          <section key={section.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
                    {section.title || 'Best Sellers'}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs text-neutral-500 mt-0.5">{section.subtitle}</p>
                  )}
                </div>
              </div>
              <Link
                to="/products?filter=bestsellers"
                className="text-xs sm:text-sm font-semibold text-[#E63946] hover:underline flex items-center"
              >
                <span>See All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <ProductGrid products={bestSellerProducts.slice(0, 8)} loading={false} />
          </section>
        );
      }

      case 'banner_promo':
        return (
          <section key={section.id}>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-900 to-[#171717] text-white p-6 sm:p-10 border border-neutral-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="bg-[#E63946] text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md inline-block mb-3">
                  FESTIVAL CLEARANCE
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
                  {section.title || 'Extra 15% Instant Off with Code'}{' '}
                  <span className="text-[#E63946]">BIGSAVER15</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400">
                  {section.subtitle ||
                    'Valid on all purchases above ₹1,499. Apply coupon during checkout for instant deduction.'}
                </p>
              </div>
              <Link to="/products?filter=deals" className="shrink-0 w-full md:w-auto">
                <Button variant="primary" size="lg" className="w-full md:w-auto">
                  Claim Discount Now
                </Button>
              </Link>
            </div>
          </section>
        );

      case 'new_arrivals': {
        const newProducts = allProducts.filter((p) => p.is_new_arrival);
        return (
          <section key={section.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
                    {section.title || 'Fresh New Arrivals'}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs text-neutral-500 mt-0.5">{section.subtitle}</p>
                  )}
                </div>
              </div>
              <Link
                to="/products?filter=new"
                className="text-xs sm:text-sm font-semibold text-[#E63946] hover:underline flex items-center"
              >
                <span>Explore All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <ProductGrid products={newProducts.slice(0, 8)} loading={false} />
          </section>
        );
      }

      case 'coupons':
        return (
          <section key={section.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#E63946]" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
                    {section.title || 'Offers & Coupons'}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {section.subtitle || '1-click copy codes to save on checkout'}
                  </p>
                </div>
              </div>
              <Link
                to="/coupons"
                className="text-xs sm:text-sm font-semibold text-[#E63946] hover:underline flex items-center"
              >
                <span>View All Coupons</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {coupons.slice(0, 3).map((coupon) => (
                <div
                  key={coupon.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#E63946] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500">
                        Min ₹{coupon.min_order}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                      {coupon.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="mt-3 w-full py-1.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-xs font-bold flex items-center justify-center gap-1.5 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {copiedCoupon === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        );

      case 'recommended': {
        const recommendedProducts = allProducts.slice(2, 10);
        return (
          <section key={section.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#E63946]" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
                    {section.title || 'Recommended For You'}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs text-neutral-500 mt-0.5">{section.subtitle}</p>
                  )}
                </div>
              </div>
              <Link
                to="/products"
                className="text-xs sm:text-sm font-semibold text-[#E63946] hover:underline flex items-center"
              >
                <span>View More</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <ProductGrid products={recommendedProducts} loading={false} />
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Dynamic rendering of sections ordered by admin */}
      {sections.map((section) => renderSection(section))}
    </div>
  );
}
