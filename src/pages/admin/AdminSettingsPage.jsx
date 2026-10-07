import React, { useState } from 'react';
import { Settings, Shield, RefreshCw, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export function AdminSettingsPage() {
  const { showToast } = useToast();
  const [storeName, setStoreName] = useState('CMCart Technologies India');
  const [supportEmail, setSupportEmail] = useState('operations@cmcart.com');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(99);
  const [taxRate, setTaxRate] = useState(18);
  const [enableRazorpay, setEnableRazorpay] = useState(true);
  const [enableCod, setEnableCod] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Admin store configurations saved successfully!', 'success');
  };

  const handleResetDatabase = () => {
    if (window.confirm('Reset all demo catalog, orders, and addresses back to initial factory state?')) {
      localStorage.removeItem('cmcart_commerce_store_v2');
      localStorage.removeItem('cmcart_cart_items_v2');
      localStorage.removeItem('cmcart_wishlist_v1');
      showToast('Store reseeded to default initial state!', 'info');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
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
        {/* General Store Identity */}
        <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Store Identity
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-semibold"
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
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Tax Rules */}
        <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Shipping & Taxes
          </h3>

          <div className="grid grid-cols-3 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
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
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
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
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Payment Methods
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">UPI & Online Payments (Razorpay Ready)</p>
                <p className="text-xs text-neutral-400">Direct instant checkout via cards, UPI and Net Banking</p>
              </div>
              <input
                type="checkbox"
                checked={enableRazorpay}
                onChange={(e) => setEnableRazorpay(e.target.checked)}
                className="w-4 h-4 rounded text-[#E63946]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Cash on Delivery (COD)</p>
                <p className="text-xs text-neutral-400">Accept payment at doorstep upon package handover</p>
              </div>
              <input
                type="checkbox"
                checked={enableCod}
                onChange={(e) => setEnableCod(e.target.checked)}
                className="w-4 h-4 rounded text-[#E63946]"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDatabase}
            icon={RefreshCw}
            className="text-red-500 hover:text-red-600 hover:bg-rose-50"
          >
            Reset Store Database to Initial Seed
          </Button>

          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
