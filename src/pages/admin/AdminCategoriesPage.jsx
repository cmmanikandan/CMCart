import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, Search, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { uploadImageToCloudinary } from '../../services/cloudinary/cloudinaryService';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
    itemCount: 120,
    is_active: true
  });

  useEffect(() => {
    loadCategories();
    const handleUpdate = () => loadCategories();
    window.addEventListener('cmcart_dataset_updated', handleUpdate);
    return () => window.removeEventListener('cmcart_dataset_updated', handleUpdate);
  }, []);

  const loadCategories = () => {
    commerceDb.getCategories().then(setCategories);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
      itemCount: 100,
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setForm(c);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await commerceDb.deleteCategory(id);
      showToast('Category deleted', 'info');
      loadCategories();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    if (editingId) {
      await commerceDb.updateCategory(editingId, form);
      showToast('Category updated!', 'success');
    } else {
      await commerceDb.addCategory(form);
      showToast('New category added!', 'success');
    }
    setShowModal(false);
    loadCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            TAXONOMY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Organize departments, banners and navigation hierarchies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
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
          <span>Add Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="max-w-md mx-auto text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0F1] dark:bg-rose-950/40 text-[#EF3340] flex items-center justify-center mx-auto border border-[#EF3340]/20 shadow-xs">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100">
              No Categories Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Your category taxonomy is currently empty. Create a new category or upload a dataset to organize products into departments.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm tracking-wide text-white
                  bg-gradient-to-br from-[#EF3340] to-[#C92030]
                  hover:from-[#D92332] hover:to-[#B01C28]
                  active:scale-[0.96]
                  shadow-lg shadow-red-500/30
                  hover:shadow-xl hover:shadow-red-500/40
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF3340]/60 focus-visible:ring-offset-2
                  transition-all duration-200 cursor-pointer select-none"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-200">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </span>
                <span>Add First Category</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-14 h-14 rounded-xl object-cover bg-neutral-100 shrink-0"
                />
                <div className="truncate">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {c.name}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">{c.description || c.slug}</p>
                  <span className="text-[11px] font-semibold text-[#E63946] mt-1 block">
                    {c.itemCount || 100}+ items
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-neutral-400 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Category Image (Upload File or Enter URL)
            </label>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:border-[#E63946] cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#E63946]" />
                <span>Upload From Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const res = await uploadImageToCloudinary(file);
                        setForm({ ...form, image: res.url });
                        showToast('Category image uploaded!', 'success');
                      } catch {
                        showToast('Failed to upload image', 'error');
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>

              {form.image && (
                <div className="w-12 h-12 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-100 shrink-0">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="Or paste image URL (https://...)"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
