import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, Search, Plus, Minus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    commerceDb.getProducts().then(setProducts);
  };

  const handleStockUpdate = async (product, delta) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    await commerceDb.updateProduct(product.id, { stock: newStock });
    showToast(`Updated stock for ${product.name} to ${newStock}`, 'info');
    loadProducts();
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !lowStockOnly || p.stock <= 5;
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            WAREHOUSE & STOCK
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Inventory & Warehouse Levels
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Monitor product stock thresholds and trigger quick replenishments.
          </p>
        </div>

        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            lowStockOnly
              ? 'bg-amber-500 text-white border-amber-600'
              : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#181818]'
          }`}
        >
          {lowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock (≤ 5 units)'}
        </button>
      </div>

      <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU or Product Title..."
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#E63946]"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0]}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                      />
                      <div className="truncate max-w-xs">
                        <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{p.name}</p>
                        <p className="text-[11px] text-neutral-400 font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                    {p.category_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-base">{p.stock}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-400 text-xs">
                    5 units
                  </td>
                  <td className="py-3 px-4">
                    {p.stock === 0 ? (
                      <Badge variant="error">Out of Stock</Badge>
                    ) : p.stock <= 5 ? (
                      <Badge variant="warning">Low Stock</Badge>
                    ) : (
                      <Badge variant="success">Healthy</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                      <button
                        onClick={() => handleStockUpdate(p, -5)}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        title="Reduce 5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStockUpdate(p, 10)}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[#16A34A] font-bold text-xs px-2"
                        title="Add 10"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleStockUpdate(p, 25)}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[#E63946] font-bold text-xs px-2"
                        title="Add 25"
                      >
                        +25
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
