import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, Shield, Lock, ExternalLink } from 'lucide-react';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function LoginPage() {
  const [agreed, setAgreed] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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

      await loginWithGoogle(consentData);
      showToast('Signed in successfully!', 'success');
      navigate('/home');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setAuthError('Unable to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-[#171717] flex flex-col justify-between selection:bg-[#E63946]/10 selection:text-[#E63946]">
      {/* ==================================================
          TOP NAVIGATION
          Desktop & Mobile Responsive Header
          ================================================== */}
      <header className="w-full border-b border-[#E5E7EB] bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: CMCart Brand Logo */}
          <Link to="/home" className="flex items-center gap-2 group focus:outline-hidden">
            <BrandLogo size="md" />
          </Link>

          {/* Right: Outlined Back to Guest Button */}
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#171717] hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-xs active:scale-98 transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-[#E63946]/30"
          >
            <ArrowLeft className="w-4 h-4 text-[#6B7280] group-hover:text-[#171717]" />
            <span className="hidden sm:inline">Back to Guest</span>
            <span className="sm:hidden">Guest</span>
          </Link>
        </div>
      </header>

      {/* ==================================================
          LOGIN CONTENT
          Centered vertically and horizontally (~420-480px)
          ================================================== */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-[460px] mx-auto flex flex-col items-center">
          
          {/* Top Logo / Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E63946] mb-6 shadow-xs">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] text-center mb-2">
            Welcome to CMCart
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] text-center mb-8">
            Sign in to continue shopping.
          </p>

          {/* Inline Auth Error Message */}
          {authError && (
            <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-[#E63946] text-center font-medium">
              {authError}
            </div>
          )}

          {/* Validation Error Message */}
          {validationError && (
            <div className="w-full mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 text-center font-medium animate-shake">
              {validationError}
            </div>
          )}

          {/* ==================================================
              GOOGLE LOGIN BUTTON
              52–56px height, 2px border, official G icon
              ================================================== */}
          <div className="w-full mb-4">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className={`w-full h-13 sm:h-14 rounded-xl flex items-center justify-center gap-3 font-semibold text-sm sm:text-base transition-all duration-150 focus:outline-hidden focus:ring-3 focus:ring-[#E63946]/30 ${
                agreed
                  ? 'bg-white border-2 border-[#E63946] text-[#171717] hover:bg-red-50/40 active:scale-[0.99] shadow-xs cursor-pointer'
                  : 'bg-neutral-100 border-2 border-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* ==================================================
              TERMS & PRIVACY CONSENT CHECKBOX
              ================================================== */}
          <div className="w-full flex items-start gap-2.5 text-xs sm:text-sm text-[#6B7280] leading-relaxed select-none mb-6">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={handleCheckboxChange}
              className="mt-0.5 w-4 h-4 rounded border-[#E5E7EB] text-[#E63946] focus:ring-[#E63946] cursor-pointer accent-[#E63946]"
            />
            <label htmlFor="consent-checkbox" className="cursor-pointer">
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrivacyModal(true);
                }}
                className="font-medium text-[#171717] underline decoration-neutral-300 hover:text-[#E63946] hover:decoration-[#E63946] transition-colors focus:outline-hidden"
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
                className="font-medium text-[#171717] underline decoration-neutral-300 hover:text-[#E63946] hover:decoration-[#E63946] transition-colors focus:outline-hidden"
              >
                Terms of Service
              </button>
              .
            </label>
          </div>

          {/* ==================================================
              SECURITY / TRUST (Minimal note)
              ================================================== */}
          <p className="text-[11px] sm:text-xs text-[#6B7280]/80 text-center">
            Secure sign-in powered by Google and Firebase.
          </p>
        </div>
      </main>

      {/* ==================================================
          BOTTOM FOOTER
          Privacy Policy · Terms of Service · Help
          © 2026 CMCart. All rights reserved.
          ================================================== */}
      <footer className="w-full border-t border-[#E5E7EB] bg-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2 text-xs text-[#6B7280]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-[#171717] transition-colors"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-[#171717] transition-colors"
            >
              Terms of Service
            </button>
            <span>·</span>
            <Link to="/help" className="hover:text-[#171717] transition-colors">
              Help
            </Link>
          </div>
          <p>© 2026 CMCart. All rights reserved.</p>
        </div>
      </footer>

      {/* ==================================================
          PRIVACY POLICY MODAL (9 Clear Sections)
          Desktop max width ~650px, scrollable content area
          ================================================== */}
      {showPrivacyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-[650px] w-full max-h-[85vh] flex flex-col shadow-xl border border-[#E5E7EB] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 id="privacy-modal-title" className="text-xl font-bold text-[#171717]">
                  Privacy Policy
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">Version 2026.1 · Last updated October 2026</p>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 rounded-xl text-[#6B7280] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close Privacy Policy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-[#171717] leading-relaxed">
              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">1. Information We Collect</h3>
                <p className="text-[#6B7280]">
                  We collect information you provide directly to us when creating an account via Google Sign-In,
                  including your name, email address, profile picture, and contact information. We also log device
                  identifiers, IP addresses, and browsing actions within the CMCart storefront.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">2. How We Use Information</h3>
                <p className="text-[#6B7280]">
                  Your data is utilized to fulfill product purchases, generate tax invoices, process door-to-door
                  deliveries, send transactional updates, prevent fraudulent activity, and personalize shopping
                  recommendations tailored to your browsing preferences.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">3. Account Information</h3>
                <p className="text-[#6B7280]">
                  Your customer profile is secured via Firebase Authentication and Supabase infrastructure. You have
                  full authority to review, update shipping addresses, or request account data exports directly
                  from your Profile dashboard.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">4. Orders and Payments</h3>
                <p className="text-[#6B7280]">
                  All financial transactions (Razorpay, UPI, Credit Cards, Net Banking) are processed via PCI-DSS
                  certified payment gateways. CMCart never stores or logs your raw payment credentials or CVV numbers.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">5. Cookies & Local Storage</h3>
                <p className="text-[#6B7280]">
                  We utilize cookies and browser storage to preserve your active cart items, wishlist preferences,
                  theme settings, and authenticated session tokens. You may disable cookies in your browser settings.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">6. Data Security</h3>
                <p className="text-[#6B7280]">
                  We implement TLS 1.3 encryption for all data in transit, encrypted database storage for personal
                  records, and role-based access control preventing unauthorized data extraction.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">7. Third-Party Services</h3>
                <p className="text-[#6B7280]">
                  We share required shipping details only with accredited logistics partners (BlueDart, Delhivery)
                  solely for dispatching physical orders, and verified email/SMS dispatchers for OTP and delivery alerts.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">8. User Rights</h3>
                <p className="text-[#6B7280]">
                  Under applicable data protection laws, you retain the right to access, rectify, or permanently delete
                  your stored customer profile. Contact our grievance officer to exercise your privacy rights.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">9. Contact & Grievance</h3>
                <p className="text-[#6B7280]">
                  For any privacy inquiries or grievance redressals, email us at <span className="text-[#171717] font-medium">privacy@cmcart.com</span> or write to CMCart Legal Operations, Cyber City, Gurugram, India.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-neutral-50/60 rounded-b-2xl flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#171717] text-white font-semibold text-sm hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          TERMS OF SERVICE MODAL (10 Clear Sections)
          Desktop max width ~650px, scrollable content area
          ================================================== */}
      {showTermsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
          className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-[650px] w-full max-h-[85vh] flex flex-col shadow-xl border border-[#E5E7EB] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 id="terms-modal-title" className="text-xl font-bold text-[#171717]">
                  Terms of Service
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">Version 2026.1 · Effective October 2026</p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 rounded-xl text-[#6B7280] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close Terms of Service"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-[#171717] leading-relaxed">
              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">1. Acceptance of Terms</h3>
                <p className="text-[#6B7280]">
                  By accessing or purchasing through CMCart, you confirm that you are at least 18 years old and agree
                  to be legally bound by these Terms of Service.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">2. Account Usage</h3>
                <p className="text-[#6B7280]">
                  You are responsible for safeguarding your authenticated Google credentials and all activity
                  conducted under your customer profile. Impersonation of any party is strictly prohibited.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">3. Shopping and Orders</h3>
                <p className="text-[#6B7280]">
                  Orders placed on CMCart constitute an offer to purchase. CMCart reserves the right to accept or cancel
                  any order in the event of pricing typographical errors or product stock unavailability.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">4. Payments</h3>
                <p className="text-[#6B7280]">
                  Prices are displayed in Indian Rupees (INR) and include applicable Goods and Services Tax (GST).
                  Payment must be authorized in full before orders are dispatched from fulfillment centers.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">5. Delivery</h3>
                <p className="text-[#6B7280]">
                  Estimated delivery timelines are provided at checkout. While we strive to meet express targets, delays
                  occasioned by weather disruptions, state border checks, or courier logistics are communicated promptly.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">6. Returns and Refunds</h3>
                <p className="text-[#6B7280]">
                  Eligible products may be returned within 7 days of delivery in their original condition and packaging.
                  Refunds are credited back to the original payment source within 5–7 business days upon inspection.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">7. Product Information</h3>
                <p className="text-[#6B7280]">
                  We endeavor to present accurate product specifications, imagery, and MRPs. Minor variations in shade
                  or retail manufacturer packaging may occur.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">8. User Responsibilities</h3>
                <p className="text-[#6B7280]">
                  Users agree not to exploit coupons improperly, conduct automated scraping, interfere with platform
                  infrastructure, or post defamatory content in product ratings and reviews.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">9. Account Suspension</h3>
                <p className="text-[#6B7280]">
                  CMCart reserves the right to suspend or terminate accounts that engage in fraudulent returns,
                  payment chargeback abuse, or repeated violations of platform policies.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#171717] mb-2">10. Changes to Terms</h3>
                <p className="text-[#6B7280]">
                  We may periodically revise these terms. Continued usage of CMCart after policy revisions constitutes
                  full acceptance of the updated terms.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-neutral-50/60 rounded-b-2xl flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#171717] text-white font-semibold text-sm hover:bg-neutral-800 transition-colors cursor-pointer"
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
