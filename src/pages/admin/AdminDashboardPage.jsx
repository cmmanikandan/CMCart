import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commerceDb.getAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-neutral-500">Loading admin operations metrics...</div>;
  }

  const kpis = [
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
      change: '+18.4% vs last mo',
      icon: IndianRupee,
      color: 'text-[#E63946]',
      bg: 'bg-[#E63946]/10'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      change: '+12.6% vs last mo',
      icon: ShoppingCart,
      color: 'text-sky-500',
      bg: 'bg-sky-50 dark:bg-sky-950/40'
    },
    {
      title: 'Active Customers',
      value: stats.totalCustomers?.toLocaleString('en-IN') || '1,240',
      change: '+8.2% new shoppers',
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      title: 'Products in Catalog',
      value: stats.totalProducts || 0,
      change: '100% active stock',
      icon: Package,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/40'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockCount || 0,
      change: 'Needs replenishment',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/40'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            ANALYTICS & METRICS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Real-time sales, inventory, and order fulfillment status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button variant="primary" size="sm">
              + New Product
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm">
              Manage Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row (Requirement #27) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 truncate">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {kpi.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue & Sales Chart Representation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                Sales & Revenue Trajectory (2026)
              </h3>
              <p className="text-xs text-neutral-400">Monthly gross merchandise volume (INR)</p>
            </div>
            <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +28% YoY
            </span>
          </div>

          {/* Bar Visualizer */}
          <div className="h-56 sm:h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {stats.salesTrend?.map((item, idx) => {
              const heightPct = Math.round((item.sales / 1200000) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-neutral-600 dark:text-neutral-300 transition-opacity whitespace-nowrap">
                    ₹{(item.sales / 100000).toFixed(1)}L
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[42px] bg-neutral-200 dark:bg-neutral-800 group-hover:bg-[#E63946] rounded-t-lg transition-all"
                  />
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Best Sellers (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
              Top Selling SKUs
            </h3>
            <Link to="/admin/products" className="text-xs text-[#E63946] font-semibold hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {stats.topProducts?.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover bg-neutral-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-[#E63946] font-bold">
                    ₹{p.current_price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-neutral-400">Rating {p.rating}★ ({p.review_count} sold)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
              Recent Fulfillment Orders
            </h3>
            <p className="text-xs text-neutral-400">Latest customer transactions across all channels</p>
          </div>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm">
              See All Orders
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th className="py-2.5 px-4 rounded-l-lg">Order ID</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {stats.recentOrders?.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                    {ord.order_number}
                  </td>
                  <td className="py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">
                    {ord.shipping_address?.full_name || 'Customer'}
                  </td>
                  <td className="py-3 px-4 text-neutral-500">
                    {new Date(ord.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    ₹{ord.total_amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : ord.status === 'Shipped'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/admin/orders" className="text-[#E63946] font-bold hover:underline">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
