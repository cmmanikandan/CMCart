import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    type: 'Home',
    is_default: false
  });

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = () => {
    setLoading(true);
    commerceDb.getAddresses(user).then((list) => {
      setAddresses(list || []);
      setLoading(false);
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      full_name: user?.displayName || '',
      phone: user?.phone?.replace('+91', '').trim() || '',
      address_line: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      type: 'Home',
      is_default: addresses.length === 0
    });
    setShowModal(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setForm(addr);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await commerceDb.deleteAddress(id);
    showToast('Address deleted', 'info');
    loadAddresses();
  };

  const handleSetDefault = async (addr) => {
    await commerceDb.updateAddress(addr.id, { is_default: true, user_id: user?.uid, user_email: user?.email });
    showToast('Default delivery address updated!', 'success');
    loadAddresses();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      user_id: user?.uid,
      user_email: user?.email
    };
    if (editingId) {
      await commerceDb.updateAddress(editingId, payload);
      showToast('Address updated!', 'success');
    } else {
      await commerceDb.addAddress(payload, user);
      showToast('New address added!', 'success');
    }
    setShowModal(false);
    loadAddresses();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Link to="/profile" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
              Saved Addresses
            </h1>
            <p className="text-xs text-neutral-500">Manage multiple delivery locations.</p>
          </div>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" size="sm" icon={Plus}>
          Add New Address
        </Button>
      </div>

      {/* Address Cards Grid or Empty State */}
      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-neutral-400 dark:text-neutral-500">
          Loading your saved addresses...
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Saved Addresses"
          description="You haven't saved any delivery locations yet. Add your home or work address for seamless, fast checkout."
          actionLabel="Add New Address"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border-2 bg-white dark:bg-[#181818] transition-all flex flex-col justify-between ${
                addr.is_default
                  ? 'border-[#E63946] shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {addr.full_name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {addr.type}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {addr.address_line}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-neutral-500 mt-2 font-medium">
                  Phone: {addr.phone}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                {addr.is_default ? (
                  <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Default Address
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(addr)}
                    className="text-xs font-semibold text-[#E63946] hover:underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Recipient Name *
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Address (House No., Building, Street) *
            </label>
            <textarea
              value={form.address_line}
              onChange={(e) => setForm({ ...form, address_line: e.target.value })}
              rows={2}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                City *
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                required
                maxLength={6}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Address Type
            </label>
            <div className="flex gap-4">
              {['Home', 'Office', 'Other'].map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="addressTypeSelection"
                    checked={form.type === t}
                    onChange={() => setForm({ ...form, type: t })}
                    className="text-[#E63946] focus:ring-[#E63946]"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
