import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.displayName || 'Customer'}!`, 'success');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      showToast('Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('Signed in with Google successfully!', 'success');
      navigate('/home');
    } catch {
      showToast('Google Sign-In failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (type) => {
    if (type === 'customer') {
      setEmail('customer@cmcart.com');
      setPassword('customer123');
    } else {
      setEmail('admin@cmcart.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#111111] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white dark:bg-[#181818] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Desktop Promotional Visual */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-neutral-900 text-white relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&auto=format&fit=crop&q=80"
            alt="CMCart Lifestyle"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

          <div className="relative z-10">
            <BrandLogo size="lg" />
            <p className="text-neutral-400 text-sm mt-3">
              India's preferred mass-market digital commerce store.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <span className="text-[#E63946] font-bold text-xs uppercase tracking-wider block mb-1">
                MEMBERS ADVANTAGE
              </span>
              <p className="text-white text-base font-semibold leading-snug">
                Exclusive festive discounts, express doorstep delivery & verified authentic warranty.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Protected by 256-bit SSL & Firebase Authentication</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Authentication Form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <div className="lg:hidden mb-4">
              <BrandLogo size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Sign in with your email or mobile credentials to continue.
            </p>
          </div>

          {/* Quick Demo Pre-fill Pill Bar */}
          <div className="mb-5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Instant 1-Click Credentials:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('customer')}
                className="flex-1 py-1 px-2 text-xs font-semibold rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 hover:border-[#E63946] text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                Customer Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin')}
                className="flex-1 py-1 px-2 text-xs font-semibold rounded-lg bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 hover:bg-[#E63946]/20 transition-colors"
              >
                Admin Demo
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Email / Mobile
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#E63946] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <span className="relative bg-white dark:bg-[#181818] px-3 text-xs font-medium text-neutral-400 uppercase">
              OR
            </span>
          </div>

          {/* Google Sign-in */}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
            Continue with Google
          </Button>

          {/* Register Link */}
          <p className="text-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#E63946] hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
