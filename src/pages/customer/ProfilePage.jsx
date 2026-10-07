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
        { label: 'My Orders', desc: 'Track, return or buy again', to: '/orders', icon: Package },
        { label: 'Wishlist', desc: `${wishlistCount} items saved`, to: '/wishlist', icon: Heart },
        { label: 'Cart', desc: `${cartCount} items in cart`, to: '/cart', icon: ShoppingBag },
      ]
    },
    {
      title: 'Preferences & Benefits',
      items: [
        { label: 'Saved Addresses', desc: 'Manage home & office delivery addresses', to: '/addresses', icon: MapPin },
        { label: 'Coupons & Offers', desc: 'Active promo discounts & festival vouchers', to: '/coupons', icon: Percent },
        { label: 'Notifications', desc: 'Order alerts and special deals', to: '/notifications', icon: Bell },
      ]
    },
    {
      title: 'Account Settings & Support',
      items: [
        { label: 'Settings', desc: 'Theme, dark mode & preferences', to: '/settings', icon: Settings },
        { label: 'Help & Customer Care', desc: 'FAQs, returns and support assistance', to: '/help', icon: HelpCircle },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#E63946]"
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

      {/* Menu Groups */}
      <div className="space-y-6">
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
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center group-hover:bg-[#E63946]/10 group-hover:text-[#E63946] transition-colors">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E63946] transition-colors">
                          {item.label}
                        </h4>
                        <p className="text-[11px] text-neutral-400">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
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
