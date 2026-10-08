import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/customer/Navbar';
import { MobileHeader } from '../components/customer/MobileHeader';
import { BottomNavigation } from '../components/customer/BottomNavigation';
import { Footer } from '../components/customer/Footer';

export function CustomerLayout() {
  const location = useLocation();
  const hideBottomNav =
    location.pathname.startsWith('/product/') ||
    location.pathname.startsWith('/checkout');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7] dark:bg-[#111111] text-[#171717] dark:text-[#F5F5F5] transition-colors">
      {/* Desktop Header */}
      <Navbar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 ${
          hideBottomNav ? 'pb-10 md:pb-8' : 'pb-24 md:pb-8'
        }`}
      >
        <Outlet />
      </main>

      {/* Mobile Fixed Bottom Navigation (Hidden on Product Detail and Checkout) */}
      {!hideBottomNav && <BottomNavigation />}

      {/* Desktop-Only Footer (Hidden on Mobile) */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
