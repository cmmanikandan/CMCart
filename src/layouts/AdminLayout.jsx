import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Boxes,
  Percent,
  Image as ImageIcon,
  MessageSquare,
  Bell,
  CreditCard,
  BarChart3,
  FileText,
  Sliders,
  Settings,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { UserAvatar } from '../components/ui/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Navigation Items with Homepage Management
  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Homepage CMS', to: '/admin/homepage', icon: Sliders },
    { label: 'Categories', to: '/admin/categories', icon: Layers },
    { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
    { label: 'Coupons', to: '/admin/coupons', icon: Percent },
    { label: 'Banners', to: '/admin/banners', icon: ImageIcon },
    { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
    { label: 'Notifications', to: '/admin/notifications', icon: Bell },
    { label: 'Payment History', to: '/admin/payments', icon: CreditCard },
    { label: 'Reports', to: '/admin/reports', icon: FileText },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
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
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
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
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 cursor-pointer"
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

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-30 h-screen bg-white dark:bg-[#181818] border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header with Collapse Toggle */}
        <div
          className={`border-b border-neutral-100 dark:border-neutral-800 transition-all ${
            isCollapsed
              ? 'p-3 flex flex-col items-center justify-center gap-3.5'
              : 'p-4 flex items-center justify-between'
          }`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center justify-center w-full gap-3 py-1">
              {/* Show logo on top when collapsed */}
              <BrandLogo size="md" to="/admin" showText={false} />
              {/* Expand Toggle button positioned cleanly underneath */}
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 rounded-xl text-neutral-500 hover:text-[#E63946] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <PanelLeftOpen className="w-5 h-5 text-[#E63946]" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 overflow-hidden">
                <BrandLogo size="sm" to="/admin" showText={true} />
                <span className="hidden lg:inline text-[9px] font-extrabold uppercase bg-[#E63946]/10 text-[#E63946] px-1.5 py-0.5 rounded">
                  OPS
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Links List */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                    isCollapsed ? 'justify-center px-2' : ''
                  } ${
                    isActive
                      ? 'bg-[#E63946] text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!isCollapsed && isActive && (
                      <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Switcher & Profile Section */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
          <Link
            to="/home"
            title="Switch to Customer Store"
            className={`flex items-center gap-2 text-xs font-semibold text-[#E63946] hover:underline mb-2.5 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Customer Store</span>}
          </Link>

          <div
            className={`flex items-center pt-2 border-t border-neutral-200/60 dark:border-neutral-800 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <UserAvatar
                src={user?.photoURL}
                alt="Admin"
                name={user?.displayName || 'Admin'}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold truncate">{user?.displayName || 'Admin'}</p>
                  <p className="text-[10px] text-neutral-400">Operations Lead</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={() => {
                  switchRole('customer');
                  navigate('/home');
                }}
                title="Logout / Exit to Store"
                className="p-1.5 text-neutral-400 hover:text-[#DC2626] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Admin Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Admin Sticky Header Bar */}
        <header className="hidden md:flex h-16 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 px-6 items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-[#E63946]" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
            <div className="flex items-center gap-2 select-none">
              <span className="text-xs font-black tracking-widest text-[#E63946] uppercase">
                CMCart
              </span>
              <span className="text-xs text-neutral-300 dark:text-neutral-700 font-light">|</span>
              <span className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                ADMINISTRATION CONSOLE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Customer Storefront ↗</span>
            </Link>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
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
