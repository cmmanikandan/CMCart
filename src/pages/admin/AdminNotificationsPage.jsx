import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Megaphone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('promo');
  const [link, setLink] = useState('/products?filter=deals');
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    setSending(true);

    const store = JSON.parse(localStorage.getItem('cmcart_commerce_store_v2') || '{}');
    const notifs = store.notifications || [];
    notifs.unshift({
      id: `notif-${Date.now()}`,
      title,
      message,
      time: 'Just now',
      type,
      link,
      is_read: false
    });
    store.notifications = notifs;
    localStorage.setItem('cmcart_commerce_store_v2', JSON.stringify(store));

    setSending(false);
    setTitle('');
    setMessage('');
    showToast('Storewide notification sent to all active customer devices!', 'success');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
          ENGAGEMENT & ALERTS
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
          Broadcast Notifications
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Push notifications and alerts to customer notification centers.
        </p>
      </div>

      <div className="p-6 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <form onSubmit={handleBroadcast} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Notification Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Sale Alert! Flat 50% Off Today"
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Notification Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Enter message text shown to shoppers..."
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              >
                <option value="promo">Promotional Deal</option>
                <option value="price_drop">Price Drop</option>
                <option value="order">Order Update</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Target Link
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={sending}
            icon={Send}
            className="w-full mt-2"
          >
            Broadcast to Customers
          </Button>
        </form>
      </div>
    </div>
  );
}
