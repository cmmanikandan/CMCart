import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  Percent,
  Image as ImageIcon,
  MessageSquare,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Categories', to: '/admin/categories', icon: Layers },
    { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Coupons', to: '/admin/coupons', icon: Percent },
    { label: 'Banners', to: '/admin/banners', icon: ImageIcon },
    { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
    { label: 'Notifications', to: '/admin/notifications', icon: Bell },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#111111] text-[#171717] dark:text-[#F5F5F5] flex flex-col md:flex-row">
      {/* Mobile Top App Bar for Admin */}
      <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-[#181818] border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Admin Menu"
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BrandLogo size="sm" showText={true} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-[#E63946] text-white px-2 py-0.5 rounded uppercase">
            ADMIN
          </span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar (Desktop Sticky Sidebar & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#181818] border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex flex-col">
            <BrandLogo size="sm" />
            <span className="text-[10px] font-extrabold tracking-widest text-[#E63946] uppercase mt-1">
              OPERATIONS PORTAL
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#E63946] text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Switcher & Profile Section */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
          <Link
            to="/home"
            className="flex items-center gap-2 text-xs font-semibold text-[#E63946] hover:underline mb-3"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Switch to Customer Store</span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                alt="Admin"
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-bold truncate">{user?.displayName || 'Admin'}</p>
                <p className="text-[10px] text-neutral-400">Operations Lead</p>
              </div>
            </div>
            <button
              onClick={() => {
                switchRole('customer');
                navigate('/home');
              }}
              title="Logout / Exit to Store"
              className="p-1.5 text-neutral-400 hover:text-[#DC2626] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Admin Header Bar */}
        <header className="hidden md:flex h-16 bg-white dark:bg-[#181818] border-b border-neutral-200 dark:border-neutral-800 px-6 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Administration Console
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Customer Storefront</span>
            </Link>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* Admin Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
