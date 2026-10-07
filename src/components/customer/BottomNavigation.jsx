import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export function BottomNavigation() {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const navItems = [
    { label: 'Home', to: '/home', icon: Home },
    { label: 'Categories', to: '/categories', icon: LayoutGrid },
    { label: 'Wishlist', to: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Cart', to: '/cart', icon: ShoppingBag, badge: cartCount },
    { label: 'Account', to: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 transition-colors pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5 h-14 sm:h-16 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full select-none transition-colors relative ${
                  isActive
                    ? 'text-[#E63946]'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-[#E63946] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#181818]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
