import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, Download, ChevronRight, Package, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    commerceDb.getOrderById(id).then((ord) => {
      setOrder(ord);
      setLoading(false);
    });
  }, [id]);

  const handleBuyAgain = (item) => {
    addToCart({ id: item.product_id, name: item.product_name, current_price: item.unit_price, images: [item.image] }, item.variant, 1);
    showToast(`Added ${item.product_name} back to cart!`, 'success');
  };

  const handleDownloadInvoice = () => {
    showToast(`Downloading tax invoice for #${order?.order_number}...`, 'info');
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-500">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#181818] rounded-2xl border p-8">
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <Link to="/orders">
          <Button variant="primary" size="md">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link to="/orders" className="hover:text-[#E63946] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          My Orders
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          Order #{order.order_number}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            TAX INVOICE & ORDER SUMMARY
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
            Order #{order.order_number}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleDownloadInvoice} variant="outline" size="sm" icon={Download}>
            Invoice
          </Button>
          <Link to={`/order/${order.id}/tracking`}>
            <Button variant="primary" size="sm" icon={Truck}>
              Track Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          Ordered Products ({order.items?.length || 0})
        </h3>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={item.image}
                  alt={item.product_name}
                  className="w-16 h-16 rounded-xl object-cover bg-neutral-100 shrink-0"
                />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.product_name}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Qty: {item.quantity} {item.variant ? `• ${item.variant}` : ''}
                  </p>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    ₹{(item.total || item.unit_price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleBuyAgain(item)}
                variant="outline"
                size="sm"
                icon={RotateCcw}
              >
                Buy Again
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Details & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Shipping Address
          </h3>
          {order.shipping_address && (
            <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
              <p className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {order.shipping_address.full_name} ({order.shipping_address.type})
              </p>
              <p>{order.shipping_address.address_line}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
              <p className="mt-1 text-neutral-500 font-medium">Contact: {order.shipping_address.phone}</p>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Payment Breakdown
          </h3>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Subtotal</span>
              <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-[#16A34A] font-semibold">
                <span>Discount</span>
                <span>-₹{order.discount_amount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Delivery Fee</span>
              <span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Taxes (18% GST)</span>
              <span>₹{order.tax_amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between font-bold text-base text-neutral-900 dark:text-neutral-100">
              <span>Total Paid ({order.payment_method})</span>
              <span>₹{order.total_amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
