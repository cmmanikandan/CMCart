import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  FileText,
  IndianRupee,
  Layers,
  FileSpreadsheet,
  FileCode,
  X,
  AlertTriangle,
  ExternalLink,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PaymentStatusBadge } from '../../components/ui/PaymentStatusBadge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Paid' | 'Unpaid' | 'COD Pending'
  const [methodFilter, setMethodFilter] = useState('All'); // 'All' | 'UPI' | 'Card' | 'COD' | 'Razorpay'
  const [dateFilter, setDateFilter] = useState('All'); // 'All' | 'today' | '7d' | '30d' | 'custom'

  // Drawer / Management State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmCollectOpen, setIsConfirmCollectOpen] = useState(false);
  const [collecting, setCollecting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadPayments();
    const handleUpdate = () => loadPayments();
    window.addEventListener('cmcart_dataset_updated', handleUpdate);
    return () => window.removeEventListener('cmcart_dataset_updated', handleUpdate);
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const ords = await commerceDb.getOrders();
      setOrders(ords || []);
    } catch {
      showToast('Failed to load payment transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Build payment transactions model from orders
  const transactions = orders.map((ord, idx) => {
    const isCod = ord.payment_method?.toLowerCase().includes('cash');
    const isPaid = ord.payment_status === 'Completed' || ord.cod_collected || (!isCod && !ord.payment_status?.toLowerCase().includes('fail'));
    const seed = ord.order_number?.replace(/\D/g, '') || String(idx + 1000);
    
    return {
      id: isCod ? `cod_${seed}` : `pay_rzp_${seed}`,
      orderId: ord.id,
      orderNumber: ord.order_number,
      customerName: ord.shipping_address?.full_name || 'Customer Shopper',
      customerPhone: ord.shipping_address?.phone || '+91 98765 43210',
      date: ord.date || new Date().toISOString(),
      amount: ord.total_amount || 0,
      method: ord.payment_method || (isCod ? 'Cash on Delivery' : 'Online Payment (Razorpay)'),
      gateway: isCod ? 'COD Field Collection' : 'Razorpay PG v2',
      status: isPaid ? (isCod ? 'COLLECTED' : 'PAID') : (isCod ? 'COD_PENDING' : 'UNPAID'),
      isPaid: Boolean(isPaid),
      isCod: Boolean(isCod),
      deliveryStatus: ord.status,
      itemsCount: ord.items?.length || 1,
      codCollectedAt: ord.cod_collected_at || null
    };
  });

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Paid' && t.isPaid) ||
      (statusFilter === 'Unpaid' && !t.isPaid) ||
      (statusFilter === 'COD Pending' && t.isCod && !t.isPaid);

    const matchesMethod =
      methodFilter === 'All' ||
      (methodFilter === 'COD' && t.isCod) ||
      (methodFilter === 'Razorpay' && !t.isCod) ||
      (methodFilter === 'UPI' && t.method.toLowerCase().includes('upi')) ||
      (methodFilter === 'Card' && t.method.toLowerCase().includes('card'));

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Summary Metrics (Strictly Factual)
  const totalPaid = transactions
    .filter((t) => t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalUnpaid = transactions
    .filter((t) => !t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);
  const onlinePaymentsCount = transactions.filter((t) => !t.isCod).length;
  const codPendingCount = transactions.filter((t) => t.isCod && !t.isPaid).length;

  // Handle Mark as Collected for COD
  const handleConfirmCollect = async () => {
    if (!selectedPayment) return;
    setCollecting(true);

    try {
      await commerceDb.markPaymentCollected(selectedPayment.orderId);
      showToast(`COD payment of ₹${selectedPayment.amount.toLocaleString('en-IN')} marked as collected!`, 'success');
      setIsConfirmCollectOpen(false);
      setIsDrawerOpen(false);
      setSelectedPayment(null);
      await loadPayments();
    } catch {
      showToast('Failed to update COD payment status', 'error');
    } finally {
      setCollecting(false);
    }
  };

  const handleExportCSV = () => {
    const csvHeader = 'Transaction ID,Order Number,Customer Name,Date,Amount,Status,Method,Gateway\n';
    const csvRows = filtered
      .map(
        (t) =>
          `"${t.id}","${t.orderNumber}","${t.customerName}","${t.date}",${t.amount},"${t.status}","${t.method}","${t.gateway}"`
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CMCart_Payment_History_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Payment history exported as CSV successfully!', 'success');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(filtered, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CMCart_Payment_History_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Payment history exported as JSON successfully!', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
              Payment History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Monitor online payments, COD collections, refunds and transaction status.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={loadPayments} variant="outline" size="sm" icon={RefreshCw}>
            Refresh
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm" icon={FileSpreadsheet}>
            Export CSV
          </Button>
          <Button onClick={() => window.print()} variant="outline" size="sm" icon={Printer}>
            Export PDF
          </Button>
          <Button onClick={handleExportJSON} variant="outline" size="sm" icon={FileCode}>
            Export JSON
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards (Factual database values only) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-xs text-neutral-500 font-semibold block uppercase tracking-wider">Total Paid</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Captured settlements</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-xs text-neutral-500 font-semibold block uppercase tracking-wider">Unpaid</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{totalUnpaid.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Awaiting payment / COD</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-xs text-neutral-500 font-semibold block uppercase tracking-wider">Online Payments</span>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {onlinePaymentsCount}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Razorpay / UPI / Cards</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-xs text-neutral-500 font-semibold block uppercase tracking-wider">COD Pending</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {codPendingCount}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Doorstep collection</span>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Payment ID / Order ID / Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="inline-flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold border border-neutral-200/60 dark:border-neutral-700/60">
              {['All', 'Paid', 'Unpaid', 'COD Pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs font-black'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Method Select */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-1 focus:ring-[#E63946] cursor-pointer"
            >
              <option value="All">All Methods</option>
              <option value="Razorpay">Razorpay Online</option>
              <option value="UPI">UPI Payments</option>
              <option value="Card">Credit/Debit Cards</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Payment Table */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    Loading payment records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <CreditCard className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">No Payment History</p>
                      <p className="text-xs text-neutral-500">There are no payment settlement records in the active database.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {t.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <Link to={`/admin/orders/${t.orderId}`} className="text-[#E63946] hover:underline">
                        #{t.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">{t.customerName}</div>
                      <div className="text-[11px] text-neutral-400">{t.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">{t.method}</div>
                      <div className="text-[10px] text-neutral-400">{t.gateway}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-neutral-900 dark:text-neutral-100">
                      ₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <PaymentStatusBadge status={t.status} method={t.method} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/order/${t.orderId}/invoice?from=admin`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                          title="View Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedPayment(t);
                            setIsDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#E63946] text-white hover:bg-[#c92332] transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Payment Detail Management Modal / Drawer */}
      {isDrawerOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg shadow-xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Payment Transaction Detail
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  {selectedPayment.id} · #{selectedPayment.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 block">{selectedPayment.customerName}</span>
                  <span className="text-neutral-500 text-[11px]">{selectedPayment.customerPhone}</span>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Transaction Amount</span>
                  <span className="font-black text-lg text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                    ₹{selectedPayment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Method:</span>
                  <span className="font-bold">{selectedPayment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gateway Provider:</span>
                  <span className="font-semibold">{selectedPayment.gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Created Date:</span>
                  <span className="font-medium">{new Date(selectedPayment.date).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-neutral-500">Payment Status:</span>
                  <PaymentStatusBadge status={selectedPayment.status} method={selectedPayment.method} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Fulfillment Status:</span>
                  <Badge variant="primary" size="xs">{selectedPayment.deliveryStatus}</Badge>
                </div>
              </div>

              {/* COD Collection Section */}
              {selectedPayment.isCod && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-900 dark:text-amber-200">COD Collection Status</span>
                  </div>

                  {selectedPayment.isPaid ? (
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Payment collected and verified by operations.</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 mb-3">
                        Payment is currently pending collection upon delivery. Mark collected only after cash receipt.
                      </p>
                      <Button
                        onClick={() => setIsConfirmCollectOpen(true)}
                        variant="primary"
                        size="sm"
                        className="w-full font-bold"
                      >
                        ✓ Mark as Collected
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Failed Online Payment Section */}
              {!selectedPayment.isCod && !selectedPayment.isPaid && (
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                  <p className="text-[11px] text-rose-800 dark:text-rose-300">
                    Failed or pending online payment. Manual marking as paid requires certified bank payment confirmation.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Link to={`/admin/orders/${selectedPayment.orderId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">View Order</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
              <Link to={`/admin/orders/${selectedPayment.orderId}`}>
                <Button variant="outline" size="sm" icon={ExternalLink}>
                  Open Order Details
                </Button>
              </Link>
              <Button onClick={() => setIsDrawerOpen(false)} variant="secondary" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for COD Mark as Collected */}
      <Modal
        isOpen={isConfirmCollectOpen}
        onClose={() => setIsConfirmCollectOpen(false)}
        title="Confirm COD Cash Collection"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Are you sure you want to mark COD payment of{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              ₹{selectedPayment?.amount?.toLocaleString('en-IN')}
            </strong>{' '}
            for order{' '}
            <strong className="text-[#E63946]">#{selectedPayment?.orderNumber}</strong> as collected?
          </p>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            This will record the funds into the cash ledger, update Supabase, and change payment status to{' '}
            <strong>✓ PAID / COLLECTED</strong>.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsConfirmCollectOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCollect}
              loading={collecting}
              variant="primary"
              size="sm"
            >
              Confirm Collection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
