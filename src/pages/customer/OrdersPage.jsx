import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, ArrowRight, RotateCcw, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    commerceDb.getOrders().then((list) => {
      setOrders(list || []);
      setLoading(false);
    });
  }, []);

  const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Processing') return o.status === 'Confirmed' || o.status === 'Packed' || o.status === 'Pending';
    return o.status === activeTab;
  });

  const getStatusBadge = (status) => {
    if (status === 'Delivered') return <Badge variant="success">{status}</Badge>;
    if (status === 'Shipped' || status === 'Out for Delivery') return <Badge variant="primary">{status}</Badge>;
    if (status === 'Cancelled') return <Badge variant="error">{status}</Badge>;
    return <Badge variant="warning">{status}</Badge>;
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-500">Loading your orders...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Click on any order to view full package contents, live timeline tracking, and tax invoice.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === tab
                ? 'bg-[#E63946] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={`No ${activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders found`}
          description="You haven't placed any orders matching this status yet."
          actionText="Explore Top Products"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const items = order.items || [];
            const primaryItem = items[0] || {};
            const totalItemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
            const extraItems = items.slice(1);

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/order/${order.id}`)}
                className="group bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 space-y-3.5 shadow-xs hover:border-[#E63946]/50 dark:hover:border-[#E63946]/50 hover:shadow-md transition-all cursor-pointer relative"
              >
                {/* Order Top Bar: Order ID, Date, Status */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-neutral-900 dark:text-neutral-100">
                      #{order.order_number}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-500">
                      {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E63946] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Compact Primary Product View */}
                {primaryItem && (
                  <div className="flex items-center gap-3.5">
                    <img
                      src={primaryItem.image}
                      alt={primaryItem.product_name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E63946] transition-colors line-clamp-1">
                        {primaryItem.product_name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Qty: {primaryItem.quantity || 1} {primaryItem.variant && primaryItem.variant !== 'Default' ? `• ${primaryItem.variant}` : ''}
                      </p>
                      <p className="text-xs font-black text-neutral-900 dark:text-neutral-100 mt-0.5">
                        ₹{((primaryItem.total || (primaryItem.unit_price || 0) * (primaryItem.quantity || 1))).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Items Strip (Keeps 5+ items compact without lengthening card) */}
                {extraItems.length > 0 && (
                  <div className="flex items-center gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                    <span className="text-[11px] font-bold text-neutral-500 shrink-0">
                      +{extraItems.length} more in this order:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {extraItems.slice(0, 4).map((extra, eIdx) => (
                        <img
                          key={eIdx}
                          src={extra.image}
                          alt={extra.product_name}
                          title={extra.product_name}
                          className="w-9 h-9 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shrink-0"
                        />
                      ))}
                      {extraItems.length > 4 && (
                        <span className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-bold text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                          +{extraItems.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Paid</span>
                    <span className="text-sm font-black text-[#E63946]">
                      ₹{order.total_amount?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 group-hover:bg-[#E63946] group-hover:text-white transition-colors text-xs font-bold">
                    <span>View Order & Tracking</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
