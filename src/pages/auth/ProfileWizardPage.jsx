import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Heart,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Phone,
  Calendar,
  Building,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function ProfileWizardPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '+91 ');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('2000-01-15');

  // Step 2: Delivery Address
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState('Home');

  // Step 3: Shopping Preferences
  const [selectedCategories, setSelectedCategories] = useState([
    'Electronics',
    'Fashion & Apparel',
    'Audio'
  ]);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  const availableCategories = [
    'Electronics',
    'Mobiles & Tablets',
    'Fashion & Apparel',
    'Footwear',
    'Home & Living',
    'Beauty & Personal Care',
    'Smartwatches & Wearables',
    'Audio & Headphones'
  ];

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleNext = (e) => {
    e?.preventDefault();
    if (step === 1) {
      if (!fullName.trim()) {
        showToast('Please enter your full name', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!addressLine.trim() || !city.trim() || !pincode.trim()) {
        showToast('Please fill in your address, city, and pincode', 'error');
        return;
      }
      setStep(3);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Save Address to Database
      if (addressLine.trim()) {
        await commerceDb.addAddress({
          full_name: fullName.trim(),
          phone: phone.trim(),
          address_line: addressLine.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          type: addressType,
          is_default: true
        });
      }

      // 2. Update User Profile
      await updateProfile({
        displayName: fullName.trim(),
        phone: phone.trim(),
        gender,
        dob,
        preferences: selectedCategories,
        whatsappUpdates,
        isProfileCompleted: true
      });

      showToast('Profile setup complete! Welcome to CMCart.', 'success');
      navigate('/home');
    } catch (err) {
      console.error('Wizard error', err);
      showToast('Failed to save profile. Proceeding to store...', 'info');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#121212] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between">
      {/* Top Header & Progress Stepper */}
      <div className="w-full border-b border-neutral-100 dark:border-neutral-800 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />

          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-[#E63946] text-white shadow-xs'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-6 sm:w-10 h-0.5 transition-all ${
                      step > s ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/home')}
            className="text-xs font-bold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Screen-Fit Main Form Area */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Step 1: Personal Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[11px] font-extrabold text-[#E63946] uppercase tracking-widest block">
                STEP 1 OF 3 • YOUR IDENTITY
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Tell us a bit about yourself
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Help us customize your receipts, notifications, and personalized offers.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#E63946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Mobile Number (For Delivery OTP) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#E63946]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm focus:outline-none focus:border-[#E63946]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Delivery Address */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[11px] font-extrabold text-[#E63946] uppercase tracking-widest block">
                STEP 2 OF 3 • EXPRESS DELIVERY
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Where should we deliver your orders?
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Add your primary doorstep shipping address for 1-click lightning checkout.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Complete Address (House / Flat / Street / Area) *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <textarea
                    rows={2}
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. Flat 402, Skyline Residency, 14th Main Road, Indiranagar"
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#E63946]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560038"
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm focus:outline-none focus:border-[#E63946]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Address Type
                  </label>
                  <div className="flex gap-2">
                    {['Home', 'Work'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressType(type)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          addressType === type
                            ? 'bg-[#E63946] text-white border-[#E63946]'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Shopping Interests */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[11px] font-extrabold text-[#E63946] uppercase tracking-widest block">
                STEP 3 OF 3 • YOUR FEED
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                What are you shopping for?
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Select your favorite categories so we curate the best deals and flash discounts for you.
              </p>
            </div>

            {/* Category Pills Grid */}
            <div className="flex flex-wrap gap-2.5">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#E63946] text-white border-[#E63946] shadow-xs'
                        : 'bg-neutral-50 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Notification Checkbox */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Instant WhatsApp Order & Delivery Updates
                </p>
                <p className="text-[11px] text-neutral-400">
                  Receive live milestone tracking and OTP directly on your phone.
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappUpdates}
                onChange={(e) => setWhatsappUpdates(e.target.checked)}
                className="w-4.5 h-4.5 accent-[#E63946] rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Screen-Fit Bottom Navigation Bar */}
      <div className="w-full border-t border-neutral-100 dark:border-neutral-800 p-4 sm:p-6 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={ChevronLeft}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              className="px-6"
            >
              Continue to Step {step + 1}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleComplete}
              className="px-8 shadow-md"
            >
              Complete Setup & Start Shopping 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
