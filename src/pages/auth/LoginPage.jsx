import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, X, ShieldCheck, Sun, Moon, ShoppingBag } from 'lucide-react';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

export function LoginPage() {
  const [agreed, setAgreed] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target if came from protected route or action
  const from = location.state?.from?.pathname || '/home';

  // Accessibility: Close modals with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPrivacyModal(false);
        setShowTermsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setAgreed(isChecked);
    if (isChecked) {
      setValidationError('');
    }
  };

  const handleGoogleClick = async () => {
    if (!agreed) {
      setValidationError('Please accept the Privacy Policy and Terms of Service to continue.');
      return;
    }

    setValidationError('');
    setAuthError('');
    setLoading(true);

    try {
      const consentData = {
        privacy_policy_accepted: true,
        terms_accepted: true,
        accepted_at: new Date().toISOString(),
        privacy_policy_version: '2026.1',
        terms_version: '2026.1'
      };

      const loggedUser = await loginWithGoogle(consentData);
      showToast('Signed in successfully with Google!', 'success');
      if (!loggedUser?.isProfileCompleted && (from === '/home' || from === '/')) {
        navigate('/profile-wizard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Unable to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#111111] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-[#E63946]/20 selection:text-[#E63946] transition-colors duration-200">
      
      {/* ==================================================
          TOP NAVIGATION
          Desktop & Mobile Responsive Header with Theme Switcher
          ================================================== */}
      <header className="w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-[#181818]/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: CMCart Brand Logo */}
          <Link to="/home" className="flex items-center gap-2 group focus:outline-hidden">
            <BrandLogo size="md" />
          </Link>

          {/* Right Controls: Theme Toggle & Continue as Guest */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Dark / Light Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 sm:p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer shadow-2xs"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>

            {/* Back to Guest Button */}
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#E63946]/30"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <span className="hidden sm:inline">Continue as Guest</span>
              <span className="sm:hidden">Guest</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ==================================================
          LOGIN CARD CONTENT
          Optimized for Mobile Fit (360px - 440px) & Desktop
          Shows: CMCart Logo, Brand Name, Tagline
          ================================================== */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-14">
        <div className="w-full max-w-[420px] mx-auto bg-white dark:bg-[#181818] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-200/50 dark:shadow-black/50 transition-colors flex flex-col items-center">
          
          {/* CMCart Brand Logo (Prominent & Clear) */}
          <div className="relative mb-3 group">
            <div className="absolute inset-0 bg-[#E63946]/20 rounded-full blur-xl transition-opacity group-hover:opacity-100 opacity-60" />
            {!logoError ? (
              <img
                src="/logo.png"
                alt="CMCart Logo"
                onError={() => setLogoError(true)}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain relative z-10 drop-shadow-md transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#E63946] to-rose-600 text-white flex items-center justify-center relative z-10 shadow-md">
                <ShoppingBag className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Brand Name */}
          <h1
            style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 text-center flex items-center"
          >
            <span>CM</span>
            <span className="text-[#E63946] ml-1">Cart</span>
          </h1>

          {/* Tagline */}
          <p className="text-[11px] sm:text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-center mt-1 mb-2">
            India's Smart Commerce Destination
          </p>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 text-center mb-6">
            Sign in to access your orders, saved cart, and exclusive deals.
          </p>

          {/* Inline Auth Error Alert */}
          {authError && (
            <div className="w-full mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm text-[#E63946] dark:text-rose-300 text-center font-semibold leading-snug">
              {authError}
            </div>
          )}

          {/* Validation Warning Alert */}
          {validationError && (
            <div className="w-full mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs sm:text-sm text-amber-800 dark:text-amber-300 text-center font-medium animate-shake">
              {validationError}
            </div>
          )}

          {/* ==================================================
              GOOGLE LOGIN BUTTON
              ALWAYS KEEPS RED BORDER (both light and dark mode)
              Mobile Fit: 100% width, h-13 to h-14
              ================================================== */}
          <div className="w-full mb-4">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className={`w-full h-13 sm:h-14 rounded-2xl border-2 border-[#E63946] bg-white dark:bg-[#202020] text-neutral-900 dark:text-neutral-100 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xs hover:bg-rose-50/60 dark:hover:bg-rose-950/30 hover:border-[#D62828] active:scale-[0.99] transition-all cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-rose-500/20 ${
                loading ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-neutral-800 dark:text-neutral-200">Connecting to Google...</span>
                </div>
              ) : (
                <>
                  {/* Official Google G Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-neutral-900 dark:text-neutral-100 font-bold">
                    Continue with Google
                  </span>
                </>
              )}
            </button>
          </div>

          {/* ==================================================
              TERMS & PRIVACY CONSENT CHECKBOX
              Mobile wrapped, themed, and clear
              ================================================== */}
          <div
            className={`w-full p-2.5 rounded-xl transition-colors flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed select-none ${
              validationError ? 'bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40' : ''
            }`}
          >
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={handleCheckboxChange}
              className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-[#E63946] focus:ring-[#E63946] cursor-pointer accent-[#E63946]"
            />
            <label htmlFor="consent-checkbox" className="cursor-pointer leading-normal">
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrivacyModal(true);
                }}
                className="font-semibold text-neutral-900 dark:text-neutral-200 underline decoration-neutral-300 dark:decoration-neutral-600 hover:text-[#E63946] dark:hover:text-[#E63946] hover:decoration-[#E63946] transition-colors focus:outline-hidden"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTermsModal(true);
                }}
                className="font-semibold text-neutral-900 dark:text-neutral-200 underline decoration-neutral-300 dark:decoration-neutral-600 hover:text-[#E63946] dark:hover:text-[#E63946] hover:decoration-[#E63946] transition-colors focus:outline-hidden"
              >
                Terms of Service
              </button>
              .
            </label>
          </div>

          {/* ==================================================
              SECURITY / TRUST BADGE
              ================================================== */}
          <div className="w-full pt-5 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>256-bit Encrypted • Firebase & Google Protected</span>
          </div>
        </div>
      </main>

      {/* ==================================================
          BOTTOM FOOTER
          Themed and centered
          ================================================== */}
      <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-[#181818]/70 py-6 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span>·</span>
            <Link to="/help" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Help & Support
            </Link>
          </div>
          <p>© 2026 CMCart. All rights reserved.</p>
        </div>
      </footer>

      {/* ==================================================
          PRIVACY POLICY MODAL (Themed for Light & Dark Mode)
          ================================================== */}
      {showPrivacyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl max-w-[650px] w-full max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-scale-up text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h2 id="privacy-modal-title" className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  Privacy Policy
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Version 2026.1 · Last updated October 2026
                </p>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close Privacy Policy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  1. Information We Collect
                </h3>
                <p>
                  We collect information you provide directly to us when authenticating via Google Sign-In,
                  including your name, email address, profile picture, and contact information. We also log device
                  identifiers and session information within the CMCart store.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  2. How We Use Information
                </h3>
                <p>
                  Your data is utilized to fulfill product purchases, generate GST tax invoices, process door-to-door
                  deliveries, send order tracking updates, and prevent fraudulent activity.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  3. Account Information & Storage
                </h3>
                <p>
                  Your customer profile is secured via Firebase Authentication and Supabase PostgreSQL. You have
                  the right to update your shipping addresses, review past orders, or delete your account anytime.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  4. Orders and Payments
                </h3>
                <p>
                  All transactions (Razorpay, UPI, Cards, Net Banking) are processed via PCI-DSS compliant gateways.
                  CMCart never stores or logs your raw card credentials or CVV numbers.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  5. Contact & Inquiries
                </h3>
                <p>
                  For any privacy inquiries or account assistance, contact us at{' '}
                  <span className="text-neutral-900 dark:text-white font-medium">privacy@cmcart.com</span>.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 rounded-b-3xl flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          TERMS OF SERVICE MODAL (Themed for Light & Dark Mode)
          ================================================== */}
      {showTermsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl max-w-[650px] w-full max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-scale-up text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h2 id="terms-modal-title" className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  Terms of Service
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Version 2026.1 · Effective October 2026
                </p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close Terms of Service"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or purchasing through CMCart, you confirm that you are at least 18 years of age and agree
                  to be bound by these platform terms.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  2. Account Usage
                </h3>
                <p>
                  You are responsible for maintaining the confidentiality of your Google account and credentials.
                  All actions under your logged-in session are your responsibility.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  3. Shopping, Orders & Pricing
                </h3>
                <p>
                  Prices are listed in Indian Rupees (₹ INR) inclusive of applicable taxes. Orders placed constitute an
                  offer to purchase, subject to availability and payment confirmation.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1.5">
                  4. Returns & Refunds
                </h3>
                <p>
                  Eligible products may be returned within 7 days of delivery in their original, unused condition with
                  intact brand tags and packaging. Refunds are credited to the original payment source.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 rounded-b-3xl flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
