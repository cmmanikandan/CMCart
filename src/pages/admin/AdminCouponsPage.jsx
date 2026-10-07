import React, { useState, useEffect } from 'react';
import { Percent, Plus, Trash2, Edit, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage', // 'percentage' | 'fixed'
    discount_value: 15,
    minimum_order_amount: 999,
    maximum_discount_amount: 500,
    usage_limit: 1000,
    is_active: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    commerceDb.getCoupons().then(setCoupons);
  };

  const handleOpenAdd = () => {
    setForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 15,
      minimum_order_amount: 999,
      maximum_discount_amount: 500,
      usage_limit: 1000,
      is_active: true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete coupon?')) {
      await commerceDb.deleteCoupon(id);
      showToast('Coupon deleted', 'info');
      loadCoupons();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code) return;
    await commerceDb.addCoupon({
      ...form,
      code: form.code.toUpperCase(),
      discount_value: Number(form.discount_value),
      minimum_order_amount: Number(form.minimum_order_amount),
      maximum_discount_amount: Number(form.maximum_discount_amount)
    });
    showToast(`Coupon ${form.code.toUpperCase()} created!`, 'success');
    setShowModal(false);
    loadCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            PROMOTIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Coupons & Discount Rules
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Create festive promo codes, set minimum order amounts and maximum discounts.
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Create New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-black text-sm text-[#E63946] bg-[#E63946]/10 px-2.5 py-1 rounded-md">
                  {c.code}
                </span>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-neutral-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {c.description}
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Discount: {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
              </p>
              <p className="text-[11px] text-neutral-400">
                Min. Order: ₹{c.minimum_order_amount} {c.maximum_discount_amount ? `• Max Cap: ₹${c.maximum_discount_amount}` : ''}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span>Used: {c.times_used || 0} times</span>
              <span className="text-[#16A34A] font-semibold">Active</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Coupon Code (e.g. FESTIVE20) *
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 uppercase font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder="e.g. Flat 15% off on all electronics"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Discount Type
              </label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                required
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Min Order Amount (₹)
              </label>
              <input
                type="number"
                value={form.minimum_order_amount}
                onChange={(e) => setForm({ ...form, minimum_order_amount: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Max Cap Discount (₹)
              </label>
              <input
                type="number"
                value={form.maximum_discount_amount}
                onChange={(e) => setForm({ ...form, maximum_discount_amount: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
