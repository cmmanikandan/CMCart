import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Search,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { uploadImageToCloudinary } from '../../services/cloudinary/cloudinaryService';

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    category_id: 'cat-electronics',
    category_name: 'Electronics',
    brand: '',
    sku: '',
    current_price: 1999,
    original_price: 2999,
    stock: 20,
    is_active: true,
    is_deal_of_the_day: false,
    is_best_seller: false,
    is_new_arrival: true,
    description: '',
    images: [],
    seo_title: '',
    seo_description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prods, cats] = await Promise.all([
      commerceDb.getProducts(),
      commerceDb.getCategories(),
    ]);
    setProducts(prods);
    setCategories(cats);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      category_id: categories[0]?.id || 'cat-electronics',
      category_name: categories[0]?.name || 'Electronics',
      brand: 'CMCart Originals',
      sku: `CMC-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      current_price: 1499,
      original_price: 2499,
      stock: 25,
      is_active: true,
      is_deal_of_the_day: false,
      is_best_seller: false,
      is_new_arrival: true,
      description: 'High-performance commercial product crafted with premium materials and verified quality check.',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      ],
      seo_title: '',
      seo_description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setForm(p);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await commerceDb.deleteProduct(id);
      showToast('Product deleted', 'info');
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadImageToCloudinary(file);
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), res.url]
      }));
      showToast('Image uploaded via Cloudinary pipeline!', 'success');
    } catch {
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.current_price) {
      showToast('Please fill all mandatory fields', 'error');
      return;
    }

    const selectedCat = categories.find((c) => c.id === form.category_id);
    const payload = {
      ...form,
      category_name: selectedCat?.name || form.category_name
    };

    if (editingId) {
      await commerceDb.updateProduct(editingId, payload);
      showToast('Product updated successfully!', 'success');
    } else {
      await commerceDb.addProduct(payload);
      showToast('New product added to catalog!', 'success');
    }

    setShowModal(false);
    loadData();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

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

        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Add New Product
        </Button>
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
          Total: <strong className="text-neutral-900 dark:text-neutral-100">{filtered.length}</strong> Products
        </div>
      </div>

      {/* Products Table (Requirement #28) */}
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:border-neutral-800">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200 dark:border-neutral-700"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {p.name}
                        </p>
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
                  <td className="py-3 px-4 font-bold">
                    ★ {p.rating} <span className="text-[10px] text-neutral-400 font-normal">({p.review_count})</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                        title="Duplicate Product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Product Details' : 'Add New Product to CMCart'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Category *
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Brand *
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                required
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Current Price (₹) *
              </label>
              <input
                type="number"
                value={form.current_price}
                onChange={(e) => setForm({ ...form, current_price: e.target.value })}
                required
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Original MRP (₹)
              </label>
              <input
                type="number"
                value={form.original_price}
                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Inventory Stock
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>

          {/* Cloudinary Image Media Upload */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Product Images (Cloudinary CDN Pipeline)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images?.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl border overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center text-neutral-400 hover:border-[#E63946] hover:text-[#E63946] cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-[9px] mt-0.5">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {uploadingImage && (
              <p className="text-xs text-[#E63946]">Processing upload via Cloudinary...</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Product Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          {/* Badges / Promotions Toggle */}
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_deal_of_the_day}
                onChange={(e) => setForm({ ...form, is_deal_of_the_day: e.target.checked })}
                className="w-4 h-4 rounded text-[#E63946]"
              />
              <span className="text-xs font-semibold">Deal of the Day</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_best_seller}
                onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })}
                className="w-4 h-4 rounded text-[#E63946]"
              />
              <span className="text-xs font-semibold">Best Seller</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_new_arrival}
                onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })}
                className="w-4 h-4 rounded text-[#E63946]"
              />
              <span className="text-xs font-semibold">New Arrival</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
