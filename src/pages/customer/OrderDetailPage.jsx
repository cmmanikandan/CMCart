import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  CreditCard,
  FileText,
  HelpCircle,
  XCircle,
  RotateCcw,
  Check,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { InvoiceModal } from '../../components/customer/InvoiceModal';
import { PaymentStatusBadge } from '../../components/ui/PaymentStatusBadge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    commerceDb.getOrderById(id).then((ord) => {
      setOrder(ord);
      setLoading(false);
    });
  }, [id]);

  const handleBuyAgain = (item) => {
    addToCart(
      {
        id: item.product_id || item.id,
        name: item.product_name,
        current_price: item.unit_price,
        images: [item.image]
      },
      item.variant,
      1
    );
    showToast(`Added ${item.product_name} back to cart!`, 'success');
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await commerceDb.updateOrderStatus(order.id, 'Cancelled');
      const updated = await commerceDb.getOrderById(order.id);
      setOrder(updated);
      showToast('Order cancelled successfully', 'info');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-neutral-500">
        Loading order details & shipment tracking...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <p className="text-xs text-neutral-500 mb-6">We could not locate this order in your account.</p>
        <Link to="/orders">
          <Button variant="primary" size="md">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  // Pure status milestones without wordy descriptions
  const milestones = [
    { title: 'Order Placed' },
    { title: 'Packed' },
    { title: 'Shipped' },
    { title: 'Out for Delivery' },
    { title: 'Delivered' }
  ];

  const currentIdx = milestones.findIndex((m) => m.title.toLowerCase() === order.status.toLowerCase());
  const activeStepIndex = order.status === 'Cancelled' ? -1 : currentIdx !== -1 ? currentIdx : 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 px-1">
      {/* Mobile-Friendly Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-[#E63946] hover:border-[#E63946] transition-colors cursor-pointer shadow-xs"
            aria-label="Back to orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
                Order #{order.order_number}
              </h1>
              <Badge
                variant={
                  order.status === 'Delivered'
                    ? 'success'
                    : order.status === 'Cancelled'
                    ? 'danger'
                    : 'primary'
                }
                size="sm"
              >
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Invoice Action Button - opens standalone A4 Invoice page */}
        <Button
          onClick={() => navigate(`/order/${order.id}/invoice`)}
          variant="outline"
          size="sm"
          icon={FileText}
          className="self-start sm:self-auto shrink-0"
        >
          <span>Tax Invoice</span>
        </Button>
      </div>

      {/* 1. Live Tracking Timeline Card: Perfectly aligned, NO descriptions */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-[#E63946] uppercase block">
                LIVE SHIPMENT TRACKING
              </span>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                {order.status === 'Delivered'
                  ? 'Delivered to your doorstep'
                  : order.status === 'Cancelled'
                  ? 'Order Cancelled'
                  : `Estimated Delivery: ${order.estimated_delivery || 'In 2-3 Business Days'}`}
              </h2>
            </div>
          </div>

          <div className="text-xs text-neutral-500 sm:text-right">
            <span className="block text-[11px] text-neutral-400">Tracking AWB</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {order.tracking_number} ({order.carrier || 'CMCart Logistics'})
            </span>
          </div>
        </div>

        {order.status !== 'Cancelled' ? (
          <div>
            {/* Desktop Horizontal Stepper (Clean & Aligned, No Descriptions) */}
            <div className="hidden md:flex items-center justify-between relative px-6 py-4">
              {/* Connected Background Line */}
              <div className="absolute left-10 right-10 top-8 h-1 bg-neutral-200 dark:bg-neutral-800 -z-0">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (Math.min(activeStepIndex, milestones.length - 1) / (milestones.length - 1)) * 100)}%`
                  }}
                />
              </div>

              {milestones.map((m, idx) => {
                const isCompleted = idx <= activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60 shadow-sm'
                          : 'bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs mt-2.5 font-bold whitespace-nowrap ${
                        isCurrent
                          ? 'text-[#E63946]'
                          : isCompleted
                          ? 'text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-400'
                      }`}
                    >
                      {m.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-black text-[#E63946] uppercase tracking-wider mt-0.5">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Stepper (No Descriptions) */}
            <div className="md:hidden relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800 py-1">
              {milestones.map((m, idx) => {
                const isCompleted = idx <= activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                return (
                  <div key={idx} className="relative flex items-center gap-3">
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isCurrent
                          ? 'text-[#E63946]'
                          : isCompleted
                          ? 'text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-400'
                      }`}
                    >
                      {m.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#E63946] bg-[#E63946]/10 px-2 py-0.5 rounded-full ml-auto">
                        In Progress
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
            <XCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
            <p>This order was cancelled. Any refund has been issued to the original payment source.</p>
          </div>
        )}
      </div>

      {/* 2. Destination Address & Payment Info Grid: Perfectly aligned 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        {/* Shipping Address */}
        <div className="bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              <MapPin className="w-4 h-4 text-[#E63946]" />
              <span>Delivery Address</span>
            </div>
            <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              {order.shipping_address?.full_name || 'Customer'}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-1">
              {order.shipping_address?.address_line}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
            </p>
          </div>
          <p className="text-xs text-neutral-500 font-medium pt-2 border-t border-neutral-100 dark:border-neutral-800">
            Contact Number: {order.shipping_address?.phone}
          </p>
        </div>

        {/* Payment Summary & Status */}
        <div className="bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#E63946]" />
                <span>Payment Status</span>
              </div>
              <PaymentStatusBadge
                status={order.payment_status === 'Completed' || order.cod_collected || !order.payment_method?.toLowerCase().includes('cash') ? 'PAID' : 'UNPAID'}
                method={order.payment_method}
                size="sm"
              />
            </div>

            {/* Gateway & Transaction badge */}
            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-xs space-y-1 mb-2.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Method:</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {order.payment_method || 'Online Payment'}
                </span>
              </div>
              {!order.payment_method?.toLowerCase().includes('cash') && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Transaction ID:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">
                    pay_rzp_{order.order_number?.replace(/\D/g, '') || '984120938'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-neutral-500">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  ₹{(order.subtotal || order.total_amount).toLocaleString('en-IN')}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span className="font-semibold text-[#16A34A]">
                  {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-sm font-black text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span>{!order.payment_method?.toLowerCase().includes('cash') ? 'Total Amount Paid:' : 'Total Payable Amount:'}</span>
            <span className="text-[#E63946]">₹{order.total_amount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 3. Package Contents / Items Ordered */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#E63946]" />
            <span>Items in this Order ({order.items?.length || 0})</span>
          </h3>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                to={`/product/${item.product_id || item.id}`}
                className="flex items-center gap-3.5 group flex-1 min-w-0 hover:opacity-90 transition-opacity"
              >
                <img
                  src={item.image}
                  alt={item.product_name}
                  className="w-16 h-16 rounded-xl object-cover bg-neutral-100 shrink-0 group-hover:scale-105 transition-transform border border-neutral-200 dark:border-neutral-800"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E63946] transition-colors truncate">
                    {item.product_name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Quantity: {item.quantity} {item.variant && item.variant !== 'Default' ? `• Variant: ${item.variant}` : ''}
                  </p>
                  <p className="text-xs font-black text-neutral-900 dark:text-neutral-100 mt-1">
                    ₹{((item.total || item.unit_price * item.quantity)).toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>

              <Button
                onClick={() => handleBuyAgain(item)}
                variant="outline"
                size="sm"
                icon={RotateCcw}
                className="self-start sm:self-center shrink-0 text-xs font-bold"
              >
                Buy Again
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Support and Cancel Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <Link
          to="/help"
          className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[#E63946] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#E63946]" />
          <span>Need help with this shipment? 24/7 Support Available</span>
        </Link>

        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
          <Button
            onClick={handleCancelOrder}
            variant="ghost"
            size="sm"
            className="text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold"
          >
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}
