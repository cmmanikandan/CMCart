import React, { useState } from 'react';
import { Users, Search, Mail, Phone, Calendar, ShoppingBag, Eye } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const mockCustomers = [
    {
      id: 'cust-1',
      name: 'Rahul Sharma',
      email: 'customer@cmcart.com',
      phone: '+91 98765 43210',
      ordersCount: 6,
      totalSpent: 41752,
      joinedDate: 'Jan 15, 2026',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    },
    {
      id: 'cust-2',
      name: 'Pooja Iyer',
      email: 'pooja.iyer@gmail.com',
      phone: '+91 98450 11922',
      ordersCount: 4,
      totalSpent: 18450,
      joinedDate: 'Feb 02, 2026',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    {
      id: 'cust-3',
      name: 'Amitabh Roy',
      email: 'amitabh.roy@yahoo.in',
      phone: '+91 97120 44881',
      ordersCount: 2,
      totalSpent: 9495,
      joinedDate: 'Mar 18, 2026',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      id: 'cust-4',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@outlook.com',
      phone: '+91 99012 33819',
      ordersCount: 8,
      totalSpent: 62900,
      joinedDate: 'Dec 10, 2025',
      status: 'VIP Member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    }
  ];

  const filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
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
      </div>

      <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or email..."
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#E63946]"
          />
        </div>
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
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">{c.name}</p>
                        <p className="text-[11px] text-neutral-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                    {c.phone}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {c.ordersCount} orders
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                    ₹{c.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                    {c.joinedDate}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={c.status === 'VIP Member' ? 'primary' : 'success'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="p-1.5 text-neutral-600 hover:text-[#E63946] dark:text-neutral-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
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
              <img src={selectedCustomer.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-base">{selectedCustomer.name}</p>
                <p className="text-neutral-500">{selectedCustomer.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border rounded-xl">
                <span className="text-neutral-400 block">Total Lifetime Value</span>
                <span className="text-base font-bold text-[#E63946]">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 border rounded-xl">
                <span className="text-neutral-400 block">Orders Completed</span>
                <span className="text-base font-bold">{selectedCustomer.ordersCount}</span>
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
