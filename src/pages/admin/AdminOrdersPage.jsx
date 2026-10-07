import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye, CheckCircle2, Truck, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { showToast } = useToast();

  const validStatuses = [
    'Pending',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Returned'
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    commerceDb.getOrders().then(setOrders);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await commerceDb.updateOrderStatus(orderId, newStatus);
    showToast(`Order status updated to "${newStatus}"!`, 'success');
    loadOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      const updated = await commerceDb.getOrderById(orderId);
      setSelectedOrder(updated);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_address?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            FULFILLMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Order Management & Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Process customer orders, update tracking statuses, and manage dispatch logistics.
          </p>
        </div>

        <Button onClick={loadOrders} variant="outline" size="sm" icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer name..."
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-semibold">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-[#E63946]"
          >
            <option value="All">All Statuses</option>
            {validStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status & Quick Update</th>
                <th className="py-3 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                    {ord.order_number}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold">{ord.shipping_address?.full_name || 'Customer'}</p>
                    <p className="text-[11px] text-neutral-400">{ord.shipping_address?.city}</p>
                  </td>
                  <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                    {new Date(ord.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {ord.items?.length || 1} item(s)
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                    ₹{ord.total_amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-xs">{ord.payment_method}</span>
                  </td>
                  <td className="py-3 px-4">
                    {/* Status Dropdown Controller (Updates in real-time) */}
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:ring-1 focus:ring-[#E63946] cursor-pointer"
                    >
                      {validStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1.5 text-neutral-600 hover:text-[#E63946] dark:text-neutral-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Details: ${selectedOrder.order_number}` : ''}
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <div>
                <span className="text-neutral-400 text-xs block">Current Status</span>
                <span className="text-base font-bold text-[#E63946]">{selectedOrder.status}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-xs block">Tracking Number</span>
                <span className="font-mono font-bold">{selectedOrder.tracking_number}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-xs mb-2">
                Order Items
              </h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={it.image} alt="" className="w-10 h-10 object-cover rounded" />
                      <div>
                        <p className="font-semibold truncate max-w-xs">{it.product_name}</p>
                        <p className="text-[11px] text-neutral-400">Qty: {it.quantity} {it.variant ? `• ${it.variant}` : ''}</p>
                      </div>
                    </div>
                    <span className="font-bold">₹{(it.total || it.unit_price * it.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border rounded-xl">
              <h4 className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-xs mb-1">
                Delivery Destination
              </h4>
              <p>{selectedOrder.shipping_address?.full_name} ({selectedOrder.shipping_address?.phone})</p>
              <p className="text-neutral-500">{selectedOrder.shipping_address?.address_line}, {selectedOrder.shipping_address?.city} - {selectedOrder.shipping_address?.pincode}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedOrder(null)} variant="primary" size="sm">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
