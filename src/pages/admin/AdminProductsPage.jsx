import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Search,
  CheckCircle2,
  ArrowUpDown,
  Zap,
  Flame,
  Upload
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProductImportModal } from '../../components/admin/ProductImportModal';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('cmcart_dataset_updated', handleUpdate);
    return () => window.removeEventListener('cmcart_dataset_updated', handleUpdate);
  }, []);

  const loadData = async () => {
    const [prods, cats] = await Promise.all([
      commerceDb.getProducts(),
      commerceDb.getCategories(),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await commerceDb.deleteProduct(id);
      showToast('Product deleted from catalog', 'info');
      loadData();
    }
  };

  const handleDuplicate = async (p) => {
    const duplicated = {
      ...p,
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-CPY`
    };
    await commerceDb.addProduct(duplicated);
    showToast('Product duplicated successfully!', 'success');
    loadData();
  };

  const handleToggleActive = async (p) => {
    await commerceDb.updateProduct(p.id, { is_active: !p.is_active });
    showToast(`Product ${!p.is_active ? 'activated' : 'deactivated'}`, 'info');
    loadData();
  };

  const handleToggleDeal = async (p) => {
    const updatedVal = !p.is_deal_of_the_day;
    await commerceDb.updateProduct(p.id, { is_deal_of_the_day: updatedVal });
    showToast(`Deal of the Day ${updatedVal ? 'enabled' : 'disabled'} for ${p.name}`, updatedVal ? 'success' : 'info');
    loadData();
  };

  const handleToggleBestseller = async (p) => {
    const updatedVal = !p.is_best_seller;
    await commerceDb.updateProduct(p.id, { is_best_seller: updatedVal });
    showToast(`Bestseller tag ${updatedVal ? 'enabled' : 'disabled'} for ${p.name}`, updatedVal ? 'success' : 'info');
    loadData();
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'Special Deals') return p.is_deal_of_the_day;
    if (activeTab === 'Bestsellers') return p.is_best_seller;
    if (activeTab === 'Active') return p.is_active;
    if (activeTab === 'Low Stock') return p.stock <= 5;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            CATALOG MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Product Inventory & Listings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Create, modify, upload Cloudinary assets, and control stock status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setIsImportOpen(true)}
            variant="outline"
            size="md"
            icon={Upload}
          >
            Import Products
          </Button>
          <Link to="/admin/products/new">
            <Button variant="primary" size="md" icon={Plus}>
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Filter Pills (Special Deals, Bestsellers, Active, Low Stock) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {['All', 'Special Deals', 'Bestsellers', 'Active', 'Low Stock'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === tab
                ? 'bg-[#E63946] text-white shadow-xs'
                : 'bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, brand, or SKU..."
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="text-xs font-semibold text-neutral-500">
          Showing: <strong className="text-neutral-900 dark:text-neutral-100">{filtered.length}</strong> Products
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Deals & Badges</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:border-neutral-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-16 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Package className="w-8 h-8 text-neutral-400" />
                      </div>
                      <div className="text-center max-w-xs">
                        <p className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">No Products in Catalog</p>
                        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">Your product catalog is currently empty. Add a product or upload a dataset to populate items.</p>
                      </div>
                      <Link to="/admin/products/new">
                        <button
                          type="button"
                          className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] tracking-wide text-white
                            bg-gradient-to-br from-[#EF3340] to-[#C92030]
                            hover:from-[#D92332] hover:to-[#B01C28]
                            active:scale-[0.96]
                            shadow-md shadow-red-500/30
                            hover:shadow-lg hover:shadow-red-500/40
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF3340]/60 focus-visible:ring-offset-2
                            transition-all duration-200 cursor-pointer select-none"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors duration-200">
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                          <span>Add First Product</span>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                    No products match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200 dark:border-neutral-700"
                      />
                      <div className="min-w-0 max-w-xs">
                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#E63946] truncate block"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-neutral-400">{p.brand} • {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-neutral-600 dark:text-neutral-300">
                    {p.category_name}
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                    ₹{p.current_price?.toLocaleString('en-IN')}
                    {p.original_price > p.current_price && (
                      <span className="block text-[11px] text-neutral-400 font-normal line-through">
                        ₹{p.original_price?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleDeal(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          p.is_deal_of_the_day
                            ? 'bg-[#E63946] text-white shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200'
                        }`}
                        title="Toggle Deal of the Day"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>DEAL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleBestseller(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          p.is_best_seller
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200'
                        }`}
                        title="Toggle Bestseller Tag"
                      >
                        <Flame className="w-3 h-3 fill-current" />
                        <span>BEST</span>
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      p.stock <= 5 ? 'text-amber-500 font-bold' : 'text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer uppercase ${
                        p.is_active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/product/${p.id}`}
                        target="_blank"
                        className="p-1.5 text-neutral-600 hover:text-[#E63946] dark:text-neutral-300"
                        title="View in Store"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/products/edit/${p.id}`}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
                        title="Duplicate Product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Product Import Modal */}
      <ProductImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={loadData}
      />
    </div>
  );
}
