import React, { useState, useEffect } from 'react';
import {
  Layers,
  Flame,
  Sparkles,
  Zap,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Smartphone,
  Monitor,
  X,
  Search,
  Filter,
  Percent,
  Tag,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Package,
  Boxes,
  Sliders,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminHomepageManagerPage() {
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'deals' | 'campaigns'
  const [sections, setSections] = useState([]);
  const [deals, setDeals] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allBanners, setAllBanners] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // SECTION MODAL STATE
  // ==========================================
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    subtitle: '',
    section_type: 'deals',
    layout: 'carousel',
    status: 'active',
    start_at: '',
    end_at: ''
  });

  // ==========================================
  // DEALS MODAL STATE
  // ==========================================
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [dealForm, setDealForm] = useState({
    name: '',
    title: 'Deals of the Day',
    subtitle: 'Unbeatable discounts up to 60% off',
    start_at: '',
    end_at: '',
    status: 'active',
    limit_per_customer: 2,
    promotional_stock: 100,
    deal_badge: 'DEAL',
    products: []
  });

  // Product Catalog Picker Drawer/Modal (Multi-Select)
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');
  const [pickerBrand, setPickerBrand] = useState('all');
  const [pickerStockStatus, setPickerStockStatus] = useState('all');
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  // ==========================================
  // CAMPAIGN MODAL STATE
  // ==========================================
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    display_name: '',
    description: '',
    status: 'active',
    start_at: '',
    end_at: '',
    banner_id: '',
    deal_id: '',
    coupon_code: '',
    category_id: ''
  });

  // ==========================================
  // PREVIEW MODAL STATE
  // ==========================================
  const [previewModalOpen, setShowPreviewModal] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [previewTarget, setPreviewTarget] = useState(null); // { type: 'section' | 'deal' | 'campaign', data: any }

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [secList, dealList, campList, prodList, banList, cpnList, catList] = await Promise.all([
        commerceDb.getHomepageSections({ activeOnly: false }),
        commerceDb.getDeals({ activeOnly: false }),
        commerceDb.getCampaigns(),
        commerceDb.getProducts(),
        commerceDb.getBanners(),
        commerceDb.getCoupons(),
        commerceDb.getCategories()
      ]);
      setSections(secList || []);
      setDeals(dealList || []);
      setCampaigns(campList || []);
      setAllProducts(prodList || []);
      setAllBanners(banList || []);
      setAllCoupons(cpnList || []);
      setAllCategories(catList || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading CMS data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper: Enrich deal product with catalog details so images/names are NEVER blank
  const enrichDealProduct = (dp) => {
    const p = allProducts.find((item) => item.id === (dp.product_id || dp.id)) || {};
    const originalPrice = dp.original_price || p.original_price || p.current_price || 999;
    const discount = dp.discount_percentage ?? (p.discount_percentage || 20);
    const dealPrice = dp.deal_price ?? Math.round(originalPrice * (1 - discount / 100));
    const availableStock = p.stock ?? 25;
    const dealStock = dp.deal_stock ?? Math.min(availableStock, 50);

    return {
      product_id: p.id || dp.product_id,
      product_name: dp.product_name || p.name || 'Catalog Product',
      brand: dp.brand || p.brand || 'CMCart Brand',
      sku: dp.sku || p.sku || 'SKU-CMC-100',
      image_url:
        dp.image_url ||
        p.images?.[0] ||
        p.image_url ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      original_price: originalPrice,
      current_price: p.current_price || originalPrice,
      deal_price: dealPrice,
      discount_percentage: discount,
      available_stock: availableStock,
      deal_stock: dealStock,
      limit_per_customer: dp.limit_per_customer || 2
    };
  };

  // ==========================================
  // SECTION CONTROLS & REORDERING
  // ==========================================
  const handleMoveSection = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const updated = newSections.map((s, idx) => ({ ...s, display_order: idx + 1 }));
    setSections(updated);

    try {
      await commerceDb.reorderHomepageSections(updated);
      showToast('Section order updated!', 'success');
    } catch {
      showToast('Failed to save section order', 'error');
      loadData();
    }
  };

  const handleToggleSectionStatus = async (section) => {
    const nextStatus = section.status === 'active' ? 'disabled' : 'active';
    if (!window.confirm(`Are you sure you want to ${nextStatus === 'active' ? 'activate' : 'deactivate'} "${section.title}"?`)) {
      return;
    }
    try {
      await commerceDb.updateHomepageSection(section.id, { status: nextStatus });
      showToast(`Section ${nextStatus === 'active' ? 'activated' : 'deactivated'}`, 'info');
      loadData();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDuplicateSection = async (id) => {
    try {
      await commerceDb.duplicateHomepageSection(id);
      showToast('Section duplicated as draft', 'success');
      loadData();
    } catch {
      showToast('Failed to duplicate section', 'error');
    }
  };

  const handleDeleteSection = async (section) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${section.title}"?`)) return;
    try {
      await commerceDb.deleteHomepageSection(section.id);
      showToast('Section deleted', 'info');
      loadData();
    } catch {
      showToast('Failed to delete section', 'error');
    }
  };

  const handleOpenSectionModal = (sec = null) => {
    if (sec) {
      setEditingSection(sec);
      setSectionForm({
        title: sec.title,
        subtitle: sec.subtitle || '',
        section_type: sec.section_type,
        layout: sec.layout || 'grid',
        status: sec.status || 'active',
        start_at: sec.start_at ? sec.start_at.substring(0, 16) : '',
        end_at: sec.end_at ? sec.end_at.substring(0, 16) : ''
      });
    } else {
      setEditingSection(null);
      setSectionForm({
        title: '',
        subtitle: '',
        section_type: 'deals',
        layout: 'carousel',
        status: 'active',
        start_at: '',
        end_at: ''
      });
    }
    setShowSectionModal(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) {
      showToast('Section title is required', 'error');
      return;
    }
    try {
      const payload = {
        ...sectionForm,
        start_at: sectionForm.start_at ? new Date(sectionForm.start_at).toISOString() : null,
        end_at: sectionForm.end_at ? new Date(sectionForm.end_at).toISOString() : null
      };

      if (editingSection) {
        await commerceDb.updateHomepageSection(editingSection.id, payload);
        showToast('Section updated successfully', 'success');
      } else {
        await commerceDb.createHomepageSection(payload);
        showToast('New section created successfully', 'success');
      }
      setShowSectionModal(false);
      loadData();
    } catch {
      showToast('Failed to save section', 'error');
    }
  };

  // ==========================================
  // DEALS OF THE DAY LOGIC
  // ==========================================
  const handleOpenDealEditor = (deal = null) => {
    if (deal) {
      setEditingDeal(deal);
      const enrichedProducts = (deal.products || []).map(enrichDealProduct);
      setDealForm({
        name: deal.name || 'Flash Deals',
        title: deal.title || 'Deals of the Day',
        subtitle: deal.subtitle || 'Unbeatable discounts up to 60% off',
        start_at: deal.start_at ? deal.start_at.substring(0, 16) : '',
        end_at: deal.end_at ? deal.end_at.substring(0, 16) : '',
        status: deal.status || 'active',
        limit_per_customer: deal.limit_per_customer || 2,
        promotional_stock: deal.promotional_stock || 100,
        deal_badge: deal.deal_badge || 'DEAL',
        products: enrichedProducts
      });
    } else {
      setEditingDeal(null);
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 3600000);
      // Pre-select 4 top products by default
      const defaultProds = allProducts.slice(0, 4).map((p) =>
        enrichDealProduct({ product_id: p.id, discount_percentage: 25 })
      );

      setDealForm({
        name: 'Weekend Flash Deals',
        title: 'Deals of the Day',
        subtitle: 'Unbeatable discounts up to 60% off',
        start_at: now.toISOString().substring(0, 16),
        end_at: in24h.toISOString().substring(0, 16),
        status: 'active',
        limit_per_customer: 2,
        promotional_stock: 100,
        deal_badge: 'DEAL',
        products: defaultProds
      });
    }
    setShowDealModal(true);
  };

  // Bi-directional price / discount calculator
  const handleDealProductValueChange = (productId, field, value) => {
    setDealForm((prev) => {
      const updated = prev.products.map((p) => {
        if (p.product_id !== productId) return p;
        const mrp = p.original_price;

        if (field === 'discount_percentage') {
          const discount = Math.min(95, Math.max(0, Number(value) || 0));
          const calculatedDealPrice = Math.round(mrp * (1 - discount / 100));
          return { ...p, discount_percentage: discount, deal_price: calculatedDealPrice };
        } else if (field === 'deal_price') {
          const dealPrice = Math.min(mrp, Math.max(1, Number(value) || 0));
          const discount = Math.round(((mrp - dealPrice) / mrp) * 100);
          return { ...p, deal_price: dealPrice, discount_percentage: discount };
        } else if (field === 'deal_stock') {
          const dealStock = Math.min(p.available_stock, Math.max(1, Number(value) || 1));
          return { ...p, deal_stock: dealStock };
        }
        return p;
      });
      return { ...prev, products: updated };
    });
  };

  const handleRemoveDealProduct = (productId) => {
    setDealForm((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.product_id !== productId)
    }));
  };

  // Open Product Picker Drawer
  const handleOpenProductPicker = () => {
    const currentIds = new Set(dealForm.products.map((p) => p.product_id));
    setSelectedProductIds(currentIds);
    setPickerSearch('');
    setPickerCategory('all');
    setPickerBrand('all');
    setShowProductPicker(true);
  };

  const handleTogglePickerSelect = (productId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const handleConfirmProductPicker = () => {
    const existingMap = new Map(dealForm.products.map((p) => [p.product_id, p]));
    const newProductsList = [];

    // Keep existing that are still selected
    selectedProductIds.forEach((id) => {
      if (existingMap.has(id)) {
        newProductsList.push(existingMap.get(id));
      } else {
        const catalogItem = allProducts.find((p) => p.id === id);
        if (catalogItem) {
          newProductsList.push(
            enrichDealProduct({ product_id: catalogItem.id, discount_percentage: 25 })
          );
        }
      }
    });

    setDealForm((prev) => ({ ...prev, products: newProductsList }));
    setShowProductPicker(false);
    showToast(`Updated deal products (${newProductsList.length} items)`, 'success');
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    if (!dealForm.name.trim()) {
      showToast('Deal internal name is required', 'error');
      return;
    }
    if (dealForm.products.length === 0) {
      showToast('Please add at least one product to the deal', 'error');
      return;
    }

    try {
      const payload = {
        ...dealForm,
        start_at: dealForm.start_at ? new Date(dealForm.start_at).toISOString() : new Date().toISOString(),
        end_at: dealForm.end_at ? new Date(dealForm.end_at).toISOString() : new Date(Date.now() + 24 * 3600000).toISOString()
      };

      if (editingDeal) {
        await commerceDb.updateDeal(editingDeal.id, payload);
        showToast('Deal updated successfully!', 'success');
      } else {
        await commerceDb.createDeal(payload);
        showToast('New deal created successfully!', 'success');
      }
      setShowDealModal(false);
      loadData();
    } catch {
      showToast('Failed to save deal', 'error');
    }
  };

  const handleDeleteDeal = async (deal) => {
    if (!window.confirm(`Are you sure you want to delete deal "${deal.name}"?`)) return;
    try {
      await commerceDb.deleteDeal(deal.id);
      showToast('Deal deleted', 'info');
      loadData();
    } catch {
      showToast('Failed to delete deal', 'error');
    }
  };

  // ==========================================
  // CAMPAIGNS LOGIC
  // ==========================================
  const handleOpenCampaignModal = (camp = null) => {
    if (camp) {
      setEditingCampaign(camp);
      setCampaignForm({
        name: camp.name || '',
        display_name: camp.display_name || camp.name || '',
        description: camp.description || '',
        status: camp.status || 'active',
        start_at: camp.start_at ? camp.start_at.substring(0, 16) : '',
        end_at: camp.end_at ? camp.end_at.substring(0, 16) : '',
        banner_id: camp.banner_id || (allBanners[0]?.id || ''),
        deal_id: camp.deal_id || (deals[0]?.id || ''),
        coupon_code: camp.coupon_code || (allCoupons[0]?.code || ''),
        category_id: camp.category_id || (allCategories[0]?.id || '')
      });
    } else {
      setEditingCampaign(null);
      const now = new Date();
      const in7d = new Date(now.getTime() + 7 * 24 * 3600000);
      setCampaignForm({
        name: 'Diwali Mega Shopping Festival',
        display_name: 'Festival Mega Sale',
        description: 'Complete storefront promotional blitz with hero banner, 60% flash deals, and festive vouchers.',
        status: 'active',
        start_at: now.toISOString().substring(0, 16),
        end_at: in7d.toISOString().substring(0, 16),
        banner_id: allBanners[0]?.id || '',
        deal_id: deals[0]?.id || '',
        coupon_code: allCoupons[0]?.code || 'BIGSAVER15',
        category_id: allCategories[0]?.id || 'cat-electronics'
      });
    }
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.name.trim()) {
      showToast('Campaign name is required', 'error');
      return;
    }
    if (!campaignForm.start_at || !campaignForm.end_at) {
      showToast('Schedule start and end dates are required', 'error');
      return;
    }
    if (new Date(campaignForm.end_at) <= new Date(campaignForm.start_at)) {
      showToast('Campaign end date must be after start date', 'error');
      return;
    }

    try {
      const payload = {
        ...campaignForm,
        start_at: new Date(campaignForm.start_at).toISOString(),
        end_at: new Date(campaignForm.end_at).toISOString()
      };

      if (editingCampaign) {
        await commerceDb.updateCampaign(editingCampaign.id, payload);
        showToast('Campaign updated successfully!', 'success');
      } else {
        await commerceDb.createCampaign(payload);
        showToast('Campaign published successfully!', 'success');
      }
      setShowCampaignModal(false);
      loadData();
    } catch {
      showToast('Failed to save campaign', 'error');
    }
  };

  const handleDeleteCampaign = async (camp) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${camp.name}"?`)) return;
    try {
      await commerceDb.deleteCampaign(camp.id);
      showToast('Campaign removed', 'info');
      loadData();
    } catch {
      showToast('Failed to remove campaign', 'error');
    }
  };

  // ==========================================
  // STOREFRONT PREVIEW
  // ==========================================
  const handleOpenPreview = (type, data = null) => {
    setPreviewTarget({ type, data });
    setShowPreviewModal(true);
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>;
      case 'scheduled':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">SCHEDULED</span>;
      case 'expired':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">EXPIRED</span>;
      case 'disabled':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">DISABLED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">DRAFT</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#181818] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
              Homepage Management
            </h1>
            <span className="bg-[#EF3340]/10 text-[#EF3340] text-xs font-bold px-2 py-0.5 rounded-full">
              CMS Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure dynamic homepage layout, flash deals, promotional scheduling and campaign blitzes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenPreview('full')}
            className="flex items-center gap-2 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold px-3.5 py-2 rounded-xl cursor-pointer"
          >
            <Eye className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span>Storefront Preview</span>
          </Button>

          {activeTab === 'sections' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenSectionModal(null)}
              className="flex items-center gap-1.5 bg-[#EF3340] hover:bg-[#D92332] text-white font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Section</span>
            </Button>
          )}

          {activeTab === 'deals' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenDealEditor(null)}
              className="flex items-center gap-1.5 bg-[#EF3340] hover:bg-[#D92332] text-white font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Deal</span>
            </Button>
          )}

          {activeTab === 'campaigns' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCampaignModal(null)}
              className="flex items-center gap-1.5 bg-[#EF3340] hover:bg-[#D92332] text-white font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs (Clean CMCart Red Selected Tab) */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'sections'
              ? 'bg-[#EF3340] text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Homepage Sections ({sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'deals'
              ? 'bg-[#EF3340] text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Deals of the Day ({deals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-[#EF3340] text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Campaigns ({campaigns.length})</span>
        </button>
      </div>

      {/* ==================================================
          TAB 1: HOMEPAGE SECTIONS PIPELINE
          ================================================== */}
      {activeTab === 'sections' && (
        <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Active Storefront Section Order
              </h2>
              <p className="text-xs text-neutral-500">
                Reorder sections using the arrows. The customer storefront updates dynamically.
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-colors"
              >
                {/* Left: Reorder & Info */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0 bg-neutral-50 dark:bg-neutral-800/60 p-1.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveSection(index, 'up')}
                      className={`p-1 rounded-md transition-colors ${
                        index === 0
                          ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                          : 'text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                      {section.display_order}
                    </span>
                    <button
                      disabled={index === sections.length - 1}
                      onClick={() => handleMoveSection(index, 'down')}
                      className={`p-1 rounded-md transition-colors ${
                        index === sections.length - 1
                          ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                          : 'text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                        {section.title}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {section.section_type.replace('_', ' ')}
                      </span>
                      {getStatusBadge(section.dynamicStatus || section.status)}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {section.subtitle || 'No subtitle configured'} · Layout:{' '}
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300 capitalize">
                        {section.layout || 'grid'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPreview('section', section)}
                    className="p-2 sm:px-3 text-xs"
                    title="Preview Section"
                  >
                    <Eye className="w-3.5 h-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSectionModal(section)}
                    className="p-2 sm:px-3 text-xs"
                    title="Edit Section"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateSection(section.id)}
                    className="p-2 text-xs"
                    title="Duplicate Section"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>

                  <button
                    onClick={() => handleToggleSectionStatus(section)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      section.status === 'active'
                        ? 'border-neutral-200 hover:bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {section.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDeleteSection(section)}
                    className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================
          TAB 2: DEALS OF THE DAY
          ================================================== */}
      {activeTab === 'deals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {deals.map((deal) => {
              const enriched = (deal.products || []).map(enrichDealProduct);
              const endsInHours = Math.max(
                0,
                Math.round((new Date(deal.end_at).getTime() - Date.now()) / 3600000)
              );
              return (
                <div
                  key={deal.id}
                  className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-black tracking-wider bg-[#EF3340] text-white">
                        [{deal.deal_badge || 'DEAL'}]
                      </span>
                      {getStatusBadge(deal.dynamicStatus || deal.status)}
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                      {deal.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4 line-clamp-1">
                      {deal.subtitle}
                    </p>

                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 space-y-2 mb-4 text-xs">
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Configured Products:</span>
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {enriched.length} items
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Max per customer:</span>
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {deal.limit_per_customer || 2} units
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Promotional Stock:</span>
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {deal.promotional_stock || 100} units
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Time Remaining:</span>
                        <span className="font-bold text-[#EF3340]">
                          {endsInHours > 0 ? `~${endsInHours} hours left` : 'Expired'}
                        </span>
                      </div>
                    </div>

                    {/* Mini thumbnails preview */}
                    <div className="flex items-center gap-2 mb-4 overflow-hidden">
                      {enriched.slice(0, 4).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image_url}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-100"
                        />
                      ))}
                      {enriched.length > 4 && (
                        <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 w-10 h-10 rounded-lg flex items-center justify-center">
                          +{enriched.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPreview('deal', deal)}
                      className="text-xs p-2"
                      title="Preview Deal"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenDealEditor(deal)}
                      className="flex-1 text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      <span>Configure Deal</span>
                    </Button>
                    <button
                      onClick={() => handleDeleteDeal(deal)}
                      className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete Deal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================
          TAB 3: CAMPAIGNS MANAGER
          ================================================== */}
      {activeTab === 'campaigns' && (
        <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Scheduled Marketing Campaigns
              </h2>
              <p className="text-xs text-neutral-500">
                Coordinated promotional blitzes uniting Hero Banners, Deals, Coupons, and targeted Categories.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCampaignModal(null)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Campaign</span>
            </Button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {campaigns.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                No active campaigns created yet. Click "+ Create Campaign" above.
              </div>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                        {camp.name}
                      </h3>
                      {getStatusBadge(camp.dynamicStatus || camp.status)}
                    </div>
                    <p className="text-xs text-neutral-500 max-w-xl">
                      {camp.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-200">
                        <Calendar className="w-3.5 h-3.5 text-[#EF3340]" />
                        {new Date(camp.start_at).toLocaleDateString('en-IN')} – {new Date(camp.end_at).toLocaleDateString('en-IN')}
                      </span>
                      <span>·</span>
                      <span className="text-[11px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">
                        Coupon: {camp.coupon_code || 'FESTIVE20'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPreview('campaign', camp)}
                      className="text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>Preview</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCampaignModal(camp)}
                      className="text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>
                    <button
                      onClick={() => handleDeleteCampaign(camp)}
                      className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL: CONFIGURE DEAL OF THE DAY (5 Structured Sections)
          ================================================== */}
      {showDealModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-[#181818] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {editingDeal ? 'Configure Deal of the Day' : 'Create New Deal Campaign'}
                </h2>
                <p className="text-xs text-neutral-500">
                  Real product images, bi-directional pricing, limits, and live countdown timer.
                </p>
              </div>
              <button
                onClick={() => setShowDealModal(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveDeal} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  1. Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Deal Internal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={dealForm.name}
                      onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                      placeholder="e.g. Weekend Mega Deals"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Customer Display Title
                    </label>
                    <input
                      type="text"
                      value={dealForm.title}
                      onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                      placeholder="e.g. Deals of the Day"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Subtitle / Promotional Tagline
                    </label>
                    <input
                      type="text"
                      value={dealForm.subtitle}
                      onChange={(e) => setDealForm({ ...dealForm, subtitle: e.target.value })}
                      placeholder="e.g. Unbeatable discounts up to 60% off"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Deal Badge Label
                    </label>
                    <select
                      value={dealForm.deal_badge}
                      onChange={(e) => setDealForm({ ...dealForm, deal_badge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs font-bold"
                    >
                      <option value="DEAL">[ DEAL ]</option>
                      <option value="BESTSELLER">[ BESTSELLER ]</option>
                      <option value="LIMITED TIME">[ LIMITED TIME ]</option>
                      <option value="HOT DEAL">[ HOT DEAL ]</option>
                      <option value="TRENDING">[ TRENDING ]</option>
                      <option value="EXCLUSIVE">[ EXCLUSIVE ]</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Customer Limits */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  2. Customer Limits & Inventory Cap
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Max Qty Per Customer
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={dealForm.limit_per_customer}
                      onChange={(e) =>
                        setDealForm({ ...dealForm, limit_per_customer: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Total Promotional Stock
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={dealForm.promotional_stock}
                      onChange={(e) =>
                        setDealForm({ ...dealForm, promotional_stock: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Countdown Schedule */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  3. Live Countdown Schedule
                </h3>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={dealForm.start_at}
                        onChange={(e) => setDealForm({ ...dealForm, start_at: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={dealForm.end_at}
                        onChange={(e) => setDealForm({ ...dealForm, end_at: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Deal Products (With Images & Dynamic Details) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    4. Deal Products ({dealForm.products.length} Selected)
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenProductPicker}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Products from Catalog</span>
                  </Button>
                </div>

                {dealForm.products.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center">
                    <Package className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-medium">
                      No products in this deal yet. Click "+ Add Products from Catalog" above.
                    </p>
                  </div>
                ) : (
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
                    {dealForm.products.map((item) => (
                      <div
                        key={item.product_id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1a1a1a] hover:bg-neutral-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Image with fallback */}
                          <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-neutral-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {item.brand} · <span className="font-mono text-neutral-400">SKU: {item.sku}</span>
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              MRP: ₹{item.original_price?.toLocaleString('en-IN')} · Avail Stock: {item.available_stock}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Pricing and Stock Input Controls */}
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="block text-[10px] text-neutral-400 font-semibold uppercase text-center">
                                Discount %
                              </span>
                              <input
                                type="number"
                                min="1"
                                max="95"
                                value={item.discount_percentage}
                                onChange={(e) =>
                                  handleDealProductValueChange(item.product_id, 'discount_percentage', e.target.value)
                                }
                                className="w-16 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-center"
                              />
                            </div>

                            <div>
                              <span className="block text-[10px] text-neutral-400 font-semibold uppercase text-center">
                                Deal Price (₹)
                              </span>
                              <input
                                type="number"
                                min="1"
                                max={item.original_price}
                                value={item.deal_price}
                                onChange={(e) =>
                                  handleDealProductValueChange(item.product_id, 'deal_price', e.target.value)
                                }
                                className="w-24 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-[#EF3340] text-center"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveDealProduct(item.product_id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove from deal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 5: Mini Storefront Preview */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
                  5. Storefront Customer Preview Summary
                </span>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  <span className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#EF3340] text-white text-[10px]">
                      [{dealForm.deal_badge}]
                    </span>
                    <span>{dealForm.title}</span>
                  </span>
                  <span className="font-mono text-[#EF3340]">Ends in: 23:59:59</span>
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
                <Button type="button" variant="outline" onClick={() => setShowDealModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingDeal ? 'Update Deal' : 'Publish Deal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL: PRODUCT SELECTION FROM CATALOG (Multi-Select)
          ================================================== */}
      {showProductPicker && (
        <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-[#181818] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                  Select Products from Catalog
                </h3>
                <p className="text-xs text-neutral-500">
                  Check items to include in this deal. Multi-selection supported.
                </p>
              </div>
              <button
                onClick={() => setShowProductPicker(false)}
                className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU or brand..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs"
                />
              </div>

              <div>
                <select
                  value={pickerCategory}
                  onChange={(e) => setPickerCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Checkbox List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {allProducts
                .filter((p) => {
                  const matchSearch =
                    !pickerSearch ||
                    p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                    p.brand?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                    p.sku?.toLowerCase().includes(pickerSearch.toLowerCase());
                  const matchCat = pickerCategory === 'all' || p.category_id === pickerCategory;
                  return matchSearch && matchCat;
                })
                .map((product) => {
                  const isChecked = selectedProductIds.has(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleTogglePickerSelect(product.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-[#EF3340] bg-red-50/40 dark:bg-red-950/20'
                          : 'border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by row onClick
                          className="w-4 h-4 rounded border-neutral-300 text-[#EF3340] focus:ring-[#EF3340] cursor-pointer shrink-0"
                        />
                        <img
                          src={product.images?.[0] || product.image_url}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg shrink-0 border border-neutral-200 dark:border-neutral-700"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            {product.brand} · MRP: ₹{product.current_price?.toLocaleString('en-IN')} · Stock: {product.stock}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          isChecked ? 'bg-[#EF3340] text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {isChecked ? 'SELECTED' : 'SELECT'}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Picker Footer */}
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium">
                {selectedProductIds.size} products selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowProductPicker(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirmProductPicker}>
                  Add Selected Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL: CREATE / EDIT CAMPAIGN
          ================================================== */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-[#181818] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-scale-up">
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {editingCampaign ? 'Edit Marketing Campaign' : 'Create New Campaign'}
                </h2>
                <p className="text-xs text-neutral-500">
                  Unify Hero Banners, Deals, Coupons, and start/end scheduling.
                </p>
              </div>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Campaign Internal Name *
                </label>
                <input
                  type="text"
                  required
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="e.g. Diwali Mega Festival"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Customer Display Name
                </label>
                <input
                  type="text"
                  value={campaignForm.display_name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, display_name: e.target.value })}
                  placeholder="e.g. Festival Mega Sale"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Marketing Objective
                </label>
                <textarea
                  rows="2"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  placeholder="Describe the offer blitz and featured departments..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={campaignForm.start_at}
                    onChange={(e) => setCampaignForm({ ...campaignForm, start_at: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={campaignForm.end_at}
                    onChange={(e) => setCampaignForm({ ...campaignForm, end_at: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>

              {/* Campaign Attachments */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                  Campaign Attachments
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Attached Hero Banner</label>
                    <select
                      value={campaignForm.banner_id}
                      onChange={(e) => setCampaignForm({ ...campaignForm, banner_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                    >
                      {allBanners.map((b) => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Attached Deal of the Day</label>
                    <select
                      value={campaignForm.deal_id}
                      onChange={(e) => setCampaignForm({ ...campaignForm, deal_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                    >
                      {deals.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.products?.length || 0} items)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Attached Coupon Code</label>
                    <select
                      value={campaignForm.coupon_code}
                      onChange={(e) => setCampaignForm({ ...campaignForm, coupon_code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                    >
                      {allCoupons.map((c) => (
                        <option key={c.id} value={c.code}>{c.code} - {c.description}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Target Category Focus</label>
                    <select
                      value={campaignForm.category_id}
                      onChange={(e) => setCampaignForm({ ...campaignForm, category_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                    >
                      {allCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button type="button" variant="outline" onClick={() => setShowCampaignModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingCampaign ? 'Update Campaign' : 'Publish Campaign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL: STOREFRONT LIVE PREVIEW (Desktop & Mobile)
          ================================================== */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-5xl h-[92vh] bg-[#F7F7F7] dark:bg-[#121212] rounded-2xl flex flex-col overflow-hidden border border-neutral-800 shadow-2xl">
            {/* Toolbar */}
            <div className="bg-white dark:bg-[#1a1a1a] px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-400">
                  Storefront Preview:
                </span>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {previewTarget?.data?.name || previewTarget?.data?.title || 'Live Storefront Layout'}
                </span>
              </div>

              {/* Switch Viewports */}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    previewMode === 'desktop'
                      ? 'bg-white dark:bg-[#262626] text-[#EF3340] shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    previewMode === 'mobile'
                      ? 'bg-white dark:bg-[#262626] text-[#EF3340] shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewport Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-start justify-center bg-neutral-200/50 dark:bg-neutral-950">
              <div
                className={`bg-white dark:bg-[#181818] shadow-xl rounded-2xl overflow-hidden transition-all duration-300 ${
                  previewMode === 'desktop' ? 'w-full max-w-4xl' : 'w-[380px] max-w-full'
                }`}
              >
                {/* Storefront Simulated Header */}
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-[#EF3340]">CMCart</span>
                  </div>
                  <div className="text-xs text-neutral-400">Customer Storefront Preview</div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Deals Card */}
                  <div className="bg-white dark:bg-[#1f1f1f] p-4 rounded-xl border border-neutral-200 dark:border-neutral-850 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#EF3340] text-white text-[10px] font-black">
                            [{previewTarget?.data?.deal_badge || 'DEAL'}]
                          </span>
                          <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                            {previewTarget?.data?.title || 'Deals of the Day'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {previewTarget?.data?.subtitle || 'Unbeatable discounts up to 60% off'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#EF3340]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Ends in: 23:48:12</span>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className={`grid gap-3 ${previewMode === 'desktop' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                      {(previewTarget?.data?.products || allProducts.slice(0, 4)).map((p) => {
                        const item = enrichDealProduct(p);
                        return (
                          <div
                            key={item.product_id}
                            className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900"
                          >
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-28 object-cover rounded-lg mb-2 bg-neutral-200"
                            />
                            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                              {item.product_name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-black text-[#EF3340]">
                                ₹{item.deal_price?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-neutral-400 line-through">
                                ₹{item.original_price?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            <div className="p-3 bg-white dark:bg-[#1a1a1a] border-t border-neutral-200 dark:border-neutral-800 flex justify-end shrink-0">
              <Button variant="primary" size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
