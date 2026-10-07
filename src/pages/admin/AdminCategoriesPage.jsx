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

        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Add Category
        </Button>
      </div>

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

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Image URL (Cloudinary or Web)
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
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
