import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Save,
  Tag,
  Package,
  Layers,
  Percent,
  Eye,
  Check,
  AlertCircle,
  Truck,
  Globe,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { uploadImageToCloudinary } from '../../services/cloudinary/cloudinaryService';

export function AdminProductEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Variants Enabled toggle
  const [hasVariants, setHasVariants] = useState(false);

  // Form State: STRICTLY EMPTY for Add Product (only placeholders shown)
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    category_name: '',
    subcategory: '',
    brand: '',
    sku: '',
    current_price: '',
    original_price: '',
    discount_percentage: 0,
    stock: '',
    low_stock_threshold: 5,
    status: 'Active', // 'Active' | 'Draft' | 'Inactive'
    description: '',
    images: [],
    variants: [],
    specifications: {},
    shipping: {
      weight: '',
      dimensions: '',
      delivery_eligibility: 'Standard & Express Delivery'
    },
    seo: {
      meta_title: '',
      meta_description: '',
      slug: ''
    }
  });

  // Dynamic Specification State
  const [specList, setSpecList] = useState([]);

  useEffect(() => {
    async function init() {
      const cats = await commerceDb.getCategories();
      setCategories(cats || []);

      if (isEditing) {
        setLoading(true);
        const prod = await commerceDb.getProductById(id);
        if (prod) {
          const prodImages = prod.images || (prod.image ? [prod.image] : []);
          const prodVariants = prod.variants || [];
          const hasVars = prodVariants.length > 0 && prodVariants[0].name !== 'Default';

          setHasVariants(hasVars);
          setForm({
            name: prod.name || '',
            category_id: prod.category_id || '',
            category_name: prod.category_name || '',
            subcategory: prod.subcategory || '',
            brand: prod.brand || '',
            sku: prod.sku || '',
            current_price: prod.current_price ?? '',
            original_price: prod.original_price ?? '',
            discount_percentage: prod.discount_percentage || 0,
            stock: prod.stock ?? '',
            low_stock_threshold: prod.low_stock_threshold || 5,
            status: prod.is_active ? 'Active' : 'Draft',
            description: prod.description || '',
            images: prodImages,
            variants: prodVariants,
            specifications: prod.specifications || {},
            shipping: prod.shipping || {
              weight: '0.5 kg',
              dimensions: '20 x 15 x 5 cm',
              delivery_eligibility: 'Standard & Express Delivery'
            },
            seo: prod.seo || {
              meta_title: prod.name || '',
              meta_description: prod.description?.slice(0, 160) || '',
              slug: prod.slug || ''
            }
          });

          // Convert specifications map to list for dynamic fields
          if (prod.specifications) {
            setSpecList(
              Object.entries(prod.specifications).map(([key, val]) => ({
                id: Math.random().toString(),
                key,
                value: String(val)
              }))
            );
          }
        } else {
          showToast('Product record not found', 'error');
          navigate('/admin/products');
        }
        setLoading(false);
      }
    }
    init();
  }, [id, isEditing, navigate]);

  // Recalculate discount percentage automatically
  const handlePriceChange = (field, val) => {
    const updated = { ...form, [field]: val };
    const cur = Number(field === 'current_price' ? val : form.current_price) || 0;
    const orig = Number(field === 'original_price' ? val : form.original_price) || 0;

    if (orig > cur && orig > 0) {
      updated.discount_percentage = Math.round(((orig - cur) / orig) * 100);
    } else {
      updated.discount_percentage = 0;
    }
    setForm(updated);
  };

  const handleCategoryChange = (catId) => {
    const selected = categories.find((c) => c.id === catId);
    setForm((prev) => ({
      ...prev,
      category_id: catId,
      category_name: selected ? selected.name : ''
    }));
  };

  // Image Management
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()]
    }));
    setImageUrlInput('');
    showToast('Image added to gallery', 'success');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(file);
      if (url) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, url]
        }));
        showToast('Image uploaded via Cloudinary!', 'success');
      }
    } catch {
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  // Variant Management
  const handleAddVariant = () => {
    const count = form.variants.length + 1;
    const newVar = {
      id: `var-${Date.now()}-${count}`,
      name: `Variant ${count}`,
      sku: form.sku ? `${form.sku}-V${count}` : `CMC-VAR-${count}`,
      color: '#000000',
      colorName: 'Black',
      size: 'Standard',
      storage: '',
      ram: '',
      price: form.current_price || '',
      mrp: form.original_price || '',
      stock: 10
    };
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, newVar]
    }));
  };

  const handleDuplicateVariant = (idx) => {
    const orig = form.variants[idx];
    const copy = {
      ...orig,
      id: `var-${Date.now()}-copy`,
      name: `${orig.name} (Copy)`,
      sku: `${orig.sku}-COPY`
    };
    const nextList = [...form.variants];
    nextList.splice(idx + 1, 0, copy);
    setForm((prev) => ({ ...prev, variants: nextList }));
    showToast('Variant duplicated', 'success');
  };

  const handleRemoveVariant = (idx) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const handleVariantChange = (idx, field, value) => {
    const updated = [...form.variants];
    updated[idx] = { ...updated[idx], [field]: value };

    // Auto-calculate variant discount if price & mrp are given
    if (field === 'price' || field === 'mrp') {
      const p = Number(field === 'price' ? value : updated[idx].price) || 0;
      const m = Number(field === 'mrp' ? value : updated[idx].mrp) || 0;
      if (m > p && m > 0) {
        updated[idx].discount = Math.round(((m - p) / m) * 100);
      }
    }

    setForm((prev) => ({ ...prev, variants: updated }));
  };

  // Specification Management
  const handleAddSpecification = () => {
    setSpecList((prev) => [...prev, { id: Math.random().toString(), key: '', value: '' }]);
  };

  const handleSpecChange = (idx, field, value) => {
    const updated = [...specList];
    updated[idx][field] = value;
    setSpecList(updated);
  };

  const handleRemoveSpec = (idx) => {
    setSpecList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Form Submit
  const handleSubmit = async (submitStatus = 'Active') => {
    if (!form.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!form.category_id) {
      showToast('Please select a product category', 'error');
      return;
    }
    if (!form.current_price) {
      showToast('Please specify product selling price', 'error');
      return;
    }

    setSaving(true);

    // Compile dynamic specifications back to key-value map
    const compiledSpecs = {};
    specList.forEach((s) => {
      if (s.key.trim()) {
        compiledSpecs[s.key.trim()] = s.value.trim();
      }
    });

    const payload = {
      ...form,
      is_active: submitStatus === 'Active',
      current_price: Number(form.current_price),
      original_price: Number(form.original_price || form.current_price),
      stock: Number(form.stock || 0),
      specifications: compiledSpecs,
      variants: hasVariants ? form.variants : [],
      image: form.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
    };

    try {
      if (isEditing) {
        await commerceDb.updateProduct(id, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await commerceDb.addProduct(payload);
        showToast('Product created and published successfully!', 'success');
      }
      navigate('/admin/products');
    } catch {
      showToast('Failed to save product record', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-neutral-500">
        Loading product information...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* 1. Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#E63946] transition-colors cursor-pointer"
            aria-label="Back to Products"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
              {isEditing ? `Edit Product: ${form.name || 'Record'}` : 'Add New Product'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isEditing
                ? 'Modify catalog attributes, pricing, stock, variants, and specifications.'
                : 'Create a clean, production-ready product record for the CMCart catalog.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSubmit('Draft')}
            loading={saving}
            variant="outline"
            size="sm"
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit('Active')}
            loading={saving}
            variant="primary"
            size="sm"
            icon={Save}
          >
            {isEditing ? 'Update Product' : 'Publish Product'}
          </Button>
        </div>
      </div>

      {/* 2. SECTION 1: Basic Information */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          1. Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Product Name <span className="text-[#E63946]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter product name (e.g. Apple Watch Series 9 GPS 45mm)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Brand <span className="text-[#E63946]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter brand (e.g. Apple, Nike, Sony)"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Category <span className="text-[#E63946]">*</span>
            </label>
            <select
              value={form.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946] cursor-pointer"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Subcategory
            </label>
            <input
              type="text"
              placeholder="Enter subcategory (e.g. Smartwatches, Footwear)"
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              placeholder="Auto-generated or enter SKU (e.g. AW9-MID-45)"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Product Description
            </label>
            <textarea
              rows={4}
              placeholder="Enter comprehensive product overview, warranty, and highlight points..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
            />
          </div>
        </div>
      </div>

      {/* 3. SECTION 2: Pricing & Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            2. Pricing
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Selling Price (₹) <span className="text-[#E63946]">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter selling price (e.g. 39999)"
                value={form.current_price}
                onChange={(e) => handlePriceChange('current_price', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                MRP / Original Price (₹)
              </label>
              <input
                type="number"
                placeholder="Enter MRP (e.g. 44900)"
                value={form.original_price}
                onChange={(e) => handlePriceChange('original_price', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
              />
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl flex items-center justify-between">
              <span className="text-xs text-neutral-500">Auto Calculated Discount:</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {form.discount_percentage}% OFF
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            3. Inventory Control
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Stock Quantity <span className="text-[#E63946]">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter stock quantity (e.g. 25)"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Low Stock Warning Threshold
              </label>
              <input
                type="number"
                placeholder="Threshold (e.g. 5 units)"
                value={form.low_stock_threshold}
                onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) || 5 })}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Publish Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946] cursor-pointer"
              >
                <option value="Active">Active (Public on Store)</option>
                <option value="Draft">Draft (Internal Only)</option>
                <option value="Inactive">Inactive (Archived)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION 3: Product Images Gallery */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          4. Product Images
        </h3>

        <div className="space-y-4">
          {/* Upload Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <input
                type="url"
                placeholder="Enter image URL and click add..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#E63946]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button onClick={handleAddImageUrl} variant="outline" size="sm" icon={Plus}>
                Add URL
              </Button>
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20 cursor-pointer transition-colors shrink-0">
                <Upload className="w-4 h-4" />
                <span>{uploadingImage ? 'Uploading...' : 'Cloudinary Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Images Grid */}
          {form.images.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
              No images added yet. Enter an image URL or upload directly via Cloudinary.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {form.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 aspect-square"
                >
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-contain p-1" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 text-[9px] font-black bg-[#E63946] text-white px-1.5 py-0.5 rounded shadow-xs">
                      COVER
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. SECTION 4: Product Variant System */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              5. Product Variants
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Support options like Color, Size, Storage, RAM, and Custom SKUs.
            </p>
          </div>

          {/* Toggle Button */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => {
                setHasVariants(e.target.checked);
                if (e.target.checked && form.variants.length === 0) {
                  handleAddVariant();
                }
              }}
              className="w-4 h-4 text-[#E63946] rounded focus:ring-[#E63946]"
            />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              This product has variants
            </span>
          </label>
        </div>

        {hasVariants ? (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-500">
                Configured Variants ({form.variants.length})
              </span>
              <Button onClick={handleAddVariant} variant="outline" size="sm" icon={Plus}>
                Add Variant
              </Button>
            </div>

            <div className="space-y-3">
              {form.variants.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-700/60 pb-2">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Variant #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateVariant(idx)}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                        title="Duplicate Variant"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1 rounded text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete Variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Variant Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Midnight 45mm"
                        value={v.name}
                        onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">SKU</label>
                      <input
                        type="text"
                        placeholder="e.g. NIK-BLK-8"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">MRP (₹)</label>
                      <input
                        type="number"
                        placeholder="MRP"
                        value={v.mrp}
                        onChange={(e) => handleVariantChange(idx, 'mrp', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Stock</label>
                      <input
                        type="number"
                        placeholder="Stock"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>

                    {/* Color Management */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1.5">
                        <span>Color Name & Hex</span>
                        {v.color && (
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: v.color }}
                          />
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={v.color || '#000000'}
                          onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          className="w-7 h-7 p-0 border border-neutral-300 dark:border-neutral-700 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="e.g. Midnight Black"
                          value={v.colorName || ''}
                          onChange={(e) => handleVariantChange(idx, 'colorName', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                        />
                      </div>
                    </div>

                    {/* Size Option */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Size</label>
                      <input
                        type="text"
                        placeholder="e.g. UK 9 / 45mm"
                        value={v.size || ''}
                        onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>

                    {/* Storage Option */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Storage</label>
                      <input
                        type="text"
                        placeholder="e.g. 128GB"
                        value={v.storage || ''}
                        onChange={(e) => handleVariantChange(idx, 'storage', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>

                    {/* RAM Option */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">RAM</label>
                      <input
                        type="text"
                        placeholder="e.g. 8GB"
                        value={v.ram || ''}
                        onChange={(e) => handleVariantChange(idx, 'ram', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800/20 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700">
            Variants are currently disabled. This product will be listed as a simple product with single pricing and inventory.
          </div>
        )}
      </div>

      {/* 6. SECTION 5: Dynamic Specifications */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              6. Technical Specifications
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Key-value technical characteristics displayed on the product storefront.
            </p>
          </div>
          <Button onClick={handleAddSpecification} variant="outline" size="sm" icon={Plus}>
            Add Specification
          </Button>
        </div>

        {specList.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800/20 rounded-xl">
            No custom specifications defined yet. Click &quot;Add Specification&quot; above.
          </div>
        ) : (
          <div className="space-y-2.5">
            {specList.map((s, idx) => (
              <div key={s.id || idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Attribute (e.g. Display, Battery, Material)"
                  value={s.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  className="w-1/3 px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 font-semibold"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 6.7 inch Retina OLED, 5000 mAh)"
                  value={s.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. SECTION 6: Shipping & Logistics */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          7. Shipping & Dimensions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Package Weight
            </label>
            <input
              type="text"
              placeholder="e.g. 0.45 kg"
              value={form.shipping?.weight || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  shipping: { ...form.shipping, weight: e.target.value }
                })
              }
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Dimensions (L x W x H)
            </label>
            <input
              type="text"
              placeholder="e.g. 22 x 10 x 5 cm"
              value={form.shipping?.dimensions || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  shipping: { ...form.shipping, dimensions: e.target.value }
                })
              }
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Delivery Eligibility
            </label>
            <input
              type="text"
              placeholder="e.g. Same Day & Express Delivery"
              value={form.shipping?.delivery_eligibility || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  shipping: { ...form.shipping, delivery_eligibility: e.target.value }
                })
              }
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700"
            />
          </div>
        </div>
      </div>

      {/* 8. SECTION 7: Search Engine Optimization (SEO) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          8. Search Engine Optimization (SEO)
        </h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Meta Title
            </label>
            <input
              type="text"
              placeholder="Enter SEO Meta Title (defaults to product name if blank)"
              value={form.seo?.meta_title || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  seo: { ...form.seo, meta_title: e.target.value }
                })
              }
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Meta Description
            </label>
            <textarea
              rows={2}
              placeholder="Enter brief search snippet summary (up to 160 characters)"
              value={form.seo?.meta_description || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  seo: { ...form.seo, meta_description: e.target.value }
                })
              }
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700"
            />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 p-4 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Form validated against CMCart store catalog requirements.</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSubmit('Draft')}
            loading={saving}
            variant="outline"
            size="md"
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('Active')}
            loading={saving}
            variant="primary"
            size="md"
            icon={Save}
          >
            {isEditing ? 'Save Changes' : 'Publish to Store'}
          </Button>
        </div>
      </div>
    </div>
  );
}
