import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Package,
  ShieldCheck,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commerceDb.getOrderById(id).then((ord) => {
      setOrder(ord);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-500">Loading tracking data...</div>;
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

  const milestones = [
    { title: 'Order Placed', desc: 'Order received and verified' },
    { title: 'Packed', desc: 'Item inspected and securely packed' },
    { title: 'Shipped', desc: `Handed over to carrier (${order.carrier || 'CMCart Logistics'})` },
    { title: 'Out for Delivery', desc: 'Courier out for doorstep delivery' },
    { title: 'Delivered', desc: 'Safe delivery with signature/OTP verification' }
  ];

  const currentIdx = milestones.findIndex((m) => m.title.toLowerCase() === order.status.toLowerCase());
  const activeStepIndex = currentIdx !== -1 ? currentIdx : 2; // Default to shipped if matched

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link to="/home" className="hover:text-[#E63946]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/orders" className="hover:text-[#E63946]">Orders</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          Tracking #{order.order_number}
        </span>
      </div>

      {/* Tracking Card Header */}
      <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#E63946] uppercase tracking-wider block mb-1">
            LIVE TRACKING
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
            {order.status === 'Delivered' ? 'Delivered' : `Arriving ${order.estimated_delivery || 'in 2 days'}`}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Tracking Number: <strong className="text-neutral-800 dark:text-neutral-200">{order.tracking_number}</strong> ({order.carrier || 'Express Logistics'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={order.status === 'Delivered' ? 'success' : 'primary'} size="md">
            {order.status}
          </Badge>
        </div>
      </div>

      {/* Visual Tracking Timeline (Requirement #20) */}
      <div className="bg-white dark:bg-[#181818] p-6 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Milestone Progression
        </h3>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
          {milestones.map((milestone, idx) => {
            const isCompleted = idx <= activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Node indicator */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#16A34A] text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  )}
                </div>

                {/* Milestone Description */}
                <div>
                  <h4 className={`text-xs sm:text-sm font-bold ${
                    isCompleted ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'
                  }`}>
                    {milestone.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{milestone.desc}</p>
                  {isCurrent && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-[#E63946] bg-[#E63946]/10 px-2 py-0.5 rounded">
                      Current Status
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Package & Destination Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Destination Address */}
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <MapPin className="w-4 h-4 text-[#E63946]" />
            <span>Delivery Address</span>
          </div>
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

        {/* Item Summary in Package */}
        <div className="bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <Package className="w-4 h-4 text-[#E63946]" />
            <span>Package Contents ({order.items?.length || 1})</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <img
                  src={item.image}
                  alt={item.product_name}
                  className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                />
                <div className="truncate flex-1">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{item.product_name}</p>
                  <p className="text-neutral-400">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <Link to={`/order/${order.id}`}>
          <Button variant="outline" size="sm">
            View Complete Order Details
          </Button>
        </Link>
        <Link to="/help">
          <Button variant="ghost" size="sm" icon={PhoneCall}>
            Need Help with this Delivery?
          </Button>
        </Link>
      </div>
    </div>
  );
}
