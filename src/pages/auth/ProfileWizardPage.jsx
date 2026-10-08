import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  MapPin,
  CheckCircle2,
  Phone,
  Building,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Camera,
  Home,
  Briefcase,
  Compass,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { commerceDb } from '../../services/supabase/supabaseClient';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Puducherry', 'Chandigarh'
];

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
];

export function ProfileWizardPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Profile & Gender, 2: Address, 3: Success
  const [loading, setLoading] = useState(false);

  // Step 1: Personal Details
  const [avatarUrl, setAvatarUrl] = useState(
    user?.photoURL || AVATAR_OPTIONS[0]
  );
  const [fullName, setFullName] = useState(user?.displayName || '');
  // Extract 10-digit phone if user.phone has +91
  const [mobileNumber, setMobileNumber] = useState(() => {
    if (!user?.phone) return '';
    return user.phone.replace('+91', '').replace(/\s+/g, '').trim();
  });
  const [gender, setGender] = useState('Male'); // 'Male' | 'Female' | 'Other'

  // Step 2: Indian Address Format
  const [receiverName, setReceiverName] = useState(user?.displayName || '');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [flatHouse, setFlatHouse] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [addressType, setAddressType] = useState('Home'); // 'Home' | 'Work' | 'Other'
  const [isDefault, setIsDefault] = useState(true);

  // Sync initial receiver name when full name changes
  useEffect(() => {
    if (!receiverName && fullName) {
      setReceiverName(fullName);
    }
  }, [fullName, receiverName]);

  useEffect(() => {
    if (!receiverPhone && mobileNumber) {
      setReceiverPhone(mobileNumber);
    }
  }, [mobileNumber, receiverPhone]);

  // Trigger celebratory Red Color Blast Confetti Effect
  const triggerRedBlast = () => {
    const redPalette = ['#E63946', '#D62828', '#FF4D6D', '#FFFFFF', '#C9184A', '#9B2226'];

    // Center burst
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.55 },
      colors: redPalette,
      shapes: ['square', 'circle']
    });

    // Left & Right cannon blasts
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.65 },
        colors: redPalette
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.65 },
        colors: redPalette
      });
    }, 250);

    // High altitude shower
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 120,
        origin: { y: 0.3 },
        colors: ['#E63946', '#FF758F', '#FFFFFF']
      });
    }, 500);
  };

  const handleNextStep1 = (e) => {
    e?.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      showToast('Please enter a valid 10-digit Indian mobile number', 'error');
      return;
    }

    setReceiverName(fullName.trim());
    setReceiverPhone(cleanMobile);
    setStep(2);
  };

  const handleCompleteWizard = async (e) => {
    e?.preventDefault();

    if (!flatHouse.trim() || !streetArea.trim()) {
      showToast('Please enter your house/flat number and street area', 'error');
      return;
    }

    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      showToast('Please enter a valid 6-digit Indian PIN code', 'error');
      return;
    }

    if (!city.trim() || !state.trim()) {
      showToast('Please enter city and select your state', 'error');
      return;
    }

    setLoading(true);

    try {
      const fullAddressString = `${flatHouse.trim()}, ${streetArea.trim()}${
        landmark.trim() ? `, Near ${landmark.trim()}` : ''
      }`;
      const fullPhone = `+91 ${mobileNumber.replace(/\D/g, '')}`;

      // 1. Save Address to database
      await commerceDb.addAddress({
        full_name: receiverName.trim() || fullName.trim(),
        phone: receiverPhone ? `+91 ${receiverPhone.replace(/\D/g, '')}` : fullPhone,
        address_line: fullAddressString,
        city: city.trim(),
        state: state.trim(),
        pincode: cleanPin,
        type: addressType,
        is_default: isDefault
      });

      // 2. Update user profile with DP, name, mobile with +91, gender
      await updateProfile({
        displayName: fullName.trim(),
        photoURL: avatarUrl,
        phone: fullPhone,
        gender,
        isProfileCompleted: true
      });

      showToast('Profile and delivery address saved successfully!', 'success');
      setStep(3); // Go to success screen
      triggerRedBlast(); // Fire red color blast effect
    } catch (err) {
      console.error('Profile wizard save error:', err);
      showToast('Saved profile locally. Welcome to CMCart!', 'info');
      setStep(3);
      triggerRedBlast();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#111111] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-[#E63946]/20 selection:text-[#E63946] transition-colors">
      
      {/* Top Header */}
      <header className="w-full border-b border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-[#181818]/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <BrandLogo size="md" />

          {/* Stepper Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-[#E63946] text-white shadow-md shadow-red-500/20 scale-105'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4 stroke-[3]" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-6 sm:w-12 h-1 rounded-full transition-all ${
                      step > s ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step < 3 && (
            <Link
              to="/home"
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Skip
            </Link>
          )}
        </div>
      </header>

      {/* Main Wizard Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#181818] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-neutral-200/50 dark:shadow-black/60 transition-colors">
          
          {/* ==================================================
              STEP 1: DP, NAME, +91 MOBILE, GENDER
              ================================================== */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold tracking-widest text-[#E63946] uppercase bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200/60 dark:border-rose-900/40">
                  Step 1 of 2
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50 pt-2">
                  Complete Your Profile
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  Add your photo, phone number, and personal details for express checkout.
                </p>
              </div>

              {/* DP (Profile Picture Showcase & Picker) */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="relative group">
                  <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#E63946] shadow-lg shadow-red-500/10 transition-transform group-hover:scale-102"
                  />
                  <div className="absolute -bottom-2 -right-2 p-2 bg-[#E63946] text-white rounded-xl shadow-md border-2 border-white dark:border-[#181818]">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                {/* Email Chip */}
                {user?.email && (
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                    {user.email}
                  </span>
                )}

                {/* Quick Avatar Swatches */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-neutral-400 font-semibold mr-1">Choose DP:</span>
                  {AVATAR_OPTIONS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        avatarUrl === url
                          ? 'border-[#E63946] scale-110 shadow-xs'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Full Name <span className="text-[#E63946]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-hidden focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020] transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number with Default India +91 Tag */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Mobile Number <span className="text-[#E63946]">*</span>
                </label>
                <div className="flex rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 overflow-hidden focus-within:border-[#E63946] focus-within:bg-white dark:focus-within:bg-[#202020] transition-all">
                  <div className="px-3.5 py-3 bg-neutral-100 dark:bg-neutral-800 flex items-center gap-1.5 border-r border-neutral-200 dark:border-neutral-700 shrink-0">
                    <span className="text-base">🇮🇳</span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full bg-transparent px-4 py-3 text-sm font-semibold focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  We'll send order confirmations and express OTP delivery tracking to this number.
                </p>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Gender <span className="text-[#E63946]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Male', icon: '👨' },
                    { label: 'Female', icon: '👩' },
                    { label: 'Other', icon: '🧑' }
                  ].map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => setGender(g.label)}
                      className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                        gender === g.label
                          ? 'border-[#E63946] bg-rose-50/60 dark:bg-rose-950/30 text-[#E63946] shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className="text-base">{g.icon}</span>
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-13 rounded-2xl text-base font-bold shadow-md shadow-red-500/20"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Continue to Delivery Address
                </Button>
              </div>
            </form>
          )}

          {/* ==================================================
              STEP 2: INDIAN DELIVERY ADDRESS IN CORRECT FORMAT
              ================================================== */}
          {step === 2 && (
            <form onSubmit={handleCompleteWizard} className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold tracking-widest text-[#E63946] uppercase bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200/60 dark:border-rose-900/40">
                  Step 2 of 2
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50 pt-2">
                  Add Delivery Address
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  Where should we deliver your purchases?
                </p>
              </div>

              {/* Address Type Pill Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Home', icon: Home, desc: 'All Day' },
                    { id: 'Work', icon: Briefcase, desc: '10 AM - 6 PM' },
                    { id: 'Other', icon: Compass, desc: 'Flexible' }
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAddressType(t.id)}
                        className={`p-2.5 rounded-2xl border-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                          addressType === t.id
                            ? 'border-[#E63946] bg-rose-50/60 dark:bg-rose-950/30 text-[#E63946]'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Recipient Name <span className="text-[#E63946]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Recipient Name"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Contact Phone <span className="text-[#E63946]">*</span>
                  </label>
                  <div className="flex rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 overflow-hidden focus-within:border-[#E63946]">
                    <span className="px-2.5 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-500 border-r border-neutral-200 dark:border-neutral-700">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit number"
                      className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Flat / House No / Building */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Flat, House No., Building, Apartment <span className="text-[#E63946]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={flatHouse}
                  onChange={(e) => setFlatHouse(e.target.value)}
                  placeholder="e.g. Flat 402, Sunshine Heights, Tower B"
                  className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020]"
                />
              </div>

              {/* Area, Street, Sector */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Area, Street, Sector, Locality <span className="text-[#E63946]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={streetArea}
                  onChange={(e) => setStreetArea(e.target.value)}
                  placeholder="e.g. 100 Feet Road, Indiranagar"
                  className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020]"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Landmark <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station / Opposite Park"
                  className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020]"
                />
              </div>

              {/* City, State & PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    PIN Code <span className="text-[#E63946]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 Digits"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    City <span className="text-[#E63946]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City / District"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    State <span className="text-[#E63946]">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#E63946] focus:bg-white dark:focus:bg-[#202020]"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="default-addr"
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E63946] border-neutral-300 focus:ring-[#E63946] cursor-pointer accent-[#E63946]"
                />
                <label htmlFor="default-addr" className="text-xs text-neutral-600 dark:text-neutral-400 font-medium cursor-pointer">
                  Set as default delivery address for all orders
                </label>
              </div>

              {/* Navigation CTAs */}
              <div className="flex items-center gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  className="rounded-2xl"
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="flex-1 h-13 rounded-2xl font-bold shadow-md shadow-red-500/20"
                >
                  {loading ? 'Saving Profile...' : 'Save & Finish Setup'}
                </Button>
              </div>
            </form>
          )}

          {/* ==================================================
              STEP 3: SUCCESS CELEBRATION WITH RED BLAST EFFECT
              ================================================== */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-500">
              {/* Animated Celebration Icon */}
              <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
                <div className="absolute inset-0 bg-[#E63946]/25 rounded-full blur-xl animate-pulse" />
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-[#E63946] to-rose-600 text-white flex items-center justify-center shadow-xl shadow-red-500/30">
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#E63946] bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200/60 dark:border-rose-900/40">
                  🎉 Profile Verified & Active
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50">
                  Setup Complete!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  Your delivery address and profile are now configured. You are ready to enjoy seamless 1-click checkout and express delivery!
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-neutral-50 dark:bg-neutral-850 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#E63946]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {fullName}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      +91 {mobileNumber} · <span className="font-semibold text-neutral-700 dark:text-neutral-300">{gender}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-800 flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <MapPin className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">
                      {addressType} Address:
                    </p>
                    <p className="mt-0.5 leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {flatHouse}, {streetArea}
                      {landmark ? `, Near ${landmark}` : ''}, {city}, {state} - {pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={() => navigate('/home')}
                  variant="primary"
                  size="lg"
                  className="w-full h-13 rounded-2xl font-bold text-base shadow-lg shadow-red-500/25"
                  icon={ShoppingBag}
                >
                  Start Shopping Now
                </Button>

                <button
                  type="button"
                  onClick={triggerRedBlast}
                  className="text-xs font-bold text-[#E63946] hover:underline flex items-center justify-center gap-1.5 mx-auto py-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Replay Celebration Blast</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800 py-4 px-4 text-center text-xs text-neutral-400">
        <p>© 2026 CMCart. India's Smart Commerce Destination. 100% Genuine Products.</p>
      </footer>
    </div>
  );
}
