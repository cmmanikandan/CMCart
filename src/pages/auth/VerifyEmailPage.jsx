import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MailCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'your registered email';
  const [resending, setResending] = useState(false);
  const { showToast } = useToast();

  const handleResend = async () => {
    setResending(true);
    await new Promise((r) => setTimeout(r, 600));
    setResending(false);
    showToast(`Verification link resent to ${email}`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#111111] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#181818] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl p-6 sm:p-8 text-center">
        <div className="inline-block mb-4">
          <BrandLogo size="md" />
        </div>

        <div className="w-16 h-16 rounded-full bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight mb-2">
          Verify Your Email
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          We've sent an activation link to <strong className="text-neutral-800 dark:text-neutral-200">{email}</strong>. Please check your inbox to activate your account.
        </p>

        <div className="space-y-3">
          <Link to="/home">
            <Button variant="primary" size="lg" className="w-full" icon={ArrowRight} iconPosition="right">
              Proceed to Shopping
            </Button>
          </Link>

          <Button
            variant="outline"
            size="md"
            onClick={handleResend}
            loading={resending}
            className="w-full"
            icon={RefreshCw}
          >
            Resend Email Link
          </Button>
        </div>
      </div>
    </div>
  );
}
