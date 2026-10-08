import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Minus,
  RefreshCw,
  TrendingDown,
  PackageCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadProducts();
    const handleUpdate = () => loadProducts();
    window.addEventListener('cmcart_dataset_updated', handleUpdate);
    return () => window.removeEventListener('cmcart_dataset_updated', handleUpdate);
  }, []);

  const loadProducts = () => {
    commerceDb.getProducts().then(setProducts);
  };

  const handleStockUpdate = async (product, delta) => {
    setUpdatingId(product.id);
    const newStock = Math.max(0, (product.stock || 0) + delta);
    await commerceDb.updateProduct(product.id, { stock: newStock });
    showToast(`Updated stock for ${product.name} to ${newStock} units`, 'info');
    loadProducts();
    setUpdatingId(null);
  };

  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !lowStockOnly || p.stock <= 5;
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            WAREHOUSE LOGISTICS & STOCK
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Inventory & Stock Thresholds
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Real-time warehouse inventory, auto-stock triggers, and instant SKU replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={loadProducts} variant="outline" size="sm" icon={RefreshCw}>
            Refresh
          </Button>
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              lowStockOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#181818] text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {lowStockOnly ? 'Showing Low Stock Only' : `Filter Low Stock (≤ 5 units: ${lowStockCount})`}
          </button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Low Stock Alert: {lowStockCount} SKUs are below minimum safety threshold (5 units)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {outOfStockCount > 0 ? `${outOfStockCount} items are completely out of stock.` : 'Immediate supplier replenishment advised.'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setLowStockOnly(true)}
            variant="outline"
            size="sm"
            className="border-amber-400 text-amber-900 dark:text-amber-200"
          >
            View Affected SKUs
          </Button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, Category, or Product Title..."
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="text-xs text-neutral-500 font-semibold">
          Showing {filtered.length} of {products.length} catalog items
        </div>
      </div>

      {/* Inventory Stock Table */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <Boxes className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">No Inventory Tracked</p>
                      <p className="text-xs text-neutral-500">Your warehouse inventory is currently empty. Add products or upload a dataset to monitor stock.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-neutral-400">
                    No products match your inventory filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                const isCritical = p.stock <= 5;
                const isOut = p.stock === 0;
                const stockHealthPct = Math.min(100, Math.round((p.stock / 50) * 100));

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-contain bg-neutral-100 dark:bg-neutral-800 p-0.5 border border-neutral-200 dark:border-neutral-700 shrink-0"
                        />
                        <div className="truncate max-w-xs">
                          <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{p.name}</p>
                          <p className="text-[11px] text-neutral-400 font-mono">{p.sku || 'SKU-GEN'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {p.category_name}
                    </td>

                    {/* Stock Level with visual meter */}
                    <td className="py-3 px-4">
                      <div className="space-y-1 w-32">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-black ${isOut ? 'text-rose-600' : isCritical ? 'text-amber-600' : 'text-neutral-900 dark:text-neutral-100'}`}>
                            {p.stock} units
                          </span>
                          <span className="text-[10px] text-neutral-400">/ 50 target</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${stockHealthPct}%` }}
                            className={`h-full rounded-full ${
                              isOut
                                ? 'bg-rose-500'
                                : isCritical
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isOut ? (
                        <Badge variant="danger" size="sm">Out of Stock</Badge>
                      ) : isCritical ? (
                        <Badge variant="warning" size="sm">Low Stock (≤5)</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Healthy Stock</Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-850 shadow-xs">
                        <button
                          onClick={() => handleStockUpdate(p, -5)}
                          disabled={p.stock <= 0}
                          className="px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 disabled:opacity-40 cursor-pointer"
                          title="Reduce 5 units"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockUpdate(p, 5)}
                          className="px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-emerald-600 font-bold text-xs border-x border-neutral-200 dark:border-neutral-700 cursor-pointer"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockUpdate(p, 15)}
                          className="px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sky-600 font-bold text-xs border-r border-neutral-200 dark:border-neutral-700 cursor-pointer"
                          title="Add 15 units"
                        >
                          +15
                        </button>
                        <button
                          onClick={() => handleStockUpdate(p, 30)}
                          className="px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#E63946] font-bold text-xs cursor-pointer"
                          title="Add 30 units"
                        >
                          +30
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
