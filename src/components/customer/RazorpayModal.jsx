import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building,
  QrCode,
  CheckCircle2,
  Lock,
  Loader2,
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';

export function RazorpayModal({
  isOpen,
  onClose,
  amount,
  orderNumber,
  onSuccess
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiOption, setUpiOption] = useState('gpay');
  const [customUpi, setCustomUpi] = useState('rahul@okaxis');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setProcessing(true);
    // Simulate Razorpay gateway transaction verification
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);
    setPaymentSuccess(true);
    await new Promise((r) => setTimeout(r, 600));
    onSuccess({
      payment_id: `pay_rzp_${Date.now().toString().slice(-8)}`,
      method: activeTab === 'upi' ? `UPI (${upiOption.toUpperCase()})` : activeTab === 'card' ? 'Credit Card' : 'Net Banking'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151b26] w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Razorpay Brand Header */}
        <div className="bg-[#0C2340] text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            {/* Razorpay Icon Symbol */}
            <div className="w-10 h-10 rounded-xl bg-[#0D6EFD] flex items-center justify-center font-black text-xl italic text-white shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                  Razorpay
                </span>
                <span className="text-[10px] font-bold bg-blue-400/20 text-blue-300 px-1.5 py-0.5 rounded">
                  SECURE
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">CMCart Commerce Store</p>
            </div>
          </div>

          <div className="text-right relative z-10 flex items-center gap-3">
            <div>
              <span className="text-[10px] text-blue-300 uppercase tracking-wider block font-semibold">
                Amount to Pay
              </span>
              <span className="text-lg sm:text-xl font-black text-white">
                ₹{amount?.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={processing || paymentSuccess}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Razorpay gateway"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {paymentSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] flex items-center justify-center mx-auto border-4 border-emerald-500/20">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100">
              Payment Authorized!
            </h3>
            <p className="text-xs text-neutral-500">
              Transaction successful. Finalizing your CMCart order confirmation...
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row flex-1 overflow-y-auto">
            {/* Left Method Tabs */}
            <div className="w-full sm:w-44 bg-neutral-50 dark:bg-[#0f141d] border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-neutral-800 p-2 sm:p-3 flex sm:flex-col gap-1 shrink-0">
              {[
                { id: 'upi', label: 'UPI / QR', icon: Smartphone, badge: 'Popular' },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'netbanking', label: 'Net Banking', icon: Building }
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 sm:flex-initial flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-neutral-800 text-[#0D6EFD] shadow-xs border border-neutral-200/80 dark:border-neutral-700'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate">{t.label}</span>
                    {t.badge && (
                      <span className="hidden sm:inline text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black">
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Tab Content */}
            <div className="flex-1 p-4 sm:p-5 space-y-4">
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                      Choose your preferred UPI App
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'gpay', name: 'Google Pay', icon: '⚡' },
                        { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                        { id: 'paytm', name: 'Paytm UPI', icon: '🔵' },
                        { id: 'cred', name: 'CRED UPI', icon: '🪙' }
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setUpiOption(u.id)}
                          className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                            upiOption === u.id
                              ? 'border-[#0D6EFD] bg-blue-50/50 dark:bg-blue-950/30 text-[#0D6EFD]'
                              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                          }`}
                        >
                          <span className="text-sm">{u.icon}</span>
                          <span>{u.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Or enter UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customUpi}
                        onChange={(e) => setCustomUpi(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0D6EFD]"
                      />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
                        ✓ Verified
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-2 text-[11px] text-neutral-500">
                    <QrCode className="w-4 h-4 text-[#0D6EFD] shrink-0" />
                    <span>Dynamic Razorpay QR will be generated on confirmation</span>
                  </div>
                </div>
              )}

              {activeTab === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      defaultValue="4532 8820 1904 9012"
                      readOnly
                      className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        readOnly
                        className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        defaultValue="891"
                        readOnly
                        className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1 pt-1">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    Cards stored with RBI-compliant tokenization
                  </p>
                </div>
              )}

              {activeTab === 'netbanking' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                    Popular Indian Retail Banks
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((b, i) => (
                      <label
                        key={b}
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#0D6EFD] flex items-center gap-2 cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200"
                      >
                        <input
                          type="radio"
                          name="bank"
                          defaultChecked={i === 0}
                          className="accent-[#0D6EFD]"
                        />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Bottom Razorpay Pay Button */}
        {!paymentSuccess && (
          <div className="p-4 bg-neutral-50 dark:bg-[#0c1118] border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            <Button
              type="button"
              onClick={handlePay}
              loading={processing}
              className="w-full h-12 bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Pay ₹{amount?.toLocaleString('en-IN')} with Razorpay</span>
            </Button>
            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0D6EFD]" />
              <span>PCI-DSS Certified 256-bit Encrypted Payment Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
