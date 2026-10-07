import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ArrowLeft, ArrowRight, Tag, Zap, Truck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadNotifs();
  }, []);

  const loadNotifs = () => {
    commerceDb.getNotifications().then((list) => {
      setNotifications(list);
      setLoading(false);
    });
  };

  const handleMarkAsRead = async (id) => {
    await commerceDb.markNotificationAsRead(id);
    loadNotifs();
  };

  const handleMarkAllRead = async () => {
    await commerceDb.markAllNotificationsRead();
    showToast('All notifications marked as read', 'info');
    loadNotifs();
  };

  const handleClearAll = async () => {
    await commerceDb.clearAllNotifications();
    showToast('Notifications cleared', 'info');
    loadNotifs();
  };

  const getIcon = (type) => {
    if (type === 'order') return <Truck className="w-4 h-4 text-[#E63946]" />;
    if (type === 'promo') return <Tag className="w-4 h-4 text-emerald-500" />;
    return <Zap className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Link to="/profile" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
              Notification Center
            </h1>
            <p className="text-xs text-neutral-500">Order updates, price drop alerts & deals.</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button onClick={handleMarkAllRead} variant="outline" size="sm" icon={CheckCheck}>
              Mark all read
            </Button>
            <Button onClick={handleClearAll} variant="ghost" size="sm" icon={Trash2}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're completely caught up! We'll notify you when your orders ship or when prices drop on your wishlist."
          actionText="Discover Deals"
          actionLink="/products"
        />
      ) : (
        <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 shadow-xs overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !notif.is_read
                  ? 'bg-[#E63946]/5 hover:bg-[#E63946]/10'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-xs">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-neutral-400 shrink-0">{notif.time}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
                {notif.link && (
                  <Link
                    to={notif.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] hover:underline mt-2"
                  >
                    <span>View details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-[#E63946] shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
