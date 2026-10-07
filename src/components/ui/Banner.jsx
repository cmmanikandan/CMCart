import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { getOptimizedImageUrl } from '../../services/cloudinary/cloudinaryService';

export function Banner({ banner, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-neutral-900 text-white min-h-[220px] sm:min-h-[280px] md:min-h-[340px] flex items-center shadow-md ${className}`}
    >
      {/* Background Image with Gradient Overlay */}
      <img
        src={getOptimizedImageUrl(banner.image_url, { width: 1400, quality: 85 })}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

      {/* Banner Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-xl">
        {banner.tag && (
          <span className="inline-block bg-[#E63946] text-white text-[10px] sm:text-xs font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md mb-3">
            {banner.tag}
          </span>
        )}
        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 sm:mb-3 leading-tight">
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p className="text-xs sm:text-base text-neutral-300 mb-5 sm:mb-6 line-clamp-2 max-w-md font-normal">
            {banner.subtitle}
          </p>
        )}
        {banner.cta_link && (
          <Link to={banner.cta_link}>
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              {banner.cta_text || 'Shop Now'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function BannerCarousel({ banners = [], autoPlayInterval = 5000, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [banners.length, autoPlayInterval]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className={`relative group ${className}`}>
      <Banner banner={current} />

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xs text-neutral-900 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xs text-neutral-900 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black shadow-md cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-[#E63946]'
                    : 'w-2 h-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
