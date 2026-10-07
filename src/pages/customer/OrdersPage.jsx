import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ArrowRight, RotateCcw, Star, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useCart } from '../../context/CartContext';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    commerceDb.getOrders().then((list) => {
      setOrders(list);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Track packages, check past purchases, or download tax invoices.
        </p>
      </div>

      {/* Tabs */}
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

      {/* Order Cards List */}
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
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-6 space-y-4 shadow-xs"
            >
              {/* Order Meta Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-400">Order ID: </span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {order.order_number}
                  </span>
                  <span className="text-neutral-400 ml-2">
                    • {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items in this order */}
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-14 h-14 rounded-xl object-cover bg-neutral-50 dark:bg-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.product_name}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} {item.variant ? `• ${item.variant}` : ''}
                      </p>
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                        ₹{(item.total || item.unit_price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 flex-wrap gap-3">
                <div className="text-xs">
                  <span className="text-neutral-500">Total Amount: </span>
                  <span className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                    ₹{order.total_amount?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-neutral-400 ml-2">({order.payment_method})</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/order/${order.id}/tracking`}>
                    <Button variant="primary" size="sm" icon={Truck}>
                      Track Order
                    </Button>
                  </Link>

                  <Link to={`/order/${order.id}`}>
                    <Button variant="outline" size="sm" icon={Eye}>
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
