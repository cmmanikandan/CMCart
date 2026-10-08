import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function InvoiceModal({ isOpen, onClose, order }) {
  const invoiceRef = useRef(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const content = `
==================================================
           CMCart OFFICIAL TAX INVOICE
==================================================
Invoice No: INV-${order.order_number}
Order Date: ${new Date(order.date).toLocaleDateString('en-IN')}
Status: ${order.status}
Payment Method: ${order.payment_method} (${order.payment_status || 'Paid'})

BILL TO / SHIP TO:
Recipient: ${order.shipping_address?.full_name || 'Customer'}
Address: ${order.shipping_address?.address_line || ''}, ${order.shipping_address?.city || ''} - ${order.shipping_address?.pincode || ''}
Contact: ${order.shipping_address?.phone || ''}

ITEMS:
${(order.items || []).map((it, idx) => `${idx + 1}. ${it.product_name} | Qty: ${it.quantity} | Rate: ₹${it.unit_price} | Total: ₹${it.total || it.unit_price * it.quantity}`).join('\n')}

--------------------------------------------------
Subtotal: ₹${(order.subtotal || order.total_amount).toLocaleString('en-IN')}
Discount: -₹${(order.discount_amount || 0).toLocaleString('en-IN')}
Delivery Fee: ₹${(order.delivery_fee || 0).toLocaleString('en-IN')}
GST (18% included): ₹${(order.tax_amount || 0).toLocaleString('en-IN')}
TOTAL PAID: ₹${(order.total_amount || 0).toLocaleString('en-IN')}
--------------------------------------------------
GSTIN: 29AABCC1234F1Z8
Authorised Signatory: CMCart Retail Private Ltd.
==================================================
`.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CMCart-Invoice-${order.order_number}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Tax Invoice" maxWidth="max-w-2xl">
      <div className="space-y-5 text-xs sm:text-sm">
        {/* Printable Invoice Container */}
        <div
          ref={invoiceRef}
          id="printable-invoice"
          className="bg-white text-neutral-900 p-4 sm:p-7 rounded-xl sm:rounded-2xl border border-neutral-200 shadow-xs space-y-5 print:p-0 print:border-none print:shadow-none"
        >
          {/* Header (Responsive on mobile & desktop) */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-neutral-200 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xl font-black tracking-tight text-[#E63946]">CM</span>
                <span className="text-xl font-black tracking-tight text-neutral-900">Cart</span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">CMCart Commerce India Private Limited</p>
              <p className="text-[11px] text-neutral-500">GSTIN: 29AABCC1234F1Z8 • PAN: AABCC1234F</p>
              <p className="text-[11px] text-neutral-500">Bengaluru, Karnataka - 560038</p>
            </div>

            <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
              <span className="inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-neutral-100 text-neutral-800 tracking-wider mb-1">
                TAX INVOICE
              </span>
              <p className="font-bold text-xs text-neutral-900">Invoice: INV-{order.order_number}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Date: {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center sm:justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid ({order.payment_method})</span>
              </p>
            </div>
          </div>

          {/* Customer / Billing details (1 col on mobile, 2 col on sm) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200/60">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-neutral-900">{order.shipping_address?.full_name || 'Customer'}</p>
              <p className="text-neutral-600 mt-0.5 leading-relaxed">{order.shipping_address?.address_line}</p>
              <p className="text-neutral-600">{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
              <p className="text-neutral-500 mt-1 font-medium">Contact: {order.shipping_address?.phone}</p>
            </div>

            <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Shipment Reference:
              </span>
              <p className="font-semibold text-neutral-900">Order ID: #{order.order_number}</p>
              <p className="text-neutral-500 text-[11px] mt-0.5">Tracking No: {order.tracking_number || 'TRK-20268491'}</p>
              <p className="text-neutral-500 text-[11px]">Carrier: {order.carrier || 'CMCart Express Logistics'}</p>
              <p className="text-neutral-500 text-[11px]">Delivery: Verified Standard Express</p>
            </div>
          </div>

          {/* Itemized Table (with smooth mobile horizontal scroll) */}
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-xs text-left min-w-[380px]">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 text-[11px] uppercase font-bold">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} className="text-neutral-800">
                    <td className="py-2.5 pr-2">
                      <p className="font-bold text-neutral-900">{item.product_name}</p>
                      {item.variant && item.variant !== 'Default' && (
                        <p className="text-[10px] text-neutral-400">Variant: {item.variant}</p>
                      )}
                    </td>
                    <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
                    <td className="py-2.5 text-right font-medium">₹{item.unit_price?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-bold text-neutral-900">
                      ₹{((item.total || item.unit_price * item.quantity)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Amount Breakdown */}
          <div className="border-t border-neutral-200 pt-3.5 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₹{(order.subtotal || order.total_amount).toLocaleString('en-IN')}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Charges</span>
                <span>{order.delivery_fee ? `₹${order.delivery_fee}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Integrated GST (18% included)</span>
                <span>₹{(order.tax_amount || Math.round(order.total_amount * 0.18)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-black text-neutral-900">
                <span>Grand Total</span>
                <span className="text-[#E63946]">₹{order.total_amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-neutral-100 pt-3 text-[10px] text-neutral-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <p>Computer-generated tax invoice. No physical signature required.</p>
            <span className="font-semibold text-neutral-600">Authorized by CMCart India Retail</span>
          </div>
        </div>

        {/* Action Buttons: Responsive row / column */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
          <Button onClick={onClose} variant="ghost" size="sm" className="order-3 sm:order-1">
            Close
          </Button>
          <Button onClick={handleDownloadText} variant="outline" size="sm" icon={Download} className="order-2">
            Download Text Invoice
          </Button>
          <Button onClick={handlePrint} variant="primary" size="sm" icon={Printer} className="order-1 sm:order-3">
            Print / Save PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
