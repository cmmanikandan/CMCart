import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Package,
  MapPin,
  Settings,
  ShieldAlert,
  Percent,
  Flame,
  Sparkles,
  Zap
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { SearchBar } from '../ui/SearchBar';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { user, isAdmin, logout, switchRole } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors">
      {/* Top Banner Notice / Role Switcher Utility */}
      <div className="bg-neutral-900 text-white dark:bg-neutral-950 text-xs py-1.5 px-4 hidden md:block border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Zap className="w-3.5 h-3.5 text-[#E63946]" />
              Super Savings Festival: Free Express Delivery on orders above ₹999
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-300">
            {/* Quick Role preview switch for reviewer/testing */}
            <div className="flex items-center gap-1.5 bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
              <span className="text-neutral-400">View as:</span>
              <button
                onClick={() => switchRole('customer')}
                className={`font-semibold transition-colors ${
                  !isAdmin ? 'text-[#E63946]' : 'text-neutral-300 hover:text-white'
                }`}
              >
                Customer
              </button>
              <span className="text-neutral-600">|</span>
              <button
                onClick={() => {
                  switchRole('admin');
                  navigate('/admin');
                }}
                className={`font-semibold transition-colors ${
                  isAdmin ? 'text-[#E63946]' : 'text-neutral-300 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
            <Link to="/help" className="hover:text-white transition-colors">
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Desktop Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-6">
        {/* Brand Logo */}
        <BrandLogo size="md" />

        {/* Prominent Search Bar */}
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-5 shrink-0 ml-auto">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative flex items-center gap-1.5 p-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors group"
          >
            <div className="relative">
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#E63946] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-sm font-semibold hidden lg:inline">Wishlist</span>
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60 transition-colors group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#E63946] group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#E63946] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-sm font-bold hidden sm:inline">Cart</span>
          </Link>

          {/* Account / User Menu Dropdown */}
          <div className="relative">
            {user ? (
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors select-none"
              >
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                />
                <div className="hidden xl:block text-left">
                  <p className="text-xs text-neutral-400 leading-none">Hello,</p>
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate max-w-[90px]">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#E63946] text-white text-sm font-semibold hover:bg-[#C92332] transition-colors shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* User Dropdown Popover */}
            {user && userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#181818] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 py-2 text-sm animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase">
                      {user.role}
                    </span>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[#E63946] hover:bg-[#E63946]/10 font-bold"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/addresses"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Saved Addresses</span>
                  </Link>
                  <Link
                    to="/coupons"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <Percent className="w-4 h-4" />
                    <span>Coupons & Offers</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 mt-2 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Second Navigation Row: Deals, Best Sellers, Categories */}
      <div className="bg-neutral-50 dark:bg-[#151515] border-t border-neutral-100 dark:border-neutral-800/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
            <Link
              to="/categories"
              className="text-neutral-800 dark:text-neutral-200 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors shrink-0 flex items-center gap-1.5"
            >
              All Categories
            </Link>
            <Link
              to="/products?filter=deals"
              className="text-neutral-800 dark:text-neutral-200 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#E63946]" />
              Today's Deals
            </Link>
            <Link
              to="/products?filter=bestsellers"
              className="text-neutral-800 dark:text-neutral-200 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Best Sellers
            </Link>
            <Link
              to="/products?filter=new"
              className="text-neutral-800 dark:text-neutral-200 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              New Arrivals
            </Link>
            <Link
              to="/coupons"
              className="text-neutral-800 dark:text-neutral-200 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Percent className="w-3.5 h-3.5 text-emerald-500" />
              Offers & Coupons
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-normal text-neutral-500 shrink-0">
            <span>Customer Care: 1800-CMC-SHOP</span>
          </div>
        </div>
      </div>
    </header>
  );
}
