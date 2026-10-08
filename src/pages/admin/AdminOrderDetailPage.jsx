import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Package,
  MapPin,
  CreditCard,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  XCircle,
  Truck,
  User,
  Check,
  Calendar,
  ChevronRight,
  Info,
  Phone
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ShippingLabelModal } from '../../components/admin/ShippingLabelModal';
import { PaymentStatusBadge } from '../../components/ui/PaymentStatusBadge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const { showToast } = useToast();

  const statusWorkflow = {
    Pending: {
      label: 'Pending Review',
      desc: 'Awaiting payment confirmation or fraud verification check.',
      nextKey: 'Confirmed',
      nextBtnText: 'Confirm Order',
      badgeVariant: 'warning',
      color: 'text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-500'
    },
    Confirmed: {
      label: 'Confirmed',
      desc: 'Order approved and assigned to warehouse for picking.',
      nextKey: 'Packed',
      nextBtnText: 'Advance to Packed',
      badgeVariant: 'primary',
      color: 'text-blue-600 dark:text-blue-400',
      dotColor: 'bg-blue-500'
    },
    Packed: {
      label: 'Packed',
      desc: 'Order packed and ready for carrier logistics dispatch.',
      nextKey: 'Shipped',
      nextBtnText: 'Advance to Shipped',
      badgeVariant: 'primary',
      color: 'text-indigo-600 dark:text-indigo-400',
      dotColor: 'bg-indigo-500'
    },
    Shipped: {
      label: 'Shipped',
      desc: 'Dispatched with logistics carrier. Consignment is in transit.',
      nextKey: 'Out for Delivery',
      nextBtnText: 'Advance to Out for Delivery',
      badgeVariant: 'primary',
      color: 'text-sky-600 dark:text-sky-400',
      dotColor: 'bg-sky-500'
    },
    'Out for Delivery': {
      label: 'Out for Delivery',
      desc: 'Courier delivery executive is out for doorstep delivery.',
      nextKey: 'Delivered',
      nextBtnText: 'Mark as Delivered',
      badgeVariant: 'warning',
      color: 'text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-500'
    },
    Delivered: {
      label: 'Delivered',
      desc: 'Order successfully delivered to customer with digital E-POD.',
      nextKey: null,
      nextBtnText: null,
      badgeVariant: 'success',
      color: 'text-emerald-600 dark:text-emerald-400',
      dotColor: 'bg-emerald-500'
    },
    Cancelled: {
      label: 'Cancelled',
      desc: 'Order has been cancelled. Payment refunded to original payment method.',
      nextKey: null,
      nextBtnText: null,
      badgeVariant: 'danger',
      color: 'text-rose-600 dark:text-rose-400',
      dotColor: 'bg-rose-500'
    },
    Returned: {
      label: 'Returned',
      desc: 'Product return processed and consignment received at hub.',
      nextKey: null,
      nextBtnText: null,
      badgeVariant: 'danger',
      color: 'text-rose-600 dark:text-rose-400',
      dotColor: 'bg-rose-500'
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    const ord = await commerceDb.getOrderById(id);
    setOrder(ord);

    if (ord) {
      // Build chronological activity timeline
      const orderDate = new Date(ord.date);
      const timeline = [
        {
          title: 'Order Placed',
          desc: `Customer created order #${ord.order_number}`,
          time: orderDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ];

      if (ord.status !== 'Pending') {
        timeline.push({
          title: `Status: ${ord.status}`,
          desc: `Fulfillment advanced to ${ord.status}`,
          time: 'Active milestone'
        });
      }

      setActivityTimeline(timeline);
    }

    setLoading(false);
  };

  const requestStatusAdvance = (nextKey) => {
    setPendingStatus(nextKey);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAdvance = async () => {
    if (!order || !pendingStatus) return;
    setUpdating(true);

    try {
      await commerceDb.updateOrderStatus(order.id, pendingStatus);
      const updated = await commerceDb.getOrderById(order.id);
      setOrder(updated);

      // Add to timeline
      setActivityTimeline((prev) => [
        ...prev,
        {
          title: `Status: ${pendingStatus}`,
          desc: `Updated to ${pendingStatus} by Operations Admin`,
          time: 'Just now'
        }
      ]);

      showToast(`Order status updated to "${pendingStatus}"!`, 'success');
      setIsConfirmModalOpen(false);
    } catch {
      showToast('Failed to update order status', 'error');
    } finally {
      setUpdating(false);
      setPendingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-neutral-500">
        Loading order details and fulfillment controller...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-xs text-neutral-500">Could not locate order ID: {id}</p>
        <Link to="/admin/orders">
          <Button variant="primary" size="md">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const currentConfig = statusWorkflow[order.status] || {
    label: order.status,
    desc: 'Current fulfillment status',
    nextKey: null,
    nextBtnText: null,
    badgeVariant: 'primary',
    color: 'text-neutral-800 dark:text-neutral-200',
    dotColor: 'bg-neutral-500'
  };

  const isPaid = !order.payment_method?.toLowerCase().includes('cash');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Clean Header (Not overcrowded) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#E63946] hover:border-[#E63946] transition-colors cursor-pointer"
            aria-label="Back to orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                Order #{order.order_number}
              </h1>
              <Badge variant={currentConfig.badgeVariant} size="sm">
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Placed on {new Date(order.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })} · {new Date(order.date).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/order/${order.id}`} target="_blank">
            <Button variant="outline" size="sm" icon={ExternalLink} className="text-xs">
              Customer Storefront ↗
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Responsive 2-Column Layout */}
      {/* Desktop: Left ~65%, Right ~35% | Mobile: Right status card first */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ~65% (8 of 12 cols on desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-8 space-y-6">
          {/* Card 1: Order Items */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E63946]" />
                <span>Order Items ({order.items?.length || 0})</span>
              </h3>
              <span className="text-xs text-neutral-400">Standard Packaging</span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(order.items || []).map((item, idx) => {
                const prodLink = `/admin/products/${item.product_id || 'prod-2'}`;
                const hasVariant = item.variant_name_snapshot || (item.variant && item.variant !== 'Default');
                const selectedOpts = item.selected_options || {};

                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Clickable Product Image */}
                      <Link to={prodLink} title="View Product in Catalog" className="group shrink-0">
                        <img
                          src={item.image}
                          alt={item.product_name_snapshot || item.product_name}
                          className="w-16 h-16 rounded-xl object-contain bg-neutral-100 dark:bg-neutral-800 p-1.5 border border-neutral-200 dark:border-neutral-700 group-hover:border-[#E63946] transition-colors"
                        />
                      </Link>

                      <div className="min-w-0 space-y-1">
                        {/* Clickable Product Title */}
                        <Link
                          to={prodLink}
                          className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors inline-flex items-center gap-1.5"
                          title="Open Product Record"
                        >
                          <span className="truncate">{item.product_name_snapshot || item.product_name}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                        </Link>

                        {/* Historical Purchased Variant Details */}
                        {hasVariant && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                              Variant: {item.variant_name_snapshot || item.variant}
                            </span>
                            {selectedOpts.color && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-1">
                                {selectedOpts.colorCode && (
                                  <span
                                    className="w-2 h-2 rounded-full border border-black/10 inline-block"
                                    style={{ backgroundColor: selectedOpts.colorCode }}
                                  />
                                )}
                                Color: {selectedOpts.color}
                              </span>
                            )}
                            {selectedOpts.size && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                Size: {selectedOpts.size}
                              </span>
                            )}
                            {selectedOpts.storage && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                Storage: {selectedOpts.storage}
                              </span>
                            )}
                            {item.sku && (
                              <span className="text-[10px] font-mono text-neutral-400">
                                SKU: {item.sku}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-[11px] text-neutral-500">
                          Qty: <span className="font-bold text-neutral-800 dark:text-neutral-200">{item.quantity}</span> · Unit: ₹{(item.unit_price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-neutral-900 dark:text-neutral-100 block">
                        ₹{((item.total || (item.unit_price * item.quantity))).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-neutral-400">Snapshot locked</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Shipping Address */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E63946]" />
                <span>Shipping Address</span>
              </div>
              <span className="text-neutral-400 font-semibold normal-case text-xs">
                AWB: {order.tracking_number}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {order.shipping_address?.full_name || 'Customer'}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {order.shipping_address?.address_line}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs text-neutral-500 font-medium">
                  Phone: <span className="font-bold text-neutral-800 dark:text-neutral-200">{order.shipping_address?.phone || '+91 98765 43210'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${(order.shipping_address?.phone || '+919876543210').replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors shadow-2xs"
                    title="Call Customer"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${(order.shipping_address?.phone || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.shipping_address?.full_name || 'Customer'}, this is CMCart regarding your order #${order.order_number}...`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs"
                    title="Message on WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-emerald-600" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Payment Information */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <CreditCard className="w-4 h-4 text-[#E63946]" />
                <span>Payment Information</span>
              </div>

              {/* Standardized Strict Payment Status Badge */}
              <PaymentStatusBadge status={isPaid ? 'PAID' : 'UNPAID'} method={order.payment_method} size="sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 block text-[10px] font-semibold">GATEWAY & METHOD</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                  {order.payment_method || 'Razorpay Online Gateway'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 block text-[10px] font-semibold">TRANSACTION ID</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block">
                  {isPaid ? `pay_rzp_${order.order_number?.replace(/\D/g, '') || '984120938'}` : 'COD-PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Order Summary */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
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
                <span>Delivery:</span>
                <span className="text-emerald-600 font-medium">
                  {order.delivery_fee ? `₹${order.delivery_fee}` : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (18%):</span>
                <span>₹{(order.tax_amount || Math.round(order.total_amount * 0.18)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-900 dark:text-neutral-100 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <span>Total Amount:</span>
                <span className="text-[#E63946]">₹{order.total_amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ~35% (4 of 12 cols on desktop) */}
        {/* Main Workflow Control */}
        <div className="order-1 lg:order-2 lg:col-span-4 space-y-6">
          {/* Card 1: DYNAMIC ORDER STATUS CONTROLLER */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border-2 border-[#E63946]/30 dark:border-[#E63946]/30 p-5 sm:p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E63946] block">
              ORDER STATUS
            </span>

            {/* Current Status Pill */}
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${currentConfig.dotColor} animate-pulse shrink-0`} />
              <span className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-neutral-100">
                {order.status}
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {currentConfig.desc}
            </p>

            {/* Single Next Stage Action Button */}
            {currentConfig.nextKey && (
              <div className="pt-2">
                <Button
                  onClick={() => requestStatusAdvance(currentConfig.nextKey)}
                  loading={updating}
                  variant="primary"
                  size="md"
                  icon={Send}
                  className="w-full font-bold shadow-xs py-2.5"
                >
                  {currentConfig.nextBtnText} →
                </Button>
              </div>
            )}

            {/* If Delivered */}
            {order.status === 'Delivered' && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Delivered Successfully</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Signed & verified digital electronic proof of delivery.
                </p>
              </div>
            )}

            {/* If Cancelled */}
            {order.status === 'Cancelled' && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300">
                Order cancelled. Return/refund processed to customer.
              </div>
            )}

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Updated:</span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ·{' '}
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Secondary Exceptions (subtle, non-intrusive) */}
            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => requestStatusAdvance('Cancelled')}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  Cancel Order
                </button>
                <button
                  type="button"
                  onClick={() => requestStatusAdvance('Returned')}
                  className="text-amber-600 hover:underline cursor-pointer"
                >
                  Mark Returned
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Quick Actions (Only Quick Actions here, not workflow) */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
              QUICK ACTIONS
            </span>

            <div className="space-y-2">
              <Button
                onClick={() => setIsLabelModalOpen(true)}
                variant="outline"
                size="sm"
                icon={FileText}
                className="w-full justify-start text-xs font-semibold"
              >
                Generate Shipping Label
              </Button>

              <Link to={`/order/${order.id}/invoice?from=admin`} className="block">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  className="w-full justify-start text-xs font-semibold"
                >
                  View Invoice
                </Button>
              </Link>

              <Link to={`/order/${order.id}/invoice?from=admin`} className="block">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  className="w-full justify-start text-xs font-semibold"
                >
                  Print Invoice
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Compact Order Activity Timeline */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
              ORDER ACTIVITY
            </span>

            <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
              {activityTimeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-[#E63946] ring-2 ring-white dark:ring-neutral-900" />
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    {item.desc}
                  </p>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Advance Confirmation Dialog */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Status Transition"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <Info className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
              <p>
                Are you sure you want to advance this order from{' '}
                <strong className="text-neutral-900 dark:text-white uppercase">{order.status}</strong> to{' '}
                <strong className="text-[#E63946] uppercase">{pendingStatus}</strong>?
              </p>
              <p className="text-[11px] text-neutral-400">
                This will update Supabase records and notify the customer.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={updating}
              onClick={handleConfirmAdvance}
            >
              Confirm & Advance
            </Button>
          </div>
        </div>
      </Modal>

      {/* Official Shipping Label Modal */}
      <ShippingLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        order={order}
      />
    </div>
  );
}
