import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, ShoppingBag, Eye, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
    const handleUpdate = () => loadCustomers();
    window.addEventListener('cmcart_dataset_updated', handleUpdate);
    return () => window.removeEventListener('cmcart_dataset_updated', handleUpdate);
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await commerceDb.getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E63946]">
            ACCOUNTS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Registered customer accounts, purchase history and activity status.
          </p>
        </div>

        <Button onClick={loadCustomers} variant="outline" size="sm" icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email or phone..."
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#E63946]"
          />
        </div>

        <span className="text-xs font-semibold text-neutral-500">
          Showing: <strong className="text-neutral-900 dark:text-neutral-100">{filtered.length}</strong> Accounts
        </span>
      </div>

      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-[11px] font-bold uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <Users className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">No Customers Found</p>
                      <p className="text-xs text-neutral-500">
                        There are no registered customer profiles in this store. User accounts and customer checkout profiles will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    No customers match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name || 'User')}`}
                          alt={c.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 bg-neutral-100 dark:bg-neutral-800"
                        />
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-neutral-100">{c.name}</p>
                          <p className="text-[11px] text-neutral-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                      {c.phone || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {c.ordersCount || 1} orders
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                      ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                      {c.joinedDate || 'Recent'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={c.status === 'VIP Member' ? 'primary' : 'success'}>
                        {c.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 text-neutral-600 hover:text-[#E63946] dark:text-neutral-300 cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? `Customer Profile: ${selectedCustomer.name}` : ''}
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
              <img
                src={selectedCustomer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedCustomer.name || 'User')}`}
                alt=""
                className="w-12 h-12 rounded-full object-cover bg-white"
              />
              <div>
                <p className="font-bold text-base">{selectedCustomer.name}</p>
                <p className="text-neutral-500">{selectedCustomer.email}</p>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedCustomer.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <span className="text-neutral-400 block">Total Lifetime Value</span>
                <span className="text-base font-bold text-[#E63946]">₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <span className="text-neutral-400 block">Orders Completed</span>
                <span className="text-base font-bold">{selectedCustomer.ordersCount || 1}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedCustomer(null)} variant="primary" size="sm">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
