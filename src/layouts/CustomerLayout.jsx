import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/customer/Navbar';
import { MobileHeader } from '../components/customer/MobileHeader';
import { BottomNavigation } from '../components/customer/BottomNavigation';
import { Footer } from '../components/customer/Footer';

export function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7] dark:bg-[#111111] text-[#171717] dark:text-[#F5F5F5] transition-colors">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <Outlet />
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNavigation />

      {/* Desktop & Mobile Responsive Footer */}
      <Footer />
    </div>
  );
}
