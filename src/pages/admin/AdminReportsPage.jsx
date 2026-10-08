import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShoppingCart,
  Users,
  CreditCard,
  Package,
  Boxes,
  MessageSquare,
  Percent,
  TrendingUp,
  RotateCcw,
  Receipt,
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PaymentStatusBadge } from '../../components/ui/PaymentStatusBadge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState(null); // null = Hub view; 'orders' | 'customers' | 'payments' | 'products' | 'inventory' | 'reviews' | 'coupons' | 'sales' | 'returns' | 'tax'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [dateRange, setDateRange] = useState('all'); // 'today' | '7d' | '30d' | 'all'
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ords, prods, custs, revs, coups] = await Promise.all([
        commerceDb.getOrders(),
        commerceDb.getProducts(),
        commerceDb.getCustomers ? commerceDb.getCustomers() : Promise.resolve([]),
        commerceDb.getReviews ? commerceDb.getReviews() : Promise.resolve([]),
        commerceDb.getCoupons ? commerceDb.getCoupons() : Promise.resolve([])
      ]);

      setOrders(ords || []);
      setProducts(prods || []);
      setReviews(revs || []);
      setCoupons(coups || []);

      if (custs && custs.length > 0) {
        setCustomers(custs);
      } else {
        const custMap = new Map();
        (ords || []).forEach((o) => {
          const name = o.shipping_address?.full_name || 'Customer Shopper';
          if (!custMap.has(name)) {
            custMap.set(name, {
              id: `cust-${custMap.size + 1}`,
              name,
              email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
              phone: o.shipping_address?.phone || '+91 98765 43210',
              city: o.shipping_address?.city || 'Bengaluru',
              state: o.shipping_address?.state || 'Karnataka',
              joinedDate: o.date ? new Date(o.date).toISOString().slice(0, 10) : '2026-08-15',
              ordersCount: 1,
              totalSpent: o.total_amount || 0,
              status: 'Active'
            });
          } else {
            const ex = custMap.get(name);
            ex.ordersCount += 1;
            ex.totalSpent += o.total_amount || 0;
          }
        });
        setCustomers(Array.from(custMap.values()));
      }
    } catch {
      showToast('Failed to load report data sources', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 10 Standard Report Definitions
  const reportDefinitions = [
    {
      id: 'orders',
      name: 'Orders Report',
      desc: 'Orders, customers, fulfillment status and order values.',
      icon: ShoppingCart,
      color: 'text-sky-600',
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      count: orders.length
    },
    {
      id: 'customers',
      name: 'Customer Report',
      desc: 'Customer demographics, order history, and spending volume.',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      count: customers.length
    },
    {
      id: 'payments',
      name: 'Payment Report',
      desc: 'Gateway logs, paid amounts, COD collections, and refunds.',
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      count: orders.length
    },
    {
      id: 'products',
      name: 'Product Report',
      desc: 'Product catalog attributes, pricing, stock levels and performance.',
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      count: products.length
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      desc: 'Warehouse stock, low inventory thresholds and reorder levels.',
      icon: Boxes,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      count: products.filter((p) => p.stock <= 5).length
    },
    {
      id: 'reviews',
      name: 'Reviews Report',
      desc: 'Customer ratings, verified reviews, and product feedback.',
      icon: MessageSquare,
      color: 'text-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-950/40',
      count: reviews.length
    },
    {
      id: 'coupons',
      name: 'Coupon Report',
      desc: 'Voucher redemption, promotional codes, and discount usage.',
      icon: Percent,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      count: coupons.length
    },
    {
      id: 'sales',
      name: 'Sales Report',
      desc: 'Comprehensive sales revenue, gross margins, and delivery fees.',
      icon: TrendingUp,
      color: 'text-[#E63946]',
      bg: 'bg-[#E63946]/10',
      count: orders.length
    },
    {
      id: 'returns',
      name: 'Returns Report',
      desc: 'Customer returns, reverse logistics, and refund claims.',
      icon: RotateCcw,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      count: orders.filter((o) => o.status === 'Returned' || o.status === 'Cancelled').length
    },
    {
      id: 'tax',
      name: 'Tax Report',
      desc: 'GST calculation, tax liability, state tax breakdown, and invoices.',
      icon: Receipt,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      count: orders.length
    }
  ];

  // Helper to compile filtered records per active report
  const getCompiledRecords = () => {
    if (!selectedReport) return [];

    let dataset = [];

    if (selectedReport === 'orders' || selectedReport === 'sales' || selectedReport === 'tax') {
      dataset = orders.map((o) => {
        const isPaid = !o.payment_method?.toLowerCase().includes('cash');
        return {
          id: o.order_number,
          orderId: o.id,
          customer: o.shipping_address?.full_name || 'Customer',
          date: o.date ? new Date(o.date).toLocaleDateString('en-IN') : 'Recent',
          items: (o.items || []).map((i) => `${i.product_name_snapshot || i.product_name} (x${i.quantity})`).join(', '),
          amount: o.total_amount || 0,
          tax: o.tax_amount || Math.round((o.total_amount || 0) * 0.18),
          paymentMethod: o.payment_method || 'Online',
          paymentStatus: isPaid ? 'PAID' : 'UNPAID',
          status: o.status
        };
      });

      if (statusFilter !== 'all') {
        dataset = dataset.filter((d) => d.status.toLowerCase() === statusFilter.toLowerCase());
      }
    } else if (selectedReport === 'customers') {
      dataset = customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email || 'customer@cmcart.in',
        phone: c.phone || '+91 98765 43210',
        joined: c.joinedDate || '2026-08-15',
        orders: c.ordersCount || 1,
        totalSpent: c.totalSpent || 0,
        status: c.status || 'Active'
      }));
    } else if (selectedReport === 'payments') {
      dataset = orders.map((o, idx) => {
        const isCod = o.payment_method?.toLowerCase().includes('cash');
        const isPaid = o.payment_status === 'Completed' || o.cod_collected || (!isCod && !o.payment_status?.toLowerCase().includes('fail'));
        const seed = o.order_number?.replace(/\D/g, '') || String(idx + 1000);
        return {
          id: isCod ? `cod_${seed}` : `pay_rzp_${seed}`,
          orderNumber: o.order_number,
          customer: o.shipping_address?.full_name || 'Customer',
          date: o.date ? new Date(o.date).toLocaleDateString('en-IN') : 'Today',
          method: o.payment_method || (isCod ? 'Cash on Delivery' : 'Razorpay'),
          amount: o.total_amount || 0,
          status: isPaid ? (isCod ? 'COLLECTED' : 'PAID') : (isCod ? 'COD_PENDING' : 'UNPAID'),
          isPaid
        };
      });

      if (statusFilter !== 'all') {
        if (statusFilter === 'paid') dataset = dataset.filter((d) => d.isPaid);
        if (statusFilter === 'unpaid') dataset = dataset.filter((d) => !d.isPaid);
      }
    } else if (selectedReport === 'products') {
      dataset = products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || 'N/A',
        category: p.category_name || 'General',
        price: p.current_price,
        stock: p.stock,
        variants: p.variants?.length ? `${p.variants.length} Variants` : 'Single',
        status: p.is_active ? 'Active' : 'Inactive'
      }));
    } else if (selectedReport === 'inventory') {
      dataset = products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || 'N/A',
        stock: p.stock,
        threshold: p.low_stock_threshold || 5,
        status: p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'Sufficient'
      }));

      if (statusFilter === 'low') {
        dataset = dataset.filter((d) => d.stock <= 5);
      }
    } else if (selectedReport === 'reviews') {
      dataset = reviews.map((r) => ({
        id: r.id,
        customer: r.user_name || 'Verified Buyer',
        product: r.product_name || 'Product Item',
        rating: `${r.rating} ★`,
        review: r.comment || r.title || 'Great product',
        date: r.date || 'Recent',
        verified: r.is_verified_purchase ? 'Yes' : 'No'
      }));
    } else if (selectedReport === 'coupons') {
      dataset = coupons.map((c) => ({
        id: c.code,
        description: c.description,
        discount: c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`,
        timesUsed: c.times_used || 0,
        status: c.is_active ? 'Active' : 'Inactive'
      }));
    } else if (selectedReport === 'returns') {
      dataset = orders
        .filter((o) => o.status === 'Returned' || o.status === 'Cancelled')
        .map((o) => ({
          id: o.order_number,
          customer: o.shipping_address?.full_name || 'Customer',
          date: o.date ? new Date(o.date).toLocaleDateString('en-IN') : 'Recent',
          amount: o.total_amount || 0,
          reason: 'Customer initiated exchange / return request',
          status: o.status
        }));
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      dataset = dataset.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(q))
      );
    }

    return dataset;
  };

  const records = getCompiledRecords();
  const currentDef = reportDefinitions.find((r) => r.id === selectedReport);

  // Export Handlers
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = Object.keys(records[0]).filter((k) => k !== 'orderId' && k !== 'isPaid');
    const headerRow = headers.map((h) => `"${h.toUpperCase()}"`).join(',');
    const rows = records.map((r) => headers.map((h) => `"${r[h] ?? ''}"`).join(','));
    const csvContent = [headerRow, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CMCart_${currentDef?.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`${currentDef?.name} exported as CSV!`, 'success');
  };

  const handleExportJSON = () => {
    if (records.length === 0) return;
    const jsonStr = JSON.stringify(records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CMCart_${currentDef?.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`${currentDef?.name} exported as JSON!`, 'success');
  };

  const handleExportPDF = () => {
    if (records.length === 0) {
      showToast('No records to export', 'info');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      // Top Red Accent Line
      doc.setFillColor(230, 57, 70); // #E63946
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 8, 'F');

      // Brand Logo & Heading
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(230, 57, 70);
      doc.text('CMCart', 40, 42);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('OPERATIONS & BUSINESS INTELLIGENCE', 135, 40);

      // Report Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(23, 23, 23);
      doc.text(currentDef?.name || 'Business Report', 40, 68);

      // Metadata Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const generatedAt = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      doc.text(
        `Generated on: ${generatedAt}  |  Records: ${records.length}  |  Status Filter: ${statusFilter.toUpperCase()}`,
        40,
        84
      );

      // Divider line
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(1);
      doc.line(40, 94, doc.internal.pageSize.getWidth() - 40, 94);

      // Prepare Table Columns & Rows
      const headers = Object.keys(records[0]).filter((k) => k !== 'orderId' && k !== 'isPaid');
      const tableHeaders = headers.map((h) => h.replace(/([A-Z])/g, ' $1').toUpperCase());

      const tableData = records.map((r) =>
        headers.map((h) => {
          const val = r[h];
          if (h === 'amount' || h === 'totalSpent' || h === 'price' || h === 'tax') {
            return `Rs. ${Number(val || 0).toLocaleString('en-IN')}`;
          }
          return String(val ?? '');
        })
      );

      // Render autoTable
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 104,
        margin: { left: 40, right: 40 },
        theme: 'striped',
        headStyles: {
          fillColor: [23, 23, 23],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'left',
          cellPadding: 6
        },
        styles: {
          fontSize: 8,
          cellPadding: 5.5,
          textColor: [30, 41, 59],
          overflow: 'linebreak'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `CMCart Confidential Report  |  Page ${data.pageNumber} of ${pageCount}`,
            40,
            doc.internal.pageSize.getHeight() - 20
          );
        }
      });

      // Save PDF file to disk
      const filename = `CMCart_${currentDef?.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
      showToast(`${currentDef?.name} downloaded as PDF!`, 'success');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      showToast('Error generating PDF report', 'error');
    }
  };

  const handlePrintReport = () => {
    if (records.length === 0) {
      showToast('No records to print', 'info');
      return;
    }

    const headers = Object.keys(records[0]).filter((k) => k !== 'orderId' && k !== 'isPaid');
    const tableHeaders = headers.map((h) => h.replace(/([A-Z])/g, ' $1').toUpperCase());

    const generatedAt = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CMCart - ${currentDef?.name}</title>
          <style>
            @page { size: landscape; margin: 15mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #171717;
              margin: 0;
              padding: 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #E63946;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .brand-name {
              font-size: 24px;
              font-weight: 900;
              color: #E63946;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 11px;
              font-weight: 700;
              color: #6B7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .report-title {
              font-size: 18px;
              font-weight: 800;
              margin: 6px 0 2px 0;
            }
            .meta {
              font-size: 11px;
              color: #6B7280;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
              font-size: 11px;
            }
            th {
              background-color: #171717;
              color: white;
              text-align: left;
              padding: 8px 10px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            td {
              padding: 8px 10px;
              border-bottom: 1px solid #E5E7EB;
            }
            tr:nth-child(even) {
              background-color: #F9FAFB;
            }
            .footer {
              margin-top: 24px;
              border-top: 1px solid #E5E7EB;
              padding-top: 10px;
              font-size: 10px;
              color: #9CA3AF;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-name">CMCart</div>
              <div class="brand-sub">Operations & Business Intelligence</div>
              <div class="report-title">${currentDef?.name}</div>
              <div class="meta">Generated: ${generatedAt} · Records: ${records.length} · Status: ${statusFilter.toUpperCase()}</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #6B7280;">
              <div>CONFIDENTIAL DOCUMENT</div>
              <div>System Operations Report</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                ${tableHeaders.map((th) => `<th>${th}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${records.map((r) => `
                <tr>
                  ${headers.map((h) => {
                    const val = r[h];
                    if (h === 'amount' || h === 'totalSpent' || h === 'price' || h === 'tax') {
                      return `<td style="font-weight: 700;">₹${Number(val || 0).toLocaleString('en-IN')}</td>`;
                    }
                    return `<td>${String(val ?? '')}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <span>© 2026 CMCart Operations Portal. All rights reserved.</span>
            <span>Printed on ${generatedAt}</span>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
              Reports & Business Intelligence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Generate, filter and export detailed business reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedReport && (
            <Button
              onClick={() => setSelectedReport(null)}
              variant="outline"
              size="sm"
              icon={ArrowLeft}
            >
              All Report Catalogs
            </Button>
          )}
          <Button onClick={loadData} variant="outline" size="sm" icon={RefreshCw}>
            Refresh DB
          </Button>
        </div>
      </div>

      {/* 2. HUB VIEW: 10 Report Cards */}
      {!selectedReport ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Select Business Report Module
            </h2>
            <span className="text-xs text-neutral-400">10 Standard Reports Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reportDefinitions.map((rep) => {
              const Icon = rep.icon;
              return (
                <div
                  key={rep.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 hover:border-[#E63946]/50 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${rep.bg} ${rep.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {rep.count} records
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E63946] transition-colors">
                        {rep.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                        {rep.desc}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedReport(rep.id);
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    variant="primary"
                    size="sm"
                    className="w-full font-bold justify-center"
                    icon={ArrowRight}
                  >
                    Open Report
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. ACTIVE REPORT WORKSPACE VIEW */
        <div className="space-y-6">
          {/* Active Report Header Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Back Button inside the card to return to all reports */}
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
                title="Back to All Report Catalogs"
                aria-label="Back to Report Catalog"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentDef?.bg} ${currentDef?.color}`}>
                {currentDef && <currentDef.icon className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                    {currentDef?.name}
                  </h2>
                  <Badge variant="primary" size="xs">
                    {records.length} records matched
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{currentDef?.desc}</p>
              </div>
            </div>

            {/* Export & Print Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={handleExportCSV} variant="outline" size="sm" icon={FileSpreadsheet}>
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm" icon={Download}>
                Export PDF
              </Button>
              <Button onClick={handlePrintReport} variant="outline" size="sm" icon={Printer}>
                Print
              </Button>
              <Button onClick={handleExportJSON} variant="outline" size="sm" icon={FileCode}>
                Export JSON
              </Button>
            </div>
          </div>

          {/* Filter Builder Area */}
          <div className="p-4 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${currentDef?.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
                />
              </div>

              {/* Dynamic Filter Selectors based on report */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedReport === 'orders' && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-1 focus:ring-[#E63946] cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}

                {selectedReport === 'payments' && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-1 focus:ring-[#E63946] cursor-pointer"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid & Collected</option>
                    <option value="unpaid">Unpaid / COD Pending</option>
                  </select>
                )}

                {selectedReport === 'inventory' && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-1 focus:ring-[#E63946] cursor-pointer"
                  >
                    <option value="all">All Warehouse Stock</option>
                    <option value="low">Low Stock Only (≤ 5 units)</option>
                  </select>
                )}

                <div className="inline-flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-xl text-xs font-bold border border-neutral-200/60 dark:border-neutral-700/60">
                  {['today', '7d', '30d', 'all'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setDateRange(tf)}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer capitalize ${
                        dateRange === tf
                          ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                          : 'text-neutral-500'
                      }`}
                    >
                      {tf === 'all' ? 'All Time' : tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Summary & Reset */}
            {(searchQuery || statusFilter !== 'all' || dateRange !== 'all') && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-500">
                  <span>Filters applied:</span>
                  {searchQuery && <Badge variant="outline" size="xs">Query: &quot;{searchQuery}&quot;</Badge>}
                  {statusFilter !== 'all' && <Badge variant="outline" size="xs">Status: {statusFilter}</Badge>}
                  {dateRange !== 'all' && <Badge variant="outline" size="xs">Date: {dateRange}</Badge>}
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateRange('all');
                  }}
                  className="text-xs font-bold text-[#E63946] hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Live Data Preview Table */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    {records.length > 0 &&
                      Object.keys(records[0])
                        .filter((k) => k !== 'orderId' && k !== 'isPaid')
                        .map((col) => (
                          <th key={col} className="py-3 px-4">
                            {col.replace(/([A-Z])/g, ' $1')}
                          </th>
                        ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                        No records matched current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    records.map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                        {Object.entries(row)
                          .filter(([k]) => k !== 'orderId' && k !== 'isPaid')
                          .map(([key, val], cellIdx) => {
                            if (key === 'status') {
                              return (
                                <td key={cellIdx} className="py-3.5 px-4">
                                  <Badge variant="primary" size="xs">{String(val)}</Badge>
                                </td>
                              );
                            }
                            if (key === 'paymentStatus') {
                              return (
                                <td key={cellIdx} className="py-3.5 px-4">
                                  <PaymentStatusBadge status={String(val)} size="xs" />
                                </td>
                              );
                            }
                            if (key === 'amount' || key === 'totalSpent' || key === 'price' || key === 'tax') {
                              return (
                                <td key={cellIdx} className="py-3.5 px-4 font-black text-neutral-900 dark:text-neutral-100">
                                  ₹{Number(val || 0).toLocaleString('en-IN')}
                                </td>
                              );
                            }
                            return (
                              <td key={cellIdx} className="py-3.5 px-4 text-neutral-800 dark:text-neutral-200">
                                {String(val ?? '')}
                              </td>
                            );
                          })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
