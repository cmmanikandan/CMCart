import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  RefreshCw,
  Save,
  CheckCircle2,
  Database,
  Cloud,
  Key,
  Flame,
  Zap,
  Plus,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Code,
  Lock,
  Layers,
  Clock,
  Activity,
  Sliders,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Trash2,
  RotateCw,
  BookOpen,
  Info,
  Eye,
  EyeOff,
  Upload,
  FileUp,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function AdminSettingsPage() {
  const { showToast } = useToast();

  // General Store Configuration States
  const [storeName, setStoreName] = useState('CMCart Technologies India');
  const [supportEmail, setSupportEmail] = useState('operations@cmcart.com');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(99);
  const [taxRate, setTaxRate] = useState(18);
  const [enableRazorpay, setEnableRazorpay] = useState(true);
  const [enableCod, setEnableCod] = useState(true);
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // ==========================================
  // DEVELOPER & API KEY STATES
  // ==========================================
  const [apiKeys, setApiKeys] = useState([
    {
      id: 'key-insights-01',
      application: 'CMCart Insights',
      purpose: 'Sales analytics, data mining and sales prediction',
      environment: 'Production',
      status: 'active',
      apiKey: 'cm_live_7f8a9e2b1c4d5e6f7a8b9c0d1e2f3a4',
      rawSecret: 'sec_live_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4',
      maskedSecret: 'sec_live_••••••••••••••••••••••••3a4b',
      permissions: [
        'orders:read',
        'products:read',
        'categories:read',
        'customers:read',
        'inventory:read',
        'analytics:read'
      ],
      created: '07 Oct 2026',
      lastUsed: '2 minutes ago',
      requestsToday: 1248
    }
  ]);

  // Modal Control States
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showKeyGeneratedModal, setShowKeyGeneratedModal] = useState(false);
  const [showManageKeysModal, setShowManageKeysModal] = useState(false);
  const [showKeyDetailModal, setShowKeyDetailModal] = useState(false);
  const [selectedKeyForDetail, setSelectedKeyForDetail] = useState(null);
  const [showRevokeConfirmModal, setShowRevokeConfirmModal] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Detail Modal Secret Visibility & Copy States
  const [revealDetailSecret, setRevealDetailSecret] = useState(false);
  const [copiedDetailKey, setCopiedDetailKey] = useState(false);
  const [copiedDetailSecret, setCopiedDetailSecret] = useState(false);

  // Create Key Form State
  const [newAppName, setNewAppName] = useState('');
  const [newAppPurpose, setNewAppPurpose] = useState('');
  const [newAppEnv, setNewAppEnv] = useState('Production');
  const [newAppPermissions, setNewAppPermissions] = useState({
    'orders:read': true,
    'products:read': true,
    'categories:read': true,
    'customers:read': true,
    'inventory:read': true,
    'analytics:read': true,
    'orders:write': false,
    'products:write': false,
    'inventory:write': false
  });

  // Newly Generated Credentials (displayed only once)
  const [newCredentials, setNewCredentials] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // API Activity Logs (Live Simulation)
  const [apiActivityLogs] = useState([
    { time: '14:32:10', app: 'CMCart Insights', endpoint: '/api/v1/orders', method: 'GET', status: 200, latency: '18ms' },
    { time: '14:31:55', app: 'CMCart Insights', endpoint: '/api/v1/products', method: 'GET', status: 200, latency: '24ms' },
    { time: '14:30:12', app: 'CMCart Insights', endpoint: '/api/v1/customers', method: 'GET', status: 200, latency: '15ms' },
    { time: '14:28:40', app: 'CMCart Insights', endpoint: '/api/v1/categories', method: 'GET', status: 200, latency: '12ms' },
    { time: '14:26:05', app: 'CMCart Insights', endpoint: '/api/v1/analytics/sales', method: 'GET', status: 200, latency: '32ms' }
  ]);

  // Live Dataset Management State
  const [datasets, setDatasets] = useState(() => commerceDb.getDatasets());
  const [datasetOverlayActive, setDatasetOverlayActive] = useState(() => commerceDb.isDatasetOverlayEnabled());
  const activeDataset = datasets.find(d => d.isActive) || null;

  useEffect(() => {
    const handleUpdate = () => {
      const updated = commerceDb.getDatasets();
      setDatasets(updated);
      setDatasetOverlayActive(commerceDb.isDatasetOverlayEnabled());
    };
    window.addEventListener('cmcart_dataset_updated', handleUpdate);
    return () => window.removeEventListener('cmcart_dataset_updated', handleUpdate);
  }, []);

  const handleToggleDatasetOverlay = () => {
    const nextVal = !datasetOverlayActive;
    commerceDb.setDatasetOverlayEnabled(nextVal);
    setDatasetOverlayActive(nextVal);
    setDatasets(commerceDb.getDatasets());
    if (nextVal) {
      showToast('Production Dataset Overlay ON: Using uploaded/simulation dataset.', 'success');
    } else {
      showToast('Production Dataset Overlay OFF: Operating in Pure Live Database Mode (simulated data disabled).', 'info');
    }
  };

  const [showUploadDatasetModal, setShowUploadDatasetModal] = useState(false);
  const [uploadDatasetName, setUploadDatasetName] = useState('');
  const [uploadDatasetDesc, setUploadDatasetDesc] = useState('');
  const [uploadParsedData, setUploadParsedData] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [showDeleteDatasetModal, setShowDeleteDatasetModal] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Admin store configurations saved successfully!', 'success');
  };

  const handleResetDatabase = () => {
    if (window.confirm('This will clear all datasets and reset the store to a clean empty state. All uploaded datasets will be removed. Continue?')) {
      commerceDb.purgeAllData();
      localStorage.removeItem('cmcart_cart_items_v2');
      localStorage.removeItem('cmcart_wishlist_v1');
      setDatasets([]);
      setDatasetOverlayActive(false);
      showToast('Store reset to clean empty state. Upload a dataset to get started.', 'info');
    }
  };

  // Generate Key Flow
  const handleOpenCreateKey = () => {
    setNewAppName('CMCart Insights');
    setNewAppPurpose('Sales analytics, data mining and sales prediction');
    setNewAppEnv('Production');
    setNewAppPermissions({
      'orders:read': true,
      'products:read': true,
      'categories:read': true,
      'customers:read': true,
      'inventory:read': true,
      'analytics:read': true,
      'orders:write': false,
      'products:write': false,
      'inventory:write': false
    });
    setShowCreateKeyModal(true);
  };

  const handleGenerateKeySubmit = (e) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppPurpose.trim()) {
      showToast('Please provide both application name and purpose', 'error');
      return;
    }

    const randomHex = (len) => {
      const chars = '0123456789abcdef';
      let res = '';
      for (let i = 0; i < len; i++) {
        res += chars[Math.floor(Math.random() * chars.length)];
      }
      return res;
    };

    const generatedKey = `cm_${newAppEnv === 'Production' ? 'live' : 'test'}_${randomHex(28)}`;
    const generatedSecret = `sec_${newAppEnv === 'Production' ? 'live' : 'test'}_${randomHex(32)}`;

    const grantedPermissions = Object.entries(newAppPermissions)
      .filter(([_, granted]) => granted)
      .map(([scope]) => scope);

    const newKeyRecord = {
      id: `key-${Date.now()}`,
      application: newAppName.trim(),
      purpose: newAppPurpose.trim(),
      environment: newAppEnv,
      status: 'active',
      apiKey: generatedKey,
      rawSecret: generatedSecret,
      maskedSecret: `sec_${newAppEnv === 'Production' ? 'live' : 'test'}_••••••••••••••••••••••••${generatedSecret.slice(-4)}`,
      permissions: grantedPermissions,
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastUsed: 'Just now',
      requestsToday: 0
    };

    setNewCredentials({
      application: newAppName.trim(),
      purpose: newAppPurpose.trim(),
      environment: newAppEnv,
      apiKey: generatedKey,
      apiSecret: generatedSecret
    });

    setApiKeys((prev) => [newKeyRecord, ...prev]);
    setShowCreateKeyModal(false);
    setShowKeyGeneratedModal(true);
    showToast('API Key generated successfully!', 'success');
  };

  const handleDownloadCredentials = () => {
    if (!newCredentials) return;
    const credData = {
      application: newCredentials.application,
      environment: newCredentials.environment.toLowerCase(),
      api_key: newCredentials.apiKey,
      api_secret: newCredentials.apiSecret
    };

    const blob = new Blob([JSON.stringify(credData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${newCredentials.application.toLowerCase().replace(/[^a-z0-9]/g, '-')}-api-credentials.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Credentials JSON file downloaded', 'success');
  };

  const handleDownloadKeyCredentials = (key) => {
    if (!key) return;
    const credData = {
      application: key.application,
      environment: (key.environment || 'production').toLowerCase(),
      api_key: key.apiKey,
      api_secret: key.rawSecret || (key.apiKey ? key.apiKey.replace(/^cm_/, 'sec_') : 'sec_live_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4')
    };

    const blob = new Blob([JSON.stringify(credData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key.application.toLowerCase().replace(/[^a-z0-9]/g, '-')}-api-credentials.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded credentials JSON for ${key.application}!`, 'success');
  };

  const handleCopyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
    showToast(`Copied ${type === 'key' ? 'API Key' : 'API Secret'} to clipboard!`, 'info');
  };

  const handleCopyDetailText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedDetailKey(true);
      setTimeout(() => setCopiedDetailKey(false), 2000);
    } else {
      setCopiedDetailSecret(true);
      setTimeout(() => setCopiedDetailSecret(false), 2000);
    }
    showToast(`Copied ${type === 'key' ? 'API Key' : 'API Secret'} to clipboard!`, 'info');
  };

  const handleToggleKeyStatus = (keyId) => {
    setApiKeys((prev) =>
      prev.map((k) => {
        if (k.id === keyId) {
          const nextStatus = k.status === 'active' ? 'disabled' : 'active';
          showToast(`API Key ${nextStatus === 'active' ? 'activated' : 'disabled'}`, 'info');
          return { ...k, status: nextStatus };
        }
        return k;
      })
    );
    if (selectedKeyForDetail && selectedKeyForDetail.id === keyId) {
      setSelectedKeyForDetail((prev) => ({
        ...prev,
        status: prev.status === 'active' ? 'disabled' : 'active'
      }));
    }
  };

  const handleRotateSecret = (keyId) => {
    const randomHex = (len) => {
      const chars = '0123456789abcdef';
      let res = '';
      for (let i = 0; i < len; i++) res += chars[Math.floor(Math.random() * chars.length)];
      return res;
    };
    const newSecret = `sec_live_${randomHex(32)}`;

    setApiKeys((prev) =>
      prev.map((k) => {
        if (k.id === keyId) {
          return {
            ...k,
            rawSecret: newSecret,
            maskedSecret: `sec_live_••••••••••••••••••••••••${newSecret.slice(-4)}`
          };
        }
        return k;
      })
    );

    const targetKey = apiKeys.find((k) => k.id === keyId);
    setNewCredentials({
      application: targetKey?.application || 'CMCart Insights',
      purpose: targetKey?.purpose || 'Rotated secret',
      environment: targetKey?.environment || 'Production',
      apiKey: targetKey?.apiKey || 'cm_live_rotated',
      apiSecret: newSecret
    });
    if (selectedKeyForDetail && selectedKeyForDetail.id === keyId) {
      setSelectedKeyForDetail((prev) => ({
        ...prev,
        rawSecret: newSecret,
        maskedSecret: `sec_live_••••••••••••••••••••••••${newSecret.slice(-4)}`
      }));
    }
    setShowKeyDetailModal(false);
    setShowKeyGeneratedModal(true);
    showToast('API Secret rotated successfully! Save your new secret now.', 'success');
  };

  const handleOpenRevokeConfirm = (key) => {
    setKeyToRevoke(key);
    setShowRevokeConfirmModal(true);
  };

  const handleExecuteRevoke = () => {
    if (!keyToRevoke) return;
    setApiKeys((prev) => prev.filter((k) => k.id !== keyToRevoke.id));
    setShowRevokeConfirmModal(false);
    setShowKeyDetailModal(false);
    showToast(`API Key for "${keyToRevoke.application}" revoked immediately`, 'info');
    setKeyToRevoke(null);
  };

  // Dataset Management Handlers
  const handleDownloadMasterTemplate = () => {
    const template = commerceDb.getMasterTemplate();
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cmcart-master-dataset-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded master dataset template (.json)', 'success');
  };

  const handleExportDataset = (ds) => {
    if (!ds) return;
    const exportData = ds.data || commerceDb.getMasterTemplate();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ds.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dataset.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported "${ds.name}" dataset JSON!`, 'success');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const dataPayload = parsed.data || parsed;
        const productsCount = Array.isArray(dataPayload.products) ? dataPayload.products.length : 0;
        const ordersCount = Array.isArray(dataPayload.orders) ? dataPayload.orders.length : 0;
        const categoriesCount = Array.isArray(dataPayload.categories) ? dataPayload.categories.length : 0;
        const revenue = Array.isArray(dataPayload.orders)
          ? dataPayload.orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
          : 0;

        if (productsCount === 0 && ordersCount === 0 && categoriesCount === 0) {
          setUploadError('JSON does not contain valid "products", "orders", or "categories" arrays.');
          setUploadParsedData(null);
          setUploadStats(null);
          return;
        }

        setUploadParsedData(dataPayload);
        setUploadStats({
          products: productsCount,
          orders: ordersCount,
          categories: categoriesCount,
          revenue
        });
        if (!uploadDatasetName) {
          const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setUploadDatasetName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
        }
      } catch (err) {
        setUploadError('Invalid JSON format: ' + err.message);
        setUploadParsedData(null);
        setUploadStats(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmUploadDataset = (e) => {
    e?.preventDefault();
    if (!uploadParsedData) {
      showToast('Please select a valid dataset JSON file first', 'error');
      return;
    }
    setIsUploading(true);
    try {
      const created = commerceDb.uploadDataset({
        name: uploadDatasetName.trim() || 'Uploaded Live Dataset',
        description: uploadDatasetDesc.trim() || 'Custom live store dataset',
        data: uploadParsedData
      });
      setDatasets(commerceDb.getDatasets());
      setShowUploadDatasetModal(false);
      setUploadParsedData(null);
      setUploadStats(null);
      setUploadDatasetName('');
      setUploadDatasetDesc('');
      showToast(`Activated live dataset "${created.name}"!`, 'success');
    } catch (e) {
      showToast('Failed to import dataset: ' + e.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSwitchDataset = (id) => {
    commerceDb.activateDataset(id);
    setDatasets(commerceDb.getDatasets());
    showToast('Switched active live dataset!', 'success');
  };

  const handleOpenDeleteDataset = (ds) => {
    setDatasetToDelete(ds);
    setShowDeleteDatasetModal(true);
  };

  const handleConfirmDeleteDataset = () => {
    if (!datasetToDelete) return;
    commerceDb.deleteDataset(datasetToDelete.id);
    setDatasets(commerceDb.getDatasets());
    setShowDeleteDatasetModal(false);
    showToast(`Dataset "${datasetToDelete.name}" removed!`, 'info');
    setDatasetToDelete(null);
  };

  const handleConfirmPurge = () => {
    commerceDb.purgeAllData();
    setDatasets([]);
    setDatasetOverlayActive(false);
    setShowPurgeModal(false);
    showToast('Store purged to clean slate (0 records). Upload a dataset to populate the store.', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#EF3340]">
          PLATFORM CONFIG
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
          Store Operations Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Global checkout parameters, tax rates, payment gateways and storage controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. General Store Identity */}
        <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Store Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-semibold text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        </div>

        {/* 2. Shipping & Tax Rules */}
        <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Shipping & Taxes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={standardDeliveryFee}
                onChange={(e) => setStandardDeliveryFee(Number(e.target.value))}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                GST Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment & Operations Toggles */}
        <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Store Operations & Gateway Toggles
          </h3>

          <div className="space-y-3">
            {/* Toggle 1: Razorpay */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/40">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  UPI & Online Payments (Razorpay Ready)
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Direct instant checkout via debit/credit cards, UPI and Net Banking
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enableRazorpay}
                onClick={() => setEnableRazorpay(!enableRazorpay)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableRazorpay ? 'bg-[#EF3340]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    enableRazorpay ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: COD */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/40">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Cash on Delivery (COD)
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Allow customers to pay physical cash upon package handover
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enableCod}
                onClick={() => setEnableCod(!enableCod)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableCod ? 'bg-[#EF3340]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    enableCod ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Auto Confirm */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/40">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Auto-Confirm Paid Orders
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Instantly move paid orders from Pending to Confirmed pipeline stage
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoConfirmOrders}
                onClick={() => setAutoConfirmOrders(!autoConfirmOrders)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoConfirmOrders ? 'bg-[#EF3340]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    autoConfirmOrders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: Low Stock Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/40">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Automated Low Stock Alerts
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Notify admin dashboard and highlight products with &le; 5 units remaining
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={lowStockAlerts}
                onClick={() => setLowStockAlerts(!lowStockAlerts)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  lowStockAlerts ? 'bg-[#EF3340]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    lowStockAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5: Maintenance Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/40">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Storefront Maintenance Mode
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Temporarily pause checkout for scheduled database maintenance
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={maintenanceMode}
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceMode ? 'bg-[#EF3340]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. DEVELOPER & API SECTION (Native CMCart Admin Identity) */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#EF3340]">
              DEVELOPER & API
            </span>
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
              CMCart API
            </h2>
            <p className="text-xs text-neutral-500">
              Securely connect CMCart with external applications, analytics platforms and business intelligence tools.
            </p>
          </div>

          {/* Card 1: CMCart API Access Card */}
          <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 text-[#EF3340]" />
                  <span>CMCart API Access</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Create secure API credentials to allow approved applications to access your CMCart data.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreateKey}
                  className="bg-[#EF3340] hover:bg-[#D92332] text-white flex items-center gap-1.5 font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create API Key</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManageKeysModal(true)}
                  className="font-bold"
                >
                  <span>Manage API Keys</span>
                </Button>
              </div>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[11px] text-neutral-400 font-semibold block">API Status</span>
                <div className="flex items-center gap-1.5 mt-1 font-bold text-[#16A34A]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>API Available</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[11px] text-neutral-400 font-semibold block">Connected Applications</span>
                <span className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                  {apiKeys.filter((k) => k.status === 'active').length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[11px] text-neutral-400 font-semibold block">API Requests Today</span>
                <span className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                  1,248
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[11px] text-neutral-400 font-semibold block">Last API Activity</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-1 block">
                  2 minutes ago
                </span>
              </div>
            </div>

            {/* Active External App Spotlight */}
            <div className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-[#FFF0F1]/40 dark:bg-neutral-850 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EF3340]/10 text-[#EF3340] flex items-center justify-center shrink-0 font-black">
                  CI
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">CMCart Insights</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Live external client for sales prediction, analytics & data mining
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyText(apiKeys[0]?.apiKey, 'key')}
                  className="hidden sm:inline-flex text-xs font-bold"
                  icon={Copy}
                >
                  Copy Key
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadKeyCredentials(apiKeys[0])}
                  className="text-xs font-bold text-[#EF3340] border-[#EF3340]/30 hover:bg-[#FFF0F1]"
                  icon={Download}
                >
                  Download JSON
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedKeyForDetail(apiKeys[0]);
                    setShowKeyDetailModal(true);
                  }}
                  className="text-xs font-bold bg-[#EF3340] hover:bg-[#D92332]"
                >
                  Manage
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2: API Information Card */}
          <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-[#2563EB]" />
                <span>API Architecture & Specifications</span>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDocsModal(true)}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>View API Documentation</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Base URL</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs mt-1 block">/api/v1</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Authentication</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs mt-1 block">Key + Secret</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Transport</span>
                <span className="font-bold text-emerald-600 text-xs mt-1 block">HTTPS only</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Rate Limit</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs mt-1 block">100 req/min</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Data Access</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs mt-1 block">Permission based</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. DATASET MANAGER & LIVE COMMERCE HUB */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#EF3340]">
              COMMERCE DATA ENGINE
            </span>
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
              Live Dataset Manager
            </h2>
            <p className="text-xs text-neutral-500">
              Upload, switch, and delete real store datasets for CMCart and external analytics (CMCart Insights) without writing SQL.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-5 shadow-xs">
            {/* Header with Actions and Master ON / OFF Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#EF3340]" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Production Dataset Control
                  </h3>
                  <Badge variant={datasetOverlayActive ? 'success' : 'neutral'} size="sm">
                    {datasetOverlayActive ? 'OVERLAY ON' : 'PURE LIVE (OFF)'}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {datasetOverlayActive
                    ? 'Active simulation dataset is currently driving storefront, orders, inventory, analytics and external CMCart Insights API.'
                    : 'Dataset overlay is OFF. Operating strictly in Pure Live Database Mode. Simulated dataset records are bypassed.'}
                </p>
              </div>

              {/* Master ON / OFF Toggle & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* ON / OFF Toggle Switch */}
                <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Dataset Mode
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={datasetOverlayActive}
                    onClick={handleToggleDatasetOverlay}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      datasetOverlayActive ? 'bg-[#16A34A]' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                    title={datasetOverlayActive ? 'Turn OFF for pure live database mode' : 'Turn ON to activate uploaded dataset'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        datasetOverlayActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${datasetOverlayActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>
                    {datasetOverlayActive ? 'ON' : 'OFF'}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMasterTemplate}
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Template</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowUploadDatasetModal(true)}
                  className="bg-[#EF3340] hover:bg-[#D92332] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Dataset</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPurgeModal(true)}
                  className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <span>Purge Data</span>
                </Button>
              </div>
            </div>

            {/* Offline Pure Live Mode Banner */}
            {!datasetOverlayActive && (
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
                <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Pure Live Database Mode Active (Dataset Overlay OFF)</p>
                  <p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                    Uploaded dataset records are currently bypassed. The store and API are querying genuine live database tables only. If your database currently has no records, all pages and cards will display clean empty states. Toggle back ON anytime to resume testing with your dataset.
                  </p>
                </div>
              </div>
            )}

            {/* Active Dataset Spotlight Banner */}
            {datasets.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
                <Database className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">No Datasets Uploaded</h4>
                <p className="text-xs text-neutral-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Your store has no data yet. Download the template, fill in your products, orders and categories, then upload the JSON file to get started.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleDownloadMasterTemplate}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadDatasetModal(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#EF3340] hover:bg-[#D92332] text-white flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Dataset
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">
                          {activeDataset?.name || 'Default Store Data'}
                        </span>
                        {activeDataset?.isTemporary ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                            Temporary (Active until custom upload)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                            Active Live Dataset
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {activeDataset?.description || 'Active data source for storefront, operations and external API.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportDataset(activeDataset)}
                      className="h-7 text-xs font-bold bg-white dark:bg-neutral-800"
                      icon={Download}
                    >
                      Export JSON
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDeleteDataset(activeDataset)}
                      className="h-7 text-xs font-bold text-rose-600 hover:bg-rose-100/60 dark:hover:bg-rose-950/40"
                      icon={Trash2}
                    >
                      Delete Dataset
                    </Button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-700/60">
                    <span className="text-[10px] text-neutral-400 font-bold block">Live Orders</span>
                    <span className="font-black text-sm text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                      {activeDataset?.stats?.orders?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-700/60">
                    <span className="text-[10px] text-neutral-400 font-bold block">Catalog Products</span>
                    <span className="font-black text-sm text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                      {activeDataset?.stats?.products?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-700/60">
                    <span className="text-[10px] text-neutral-400 font-bold block">Categories</span>
                    <span className="font-black text-sm text-neutral-900 dark:text-neutral-100 mt-0.5 block">
                      {activeDataset?.stats?.categories?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-700/60">
                    <span className="text-[10px] text-neutral-400 font-bold block">Total Ingested Revenue</span>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      ₹{(activeDataset?.stats?.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Datasets Table */}
            {datasets.length > 1 && (
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                  Available Datasets ({datasets.length})
                </span>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 font-bold border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="p-2.5">Dataset Name</th>
                        <th className="p-2.5">Records</th>
                        <th className="p-2.5">Revenue</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {datasets.map((ds) => (
                        <tr key={ds.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-850/60">
                          <td className="p-2.5 font-bold text-neutral-900 dark:text-neutral-100">
                            {ds.name}
                          </td>
                          <td className="p-2.5 text-neutral-600 dark:text-neutral-400">
                            {ds.stats?.orders || 0} orders • {ds.stats?.products || 0} products
                          </td>
                          <td className="p-2.5 font-mono font-bold text-emerald-600">
                            ₹{(ds.stats?.revenue || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5">
                            {ds.isActive ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!ds.isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleSwitchDataset(ds.id)}
                                  className="px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleExportDataset(ds)}
                                className="p-1 text-neutral-500 hover:text-neutral-800 rounded cursor-pointer"
                                title="Export JSON"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteDataset(ds)}
                                className="p-1 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
                                title="Delete Dataset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Connected Cloud Infrastructure & API Integrations */}
        <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Connected Cloud Services & Infrastructure
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Services Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Firebase Auth & Analytics */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-850 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Firebase App & Analytics</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Active</span>
                </div>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">Project: cmcart-cm</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Measurement ID: G-KTS9PQ2HLN • Auth Domain: cmcart-cm.firebaseapp.com</p>
              </div>
            </div>

            {/* 2. Supabase PostgreSQL */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-850 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Supabase PostgreSQL</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Connected</span>
                </div>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">https://xwqaysdjisvdndwqiwxk.supabase.co</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">PostgreSQL 5432 Database • Realtime Subscriptions Enabled</p>
              </div>
            </div>

            {/* 3. Cloudinary CDN */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-850 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2563EB] flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Cloudinary Media CDN</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Ready</span>
                </div>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">Cloud: dughdt8sf • Preset: qubink_uploads</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">API Key: 653356226116288 • Auto WebP & Optimization</p>
              </div>
            </div>

            {/* 4. Razorpay PG */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-850 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Razorpay Payment Gateway</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Test Mode</span>
                </div>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">Key ID: rzp_test_T1aHK3B4TiSKB6</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">UPI, Cards & Net Banking Enabled • Instant Settlement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDatabase}
            icon={RefreshCw}
            className="text-red-500 hover:text-red-600 hover:bg-rose-50"
          >
            Reset Store to Clean Empty State
          </Button>

          <Button type="submit" variant="primary" size="md" icon={Save} className="bg-[#EF3340] hover:bg-[#D92332]">
            Save Settings
          </Button>
        </div>
      </form>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE API KEY MODAL                            */}
      {/* ======================================================== */}
      <Modal
        isOpen={showCreateKeyModal}
        onClose={() => setShowCreateKeyModal(false)}
        title="Create API Key"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleGenerateKeySubmit} className="space-y-4 text-xs sm:text-sm">
          <p className="text-xs text-neutral-500">
            Create secure credentials for an external application to access CMCart data.
          </p>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Application Name *
            </label>
            <input
              type="text"
              required
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="CMCart Insights"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#EF3340]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Purpose *
            </label>
            <input
              type="text"
              required
              value={newAppPurpose}
              onChange={(e) => setNewAppPurpose(e.target.value)}
              placeholder="Sales analytics, data mining and sales prediction"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#EF3340]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Environment *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Production', 'Test'].map((env) => (
                <label
                  key={env}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer font-bold text-xs ${
                    newAppEnv === env
                      ? 'border-[#EF3340] bg-[#FFF0F1]/50 text-[#EF3340]'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="api_environment"
                    checked={newAppEnv === env}
                    onChange={() => setNewAppEnv(env)}
                    className="accent-[#EF3340]"
                  />
                  <span>{env}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Permissions & Data Scopes
              </label>
              <span className="text-[11px] text-neutral-400">Read recommended for CMCart Insights</span>
            </div>

            {/* Read Permissions (Recommended) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">
                Read Scopes (Recommended)
              </span>
              {[
                { id: 'orders:read', label: 'Orders — Read' },
                { id: 'products:read', label: 'Products — Read' },
                { id: 'categories:read', label: 'Categories — Read' },
                { id: 'customers:read', label: 'Customers — Read' },
                { id: 'inventory:read', label: 'Inventory — Read' },
                { id: 'analytics:read', label: 'Sales Analytics — Read' }
              ].map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!newAppPermissions[p.id]}
                    onChange={(e) =>
                      setNewAppPermissions((prev) => ({ ...prev, [p.id]: e.target.checked }))
                    }
                    className="accent-[#EF3340] rounded w-4 h-4"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>

            {/* Write Permissions (Separated) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block mb-1">
                Write Scopes (Optional)
              </span>
              {[
                { id: 'orders:write', label: 'Orders — Write' },
                { id: 'products:write', label: 'Products — Write' },
                { id: 'inventory:write', label: 'Inventory — Write' }
              ].map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!newAppPermissions[p.id]}
                    onChange={(e) =>
                      setNewAppPermissions((prev) => ({ ...prev, [p.id]: e.target.checked }))
                    }
                    className="accent-[#EF3340] rounded w-4 h-4"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Use read-only permissions unless the external application needs to modify CMCart data.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateKeyModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-[#EF3340] hover:bg-[#D92332]"
            >
              Generate API Key
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: API CREDENTIAL GENERATED SCREEN                 */}
      {/* ======================================================== */}
      <Modal
        isOpen={showKeyGeneratedModal}
        onClose={() => setShowKeyGeneratedModal(false)}
        title="API Key Generated Successfully"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16A34A]" />
            <span className="font-bold">Credentials ready for CMCart Insights connection</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 font-semibold">Application</span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">{newCredentials?.application}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 font-semibold">Purpose</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-xs">{newCredentials?.purpose}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 font-semibold">Environment</span>
              <span className="font-bold text-[#16A34A]">{newCredentials?.environment}</span>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              API Key
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate flex-1">
                {newCredentials?.apiKey}
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(newCredentials?.apiKey, 'key')}
                className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                title="Copy API Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* API Secret */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              API Secret
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <span className="font-mono text-xs font-bold text-[#EF3340] truncate flex-1">
                {newCredentials?.apiSecret}
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(newCredentials?.apiSecret, 'secret')}
                className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                title="Copy API Secret"
              >
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Alert Callout */}
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF3340]" />
            <div>
              <p className="font-bold">IMPORTANT SECURITY MESSAGE:</p>
              <p className="mt-0.5 text-[11px]">
                Save your API secret now. For security reasons, the full secret will only be displayed once.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleDownloadCredentials}
              className="font-bold"
            >
              Download Credentials
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowKeyGeneratedModal(false)}
              className="bg-[#EF3340] hover:bg-[#D92332]"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: MANAGE API KEYS & ACTIVITY LOGS                 */}
      {/* ======================================================== */}
      <Modal
        isOpen={showManageKeysModal}
        onClose={() => setShowManageKeysModal(false)}
        title="API Keys Management"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Connected API Applications
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage external analytics platforms and background applications connected to your CMCart store.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setShowManageKeysModal(false);
                handleOpenCreateKey();
              }}
              icon={Plus}
              className="bg-[#EF3340] hover:bg-[#D92332] font-bold shrink-0"
            >
              Create API Key
            </Button>
          </div>

          {/* API Keys Table (Responsive with mobile stacked cards) */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 font-bold border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3">Application</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Environment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Last Used</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-850/60">
                      <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100">
                        {k.application}
                      </td>
                      <td className="p-3 text-neutral-500 max-w-xs truncate">{k.purpose}</td>
                      <td className="p-3">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">
                          {k.environment}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                            k.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              k.status === 'active' ? 'bg-[#16A34A]' : 'bg-neutral-400'
                            }`}
                          />
                          <span>{k.status === 'active' ? 'Active' : 'Disabled'}</span>
                        </span>
                      </td>
                      <td className="p-3 text-neutral-500">{k.created}</td>
                      <td className="p-3 text-neutral-500">{k.lastUsed}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyText(k.apiKey, 'key')}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                            title="Copy API Key"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadKeyCredentials(k)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-[#EF3340] cursor-pointer"
                            title="Download JSON Credentials"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedKeyForDetail(k);
                              setShowKeyDetailModal(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-[#EF3340] hover:bg-[#FFF0F1] rounded-lg cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked View */}
            <div className="sm:hidden divide-y divide-neutral-200 dark:divide-neutral-800 p-2 space-y-2">
              {apiKeys.map((k) => (
                <div key={k.id} className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{k.application}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        k.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {k.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">{k.purpose}</p>
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>{k.environment}</span>
                    <span>Used {k.lastUsed}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs font-bold"
                      onClick={() => handleCopyText(k.apiKey, 'key')}
                      icon={Copy}
                    >
                      Copy Key
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs font-bold text-[#EF3340]"
                      onClick={() => handleDownloadKeyCredentials(k)}
                      icon={Download}
                    >
                      JSON
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="text-xs font-bold bg-[#EF3340]"
                      onClick={() => {
                        setSelectedKeyForDetail(k);
                        setShowKeyDetailModal(true);
                      }}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Activity / Logs Section */}
          <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#16A34A]" />
                  <span>Recent API Activity</span>
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Real-time incoming commerce requests from approved integrations.
                </p>
              </div>
              <span className="text-[11px] font-bold text-neutral-500">Live Stream</span>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 font-bold border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Application</th>
                    <th className="p-2.5">Endpoint</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Response Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-[11px]">
                  {apiActivityLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-850/60">
                      <td className="p-2.5 text-neutral-400 font-sans">{log.time}</td>
                      <td className="p-2.5 font-sans font-bold text-neutral-900 dark:text-neutral-100">{log.app}</td>
                      <td className="p-2.5 text-neutral-700 dark:text-neutral-300">{log.endpoint}</td>
                      <td className="p-2.5 font-bold text-blue-600">{log.method}</td>
                      <td className="p-2.5">
                        <span className="font-bold text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                          {log.status} OK
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-neutral-500">{log.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: KEY DETAIL / MANAGE INDIVIDUAL KEY              */}
      {/* ======================================================== */}
      {selectedKeyForDetail && (
        <Modal
          isOpen={showKeyDetailModal}
          onClose={() => setShowKeyDetailModal(false)}
          title={`Manage API Key: ${selectedKeyForDetail.application}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Key Metadata Card */}
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-500">Application</span>
                <span className="font-extrabold text-neutral-900 dark:text-neutral-100">{selectedKeyForDetail.application}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-500">Status</span>
                <span className={`font-bold flex items-center gap-1.5 ${selectedKeyForDetail.status === 'active' ? 'text-[#16A34A]' : 'text-neutral-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${selectedKeyForDetail.status === 'active' ? 'bg-[#16A34A]' : 'bg-neutral-400'}`} />
                  <span>{selectedKeyForDetail.status === 'active' ? 'Active' : 'Disabled'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-500">Environment</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedKeyForDetail.environment}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-500">Requests Today</span>
                <span className="font-black text-neutral-900 dark:text-neutral-100">{selectedKeyForDetail.requestsToday?.toLocaleString() || '1,248'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-500">Last Used</span>
                <span className="text-neutral-600 dark:text-neutral-400">{selectedKeyForDetail.lastUsed}</span>
              </div>
            </div>

            {/* API Credentials Box with Copy and Secret Reveal */}
            <div className="space-y-2.5">
              {/* API Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                    API Key
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">Client ID</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate flex-1 select-all">
                    {selectedKeyForDetail.apiKey}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyDetailText(selectedKeyForDetail.apiKey, 'key')}
                    className="h-7 px-2.5 text-xs font-bold shrink-0 bg-white dark:bg-neutral-700 hover:bg-neutral-50"
                    icon={copiedDetailKey ? Check : Copy}
                  >
                    {copiedDetailKey ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* API Secret */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                    API Secret
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">Private Auth Token</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <span className={`font-mono text-[11px] sm:text-xs font-bold truncate flex-1 select-all ${revealDetailSecret ? 'text-[#EF3340]' : 'text-neutral-500'}`}>
                    {revealDetailSecret
                      ? (selectedKeyForDetail.rawSecret || selectedKeyForDetail.apiKey.replace(/^cm_/, 'sec_'))
                      : selectedKeyForDetail.maskedSecret}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRevealDetailSecret(!revealDetailSecret)}
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer shrink-0 transition-colors"
                    title={revealDetailSecret ? "Hide Secret" : "Reveal Secret"}
                  >
                    {revealDetailSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyDetailText(selectedKeyForDetail.rawSecret || selectedKeyForDetail.apiKey.replace(/^cm_/, 'sec_'), 'secret')}
                    className="h-7 px-2.5 text-xs font-bold shrink-0 bg-white dark:bg-neutral-700 hover:bg-neutral-50 text-[#EF3340] border-[#EF3340]/30"
                    icon={copiedDetailSecret ? Check : Copy}
                  >
                    {copiedDetailSecret ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Download JSON Credentials Card */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#FFF0F1]/70 to-neutral-50 dark:from-neutral-850 dark:to-neutral-800 border border-[#EF3340]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#EF3340]/10 text-[#EF3340] flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                    Download Credentials JSON
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate">
                    {selectedKeyForDetail.application.toLowerCase().replace(/[^a-z0-9]/g, '-')}-api-credentials.json
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleDownloadKeyCredentials(selectedKeyForDetail)}
                icon={Download}
                className="bg-[#EF3340] hover:bg-[#D92332] text-white shrink-0 font-bold text-xs"
              >
                Download JSON
              </Button>
            </div>

            <div>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Active Permissions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedKeyForDetail.permissions.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotateSecret(selectedKeyForDetail.id)}
                  icon={RotateCw}
                  className="w-full sm:w-auto font-bold"
                >
                  Rotate Secret
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleKeyStatus(selectedKeyForDetail.id)}
                  className="w-full sm:w-auto font-bold"
                >
                  {selectedKeyForDetail.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenRevokeConfirm(selectedKeyForDetail)}
                icon={Trash2}
                className="w-full sm:w-auto text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold"
              >
                Revoke API Key
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: REVOKE CONFIRMATION DIALOG                      */}
      {/* ======================================================== */}
      {showRevokeConfirmModal && (
        <Modal
          isOpen={showRevokeConfirmModal}
          onClose={() => setShowRevokeConfirmModal(false)}
          title="Revoke API Key?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Immediate Access Revocation</p>
                <p className="mt-0.5 text-xs">
                  This application will immediately lose access to CMCart API data. This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-neutral-600 dark:text-neutral-400 text-xs">
              Application to revoke: <strong className="text-neutral-900 dark:text-neutral-100">{keyToRevoke?.application}</strong>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRevokeConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleExecuteRevoke}
                className="bg-[#DC2626] hover:bg-red-700 text-white font-bold"
              >
                Revoke API Key
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: API DOCUMENTATION MODAL                         */}
      {/* ======================================================== */}
      <Modal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
        title="CMCart Developer API Documentation (v1)"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 text-blue-900 dark:text-blue-300">
            <p className="font-bold text-xs">CMCart Insights Integration Architecture</p>
            <p className="text-[11px] mt-0.5">
              The CMCart RESTful API allows authorized external intelligence suites to stream catalog, order, and customer behavioral metrics with incremental synchronization.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-sans font-bold block">Base URL</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-bold">https://api.cmcart.com/api/v1</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-sans font-bold block">Auth Header</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-bold">X-CMCart-API-Key: &lt;key&gt;</span>
            </div>
          </div>

          {/* Endpoints List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Supported Endpoints
            </span>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-xs">
              {[
                { method: 'GET', path: '/api/v1/store', desc: 'Store identity, operational config, taxes and currencies' },
                { method: 'GET', path: '/api/v1/orders', desc: 'Real order records, line items, timestamps & status' },
                { method: 'GET', path: '/api/v1/orders/:id', desc: 'Detailed single order payload with shipping addresses' },
                { method: 'GET', path: '/api/v1/products', desc: 'Product catalog, SKU, current pricing, MRP & stock' },
                { method: 'GET', path: '/api/v1/categories', desc: 'Hierarchical catalog taxonomy and groupings' },
                { method: 'GET', path: '/api/v1/customers', desc: 'Customer analytics, order history & spend aggregates' },
                { method: 'GET', path: '/api/v1/inventory', desc: 'Warehouse inventory valuation and stock health' },
                { method: 'GET', path: '/api/v1/analytics/sales', desc: 'Historical daily and monthly sales volume progression' },
                { method: 'GET', path: '/api/v1/analytics/products', desc: 'SKU rank by revenue, quantity sold and margin' },
                { method: 'GET', path: '/api/v1/analytics/customers', desc: 'Retention ratio, cohorts and geographic distribution' }
              ].map((ep, i) => (
                <div key={i} className="p-2.5 flex items-start gap-2.5 hover:bg-neutral-50/60 dark:hover:bg-neutral-850/60">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                    {ep.method}
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{ep.path}</span>
                    <p className="text-[11px] font-sans text-neutral-500 mt-0.5">{ep.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Query Parameters */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Query Parameters & Incremental Sync
            </span>
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#EF3340]">?page=1&limit=100</span>
                <span className="text-neutral-500 font-sans">Pagination controls (max 100 per page)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#EF3340]">?from=YYYY-MM-DD&to=YYYY-MM-DD</span>
                <span className="text-neutral-500 font-sans">Date range window filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#EF3340]">?updated_since=TIMESTAMP</span>
                <span className="text-neutral-500 font-sans">Incremental sync: fetch delta updates only</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDocsModal(false)}
            >
              Close Documentation
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 7: UPLOAD DATASET MODAL                            */}
      {/* ======================================================== */}
      <Modal
        isOpen={showUploadDatasetModal}
        onClose={() => {
          setShowUploadDatasetModal(false);
          setUploadParsedData(null);
          setUploadStats(null);
          setUploadError('');
        }}
        title="Ingest Production Dataset"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleConfirmUploadDataset} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 text-blue-900 dark:text-blue-300">
            <p className="font-bold text-xs">Seamless Live Data Replacement</p>
            <p className="text-[11px] mt-0.5">
              Uploading a dataset instantly activates it for the entire CMCart store, analytics and external CMCart Insights API. You can delete or switch it anytime.
            </p>
          </div>

          {/* Dataset Name Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Dataset Name *
            </label>
            <input
              type="text"
              required
              value={uploadDatasetName}
              onChange={(e) => setUploadDatasetName(e.target.value)}
              placeholder="e.g. Diwali Mega Sales 2026, Q1 Production Batch"
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium focus:outline-none focus:border-[#EF3340]"
            />
          </div>

          {/* File Upload Drop Area */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Select Dataset File (.json) *
            </label>
            <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-5 text-center hover:border-[#EF3340] transition-colors relative cursor-pointer bg-neutral-50/50 dark:bg-neutral-850">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Click to browse or drop your JSON file here
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Supports Master Commerce Template (.json)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#EF3340]" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Parsed Stats Preview */}
          {uploadStats && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dataset Parsed Successfully</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-1.5 rounded bg-white/70 dark:bg-neutral-800 border border-emerald-200/60">
                  <span className="text-[9px] text-neutral-500 font-sans block">Orders</span>
                  <span className="font-bold">{uploadStats.orders}</span>
                </div>
                <div className="p-1.5 rounded bg-white/70 dark:bg-neutral-800 border border-emerald-200/60">
                  <span className="text-[9px] text-neutral-500 font-sans block">Products</span>
                  <span className="font-bold">{uploadStats.products}</span>
                </div>
                <div className="p-1.5 rounded bg-white/70 dark:bg-neutral-800 border border-emerald-200/60">
                  <span className="text-[9px] text-neutral-500 font-sans block">Categories</span>
                  <span className="font-bold">{uploadStats.categories}</span>
                </div>
                <div className="p-1.5 rounded bg-white/70 dark:bg-neutral-800 border border-emerald-200/60">
                  <span className="text-[9px] text-neutral-500 font-sans block">Revenue</span>
                  <span className="font-bold">₹{uploadStats.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadMasterTemplate}
              className="text-xs"
              icon={Download}
            >
              Get Template
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUploadDatasetModal(false);
                  setUploadParsedData(null);
                  setUploadStats(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!uploadParsedData || isUploading}
                className="bg-[#EF3340] hover:bg-[#D92332] text-white font-bold"
              >
                {isUploading ? 'Activating...' : 'Import & Activate Live'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 8: DELETE DATASET CONFIRMATION                     */}
      {/* ======================================================== */}
      {datasetToDelete && (
        <Modal
          isOpen={showDeleteDatasetModal}
          onClose={() => {
            setShowDeleteDatasetModal(false);
            setDatasetToDelete(null);
          }}
          title="Delete Dataset?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to permanently delete the dataset <strong className="text-neutral-900 dark:text-neutral-100">"{datasetToDelete.name}"</strong>?
            </p>
            <p className="text-[11px] text-neutral-400">
              This will remove all orders, products, and analytics associated with this dataset. If this dataset is currently active, the store will switch to an available dataset or empty clean slate.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteDatasetModal(false);
                  setDatasetToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDeleteDataset}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold"
              >
                Yes, Delete Dataset
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL 9: PURGE ALL DATA CONFIRMATION                     */}
      {/* ======================================================== */}
      {showPurgeModal && (
        <Modal
          isOpen={showPurgeModal}
          onClose={() => setShowPurgeModal(false)}
          title="Purge All Store Data?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
              <div>
                <p className="font-bold">Zero-Record Clean Slate</p>
                <p className="mt-0.5 text-[11px]">
                  This will wipe all active mock/temporary records (customers, orders, inventory, products) leaving a completely clean empty store. You can import a new live dataset anytime.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPurgeModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmPurge}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold"
              >
                Yes, Purge Store to Zero
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
