import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Heart,
  Percent,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Edit,
  User,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export function ProfilePage() {
  const { user, isAdmin, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const menuSections = [
    {
      title: 'Orders & Shopping',
      items: [
        {
          label: 'My Orders',
          to: '/orders',
          icon: Package,
          iconBg: 'bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#E63946]',
        },
        {
          label: 'Wishlist',
          to: '/wishlist',
          icon: Heart,
          iconBg: 'bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#E63946]',
          badge: wishlistCount,
        },
        {
          label: 'Cart',
          to: '/cart',
          icon: ShoppingBag,
          iconBg: 'bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#E63946]',
          badge: cartCount,
        },
      ]
    },
    {
      title: 'Preferences & Benefits',
      items: [
        {
          label: 'Saved Addresses',
          to: '/addresses',
          icon: MapPin,
          iconBg: 'bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#E63946]',
        },
        {
          label: 'Coupons & Offers',
          to: '/coupons',
          icon: Percent,
          iconBg: 'bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#E63946]',
        },
        {
          label: 'Notifications',
          to: '/notifications',
          icon: Bell,
          iconBg: 'bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#E63946]',
        },
      ]
    },
    {
      title: 'Account Settings & Support',
      items: [
        {
          label: 'Settings',
          to: '/settings',
          icon: Settings,
          iconBg: 'bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#E63946]',
        },
        {
          label: 'Help & Customer Care',
          to: '/help',
          icon: HelpCircle,
          iconBg: 'bg-[#E63946]/10 text-[#E63946] dark:bg-[#E63946]/20 dark:text-[#E63946]',
        },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-7 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.displayName}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#E63946]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
                {user?.displayName || 'Valued Shopper'}
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#E63946]/10 text-[#E63946]">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">{user?.email}</p>
            {user?.phone && (
              <p className="text-xs text-neutral-400 mt-0.5">{user.phone}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile/edit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Edit Profile</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E63946] text-white hover:bg-[#C92332] transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Quick Action Strip */}
      <div className="grid grid-cols-4 gap-2.5 sm:hidden">
        <Link
          to="/orders"
          className="bg-white dark:bg-[#181818] p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 dark:bg-[#E63946]/20 text-[#E63946] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Orders</span>
        </Link>
        <Link
          to="/wishlist"
          className="bg-white dark:bg-[#181818] p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform relative"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 dark:bg-[#E63946]/20 text-[#E63946] flex items-center justify-center relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Wishlist</span>
        </Link>
        <Link
          to="/coupons"
          className="bg-white dark:bg-[#181818] p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 dark:bg-[#E63946]/20 text-[#E63946] flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Coupons</span>
        </Link>
        <Link
          to="/help"
          className="bg-white dark:bg-[#181818] p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 dark:bg-[#E63946]/20 text-[#E63946] flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Help</span>
        </Link>
      </div>

      {/* Menu Groups - Clean without descriptions, vibrant colored icons by default */}
      <div className="space-y-5">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={iIdx}
                    to={item.to}
                    className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm sm:text-[15px] font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E63946] transition-colors">
                        {item.label}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge > 0 && (
                        <span className="bg-[#E63946] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4.5 h-4.5 text-neutral-400 group-hover:text-[#E63946] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Action */}
        <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of CMCart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
