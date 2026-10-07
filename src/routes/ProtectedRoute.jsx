import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading, switchRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E63946]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#111111] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white dark:bg-[#181818] p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-[#DC2626] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100">
            Admin Access Required
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            This section is restricted to CMCart Operations Administrators. Your current role is <strong className="text-neutral-800 dark:text-neutral-200 uppercase">{user.role}</strong>.
          </p>

          <div className="pt-2 space-y-2">
            <Button
              onClick={() => switchRole('admin')}
              variant="primary"
              size="md"
              className="w-full"
            >
              Switch to Admin Test Role
            </Button>
            <Link to="/home" className="block">
              <Button variant="outline" size="md" className="w-full" icon={ArrowLeft}>
                Return to Storefront
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
