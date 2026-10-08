import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Printer,
  Download,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const fromAdmin = new URLSearchParams(location.search).get('from') === 'admin' || location.state?.from === 'admin';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Zoom control state: default responsive zoom based on screen width
  const [zoom, setZoom] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 0.52; // Mobile fit for standard A4
    } else if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 0.78;
    }
    return 1;
  });

  const invoiceSheetRef = useRef(null);

  useEffect(() => {
    commerceDb.getOrderById(id).then((ord) => {
      if (ord) {
        const isOwner = !ord.user_id || ord.user_id === user?.uid || (ord.user_email && ord.user_email.toLowerCase() === user?.email?.toLowerCase());
        if (!isAdmin && !fromAdmin && !isOwner) {
          setOrder(null);
        } else {
          setOrder(ord);
        }
      } else {
        setOrder(null);
      }
      setLoading(false);
    });
  }, [id, user, isAdmin, fromAdmin]);

  // Adjust zoom on resize if on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && zoom > 0.6) {
        setZoom(0.52);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [zoom]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.6, +(prev + 0.1).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.35, +(prev - 0.1).toFixed(2)));
  };

  // Reset or Fit to Screen (*)
  const handleFitZoom = () => {
    if (window.innerWidth < 640) {
      setZoom(0.52);
    } else if (window.innerWidth < 1024) {
      setZoom(0.78);
    } else {
      setZoom(1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    if (!order) return;
    const content = `
============================================================
              CMCart OFFICIAL TAX INVOICE
============================================================
Invoice Number: INV-${order.order_number}
Date: ${new Date(order.date).toLocaleDateString('en-IN')}
Order ID: #${order.order_number}
Status: ${order.status}
Payment Method: ${order.payment_method}
Payment Status: ${order.payment_status || 'Verified & Completed'}

BILLED TO & SHIPPED TO:
Recipient: ${order.shipping_address?.full_name || 'Customer'}
Address: ${order.shipping_address?.address_line || ''}
City/State/Pin: ${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} - ${order.shipping_address?.pincode || ''}
Phone: ${order.shipping_address?.phone || ''}

LOGISTICS:
Tracking ID: ${order.tracking_number || 'N/A'}
Carrier: ${order.carrier || 'CMCart Logistics'}

ITEMIZED PARTICULARS:
${(order.items || []).map((it, idx) => `${idx + 1}. ${it.product_name} | Qty: ${it.quantity} | Rate: ₹${it.unit_price} | Total: ₹${it.total || it.unit_price * it.quantity}`).join('\n')}

------------------------------------------------------------
Items Subtotal:   ₹${(order.subtotal || order.total_amount).toLocaleString('en-IN')}
Discount Applied: -₹${(order.discount_amount || 0).toLocaleString('en-IN')}
Delivery Fee:     ₹${(order.delivery_fee || 0).toLocaleString('en-IN')}
Integrated GST (18%): ₹${(order.tax_amount || 0).toLocaleString('en-IN')}
TOTAL INVOICE AMOUNT: ₹${(order.total_amount || 0).toLocaleString('en-IN')}
------------------------------------------------------------
GSTIN: 29AABCC1234F1Z8 • State Code: 29 (Karnataka)
Authorized Signatory: CMCart Retail Private Ltd.
============================================================
`.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CMCart-TaxInvoice-${order.order_number}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-neutral-500">
        Loading official tax invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <p className="text-xs text-neutral-500">No order data available for this document.</p>
        <Button onClick={() => fromAdmin ? navigate('/admin/orders') : navigate('/orders')} variant="primary" size="md">
          {fromAdmin ? 'Back to Admin Orders' : 'Back to Orders'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Top Floating Action & Zoom Controls Bar (Hidden during print) */}
      <div className="sticky top-20 z-30 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-3 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden">
        
        {/* Left: Back & Document Meta */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fromAdmin ? navigate(`/admin/orders/${order.id}`) : navigate(`/order/${order.id}`)}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:text-[#E63946] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title={fromAdmin ? 'Back to Admin Order' : 'Back to Order'}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{fromAdmin ? 'Back to Admin' : 'Back to Order'}</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                Tax Invoice
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                A4 Document
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">INV-{order.order_number}</p>
          </div>
        </div>

        {/* Center: Zoom Controls (+, -, * / Fit) */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer text-base"
            title="Zoom Out (-)"
          >
            -
          </button>

          <button
            type="button"
            onClick={handleFitZoom}
            className="px-2.5 h-8 rounded-lg flex items-center justify-center gap-1 text-xs font-black text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Reset / Fit to Screen (*)"
          >
            <span>*</span>
            <span className="text-[10px] uppercase font-bold hidden sm:inline">Fit</span>
            <span className="text-[10px] text-neutral-400 font-mono">({Math.round(zoom * 100)}%)</span>
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer text-base"
            title="Zoom In (+)"
          >
            +
          </button>
        </div>

        {/* Right: Export & Print Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            onClick={handleDownloadText}
            variant="outline"
            size="sm"
            icon={Download}
            className="text-xs"
          >
            <span className="hidden sm:inline">Download TXT</span>
            <span className="sm:hidden">Download</span>
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            variant="primary"
            size="sm"
            icon={Printer}
            className="text-xs shadow-sm"
          >
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* A4 Paper Canvas Container */}
      <div className="overflow-x-auto flex justify-center py-2 sm:py-6 bg-neutral-100/60 dark:bg-[#121212]/60 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 min-h-[700px] print:bg-white print:p-0 print:border-none print:min-h-0">
        
        {/* Scaled A4 Sheet Wrapper */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="print:transform-none"
        >
          {/* THE REAL A4 SHEET (210mm wide on standard desktop, printable page) */}
          <div
            ref={invoiceSheetRef}
            id="a4-invoice-sheet"
            className="w-[210mm] min-h-[297mm] bg-white text-neutral-900 p-8 sm:p-12 shadow-2xl rounded-sm border border-neutral-300 relative flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:w-full print:m-0"
          >
            
            {/* Top Header */}
            <div>
              <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-2xl font-black tracking-tight text-[#E63946]">CM</span>
                    <span className="text-2xl font-black tracking-tight text-neutral-900">Cart</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-800">CMCart Commerce India Private Limited</p>
                  <p className="text-[11px] text-neutral-600">CIN: U51909KA2024PTC123456 • GSTIN: 29AABCC1234F1Z8</p>
                  <p className="text-[11px] text-neutral-600">Tech Park Campus, Outer Ring Road, Bengaluru - 560038</p>
                  <p className="text-[11px] text-neutral-600">State: Karnataka, State Code: 29</p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-neutral-900 text-white font-black text-xs px-3 py-1 rounded uppercase tracking-wider mb-2">
                    TAX INVOICE
                  </div>
                  <p className="text-xs font-bold text-neutral-900">Invoice No: INV-{order.order_number}</p>
                  <p className="text-[11px] text-neutral-600">
                    Invoice Date: {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-[11px] text-neutral-600">Order ID: #{order.order_number}</p>
                  <p className={`text-[11px] font-black mt-1 ${
                    order.payment_status === 'Completed' || order.cod_collected || !order.payment_method?.toLowerCase().includes('cash')
                      ? 'text-emerald-700'
                      : 'text-[#DC2626]'
                  }`}>
                    Payment: {order.payment_method} ({
                      order.payment_status === 'Completed' || order.cod_collected || !order.payment_method?.toLowerCase().includes('cash')
                        ? '✓ PAID'
                        : '● UNPAID'
                    })
                  </p>
                </div>
              </div>

              {/* Billed To / Shipped To Grid */}
              <div className="grid grid-cols-2 gap-6 py-4 border-b border-neutral-200 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block mb-1">
                    Billed To & Shipped To:
                  </span>
                  <p className="font-bold text-neutral-900 text-sm">
                    {order.shipping_address?.full_name || 'Valued Customer'}
                  </p>
                  <p className="text-neutral-700 mt-0.5 leading-relaxed">
                    {order.shipping_address?.address_line}
                  </p>
                  <p className="text-neutral-700">
                    {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                  </p>
                  <p className="text-neutral-700 font-semibold mt-1">
                    Phone: {order.shipping_address?.phone || 'N/A'}
                  </p>
                  <p className="text-neutral-500 text-[11px]">Country: India</p>
                </div>

                <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block mb-1">
                    Order & Dispatch Details:
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Waybill / Tracking:</span>
                      <span className="font-bold text-neutral-900">{order.tracking_number || 'TRK-20268491'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Logistics Carrier:</span>
                      <span className="font-semibold text-neutral-900">{order.carrier || 'CMCart Logistics Express'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Delivery Mode:</span>
                      <span className="font-semibold text-neutral-900">Doorstep Standard</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Place of Supply:</span>
                      <span className="font-semibold text-neutral-900">{order.shipping_address?.state || 'Karnataka'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Goods Table */}
              <div className="py-4">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 border-y border-neutral-300 text-[10px] uppercase font-black text-neutral-700">
                      <th className="py-2.5 px-2 text-center w-10">#</th>
                      <th className="py-2.5 px-2">Description of Goods</th>
                      <th className="py-2.5 px-2 text-center">HSN/SAC</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-2 text-right">Unit Price</th>
                      <th className="py-2.5 px-2 text-right">Taxable</th>
                      <th className="py-2.5 px-2 text-right">IGST (18%)</th>
                      <th className="py-2.5 px-2 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {(order.items || []).map((it, idx) => {
                      const itemTotal = it.total || it.unit_price * it.quantity;
                      const taxable = Math.round(itemTotal / 1.18);
                      const tax = itemTotal - taxable;

                      return (
                        <tr key={idx} className="hover:bg-neutral-50/50">
                          <td className="py-3 px-2 text-center text-neutral-500 font-bold">{idx + 1}</td>
                          <td className="py-3 px-2">
                            <p className="font-bold text-neutral-900">{it.product_name}</p>
                            {it.variant && it.variant !== 'Default' && (
                              <p className="text-[10px] text-neutral-500">Variant: {it.variant}</p>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center text-neutral-600 font-mono text-[11px]">851830</td>
                          <td className="py-3 px-2 text-center font-bold text-neutral-900">{it.quantity}</td>
                          <td className="py-3 px-2 text-right text-neutral-800">₹{it.unit_price?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-2 text-right text-neutral-800">₹{taxable.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-2 text-right text-neutral-800">₹{tax.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-2 text-right font-black text-neutral-900">₹{itemTotal.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Financials & Tax Breakup */}
            <div className="pt-4 border-t-2 border-neutral-900 space-y-6">
              <div className="flex justify-between items-start gap-6">
                
                {/* Bank / Declaration Left Box */}
                <div className="flex-1 space-y-3 text-[11px] text-neutral-600">
                  <div className="bg-neutral-50 p-3 rounded border border-neutral-200">
                    <span className="font-bold uppercase text-[10px] text-neutral-700 block mb-1">
                      Declaration & Terms
                    </span>
                    <p className="leading-relaxed">
                      We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Goods once sold are covered under CMCart 7-Day Replacement Policy.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-800 block">Bank Details for Wire Transfers:</span>
                    <p>Bank: HDFC Bank Ltd • A/C No: 50200012345678 • IFSC: HDFC0000128</p>
                  </div>
                </div>

                {/* Right Amount Calculations */}
                <div className="w-72 space-y-1.5 text-xs text-neutral-800">
                  <div className="flex justify-between">
                    <span>Subtotal (Taxable Value):</span>
                    <span className="font-semibold">₹{(order.subtotal || order.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount (Coupons/Deals):</span>
                      <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery & Logistics:</span>
                    <span>{order.delivery_fee ? `₹${order.delivery_fee}` : 'FREE (Express)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGST @ 18%:</span>
                    <span>₹{(order.tax_amount || Math.round(order.total_amount * 0.18)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-neutral-900 text-sm font-black text-neutral-900">
                    <span>Total Invoice Amount:</span>
                    <span className="text-[#E63946] text-base">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Signatory Footer */}
              <div className="flex items-end justify-between pt-4 border-t border-neutral-200 text-xs">
                <div>
                  <p className="text-[11px] text-neutral-500">
                    Whether tax is payable on reverse charge basis: <strong>NO</strong>
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    This is an electronically generated legal invoice generated via CMCart Platform.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-36 h-12 flex items-center justify-center border border-dashed border-neutral-300 rounded mb-1 text-[10px] font-mono text-neutral-400">
                    [DIGITALLY SIGNED]
                  </div>
                  <span className="font-bold text-[11px] text-neutral-900 block">
                    For CMCart Retail India Pvt Ltd
                  </span>
                  <span className="text-[10px] text-neutral-500">Authorised Signatory</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
