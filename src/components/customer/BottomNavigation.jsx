import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export function BottomNavigation() {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    {
      label: 'Home',
      to: '/home',
      icon: Home,
      isActive: path === '/' || path === '/home',
    },
    {
      label: 'Categories',
      to: '/categories',
      icon: LayoutGrid,
      isActive: path === '/categories' || path.startsWith('/category/'),
    },
    {
      label: 'Wishlist',
      to: '/wishlist',
      icon: Heart,
      badge: wishlistCount,
      isActive: path === '/wishlist',
    },
    {
      label: 'Cart',
      to: '/cart',
      icon: ShoppingBag,
      badge: cartCount,
      isActive: path === '/cart',
    },
    {
      label: 'Account',
      to: '/profile',
      icon: User,
      isActive:
        path.startsWith('/profile') ||
        path.startsWith('/order') ||
        path.startsWith('/address') ||
        path === '/settings' ||
        path === '/notifications' ||
        path === '/coupons' ||
        path === '/help' ||
        path === '/reviews',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 transition-colors pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 h-14 sm:h-16 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center h-full select-none transition-colors relative ${
                active
                  ? 'text-[#E63946]'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#E63946] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#181818]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 ${
                  active ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
