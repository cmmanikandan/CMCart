import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit, Upload, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { uploadImageToCloudinary } from '../../services/cloudinary/cloudinaryService';

export function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    tag: 'FEATURED DEAL',
    cta_text: 'Shop Now',
    cta_link: '/products',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600',
    is_active: true
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = () => {
    commerceDb.getBanners().then(setBanners);
  };

  const handleOpenAdd = () => {
    setForm({
      title: '',
      subtitle: '',
      tag: 'NEW DEAL',
      cta_text: 'Explore Deals',
      cta_link: '/products',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600',
      is_active: true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this banner?')) {
      await commerceDb.deleteBanner(id);
      showToast('Banner removed', 'info');
      loadBanners();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    await commerceDb.addBanner(form);
    showToast('Homepage promotional banner published!', 'success');
    setShowModal(false);
    loadBanners();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading banner via Cloudinary...', 'info');
      const res = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, image_url: res.url }));
      showToast('Image uploaded!', 'success');
    } catch {
      showToast('Upload failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            MARKETING
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Homepage Hero Banners
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Configure rotating carousel banners, headline copy and CTA links.
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Add Hero Banner
        </Button>
      </div>

      <div className="space-y-4">
        {banners.map((b) => (
          <div
            key={b.id}
            className="p-4 sm:p-5 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={b.image_url}
                alt={b.title}
                className="w-28 h-16 rounded-xl object-cover bg-neutral-900 shrink-0 border"
              />
              <div className="truncate">
                <span className="text-[10px] font-extrabold text-[#E63946] uppercase tracking-wider block">
                  {b.tag}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {b.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate">{b.subtitle}</p>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  CTA: "{b.cta_text}" → {b.cta_link}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDelete(b.id)}
                className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
        title="Add Promotional Hero Banner"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Headline Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Festival Super Sale Up to 60% Off"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. Grab best deals on smartphones and headphones"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Badge / Tag
              </label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={form.cta_text}
                onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Banner Image URL (Cloudinary or Web)
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
