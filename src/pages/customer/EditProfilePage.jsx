import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, ArrowLeft, Camera, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadImageToCloudinary } from '../../services/cloudinary/cloudinaryService';

export function EditProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading profile image...', 'info');
      const uploaded = await uploadImageToCloudinary(file);
      setPhotoURL(uploaded.url);
      showToast('Profile image updated!', 'success');
    } catch {
      showToast('Failed to upload image', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedAge = age ? parseInt(age, 10) : null;
      await updateProfile({
        displayName,
        email,
        phone,
        photoURL,
        gender,
        age: parsedAge
      });
      showToast('Profile updated successfully!', 'success');
      navigate('/profile');
    } catch {
      showToast('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
          Edit Profile
        </h1>
      </div>

      <div className="bg-white dark:bg-[#181818] p-6 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        {/* Profile Avatar Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover border-4 border-neutral-100 dark:border-neutral-800"
            />
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-[#E63946] text-white hover:bg-[#C92332] shadow-md cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-xs text-neutral-400 mt-2">Tap camera icon to update avatar</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2.5"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['Male', 'Female', 'Other'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    gender === g
                      ? 'border-[#E63946] bg-rose-50 dark:bg-rose-950/40 text-[#E63946]'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Age (Years)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
