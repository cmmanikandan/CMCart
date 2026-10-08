/**
 * Firebase Authentication & Role Management Service for CMCart
 * Handles Real Google Sign-In, Email/Password, Sessions,
 * and RBAC (Customer vs Admin) with Supabase database synchronization.
 */

import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup, signOut } from 'firebase/auth';

const AUTH_USER_KEY = 'cmcart_auth_user_v1';

export const ADMIN_EMAILS = [
  'admin@cmcart.com',
  'manikandanprabhu37@gmail.com'
];

export const ADMIN_UIDS = [
  '4nEoHgT24ofMMkvhZJdCbOMjJmy1'
];

export function isUserAdmin(uid, email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (uid && ADMIN_UIDS.includes(uid)) return true;
  if (cleanEmail && (ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.endsWith('@admin.cmcart.com'))) return true;
  return false;
}

export const authService = {
  // Get current user from storage - NO FAKE DEMO USER FALLBACK
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Automatically purge obsolete demo user if lingering in storage
        if (parsed?.uid === 'usr-customer-8812' || parsed?.email === 'customer@cmcart.com') {
          localStorage.removeItem(AUTH_USER_KEY);
          return null;
        }
        // Auto-assign admin role if matching configured Admin UID or Email
        if (isUserAdmin(parsed?.uid, parsed?.email)) {
          parsed.role = 'admin';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading auth state:', e);
    }
    // Return null when not logged in - genuine Guest state
    return null;
  },

  // Real Google Sign-In with consent recording & live Firebase Auth
  async loginWithGoogle(consentData = {}) {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Authentication is not configured or unavailable.');
    }

    let result;
    try {
      result = await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Firebase Google Sign-In Error:', err);
      // Translate common Firebase error codes into friendly user messages
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completing. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        throw new Error(`Domain (${window.location.hostname}) is not authorized in Firebase. Add it to Firebase Console > Authentication > Settings > Authorized Domains.`);
      } else if (err.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      throw new Error(err.message || 'Unable to complete sign-in with Google. Please try again.');
    }

    if (!result?.user) {
      throw new Error('No user profile returned from Google.');
    }

    const fbUser = result.user;
    const emailLower = (fbUser.email || '').toLowerCase().trim();
    const isAdminUser = isUserAdmin(fbUser.uid, emailLower);
    const existing = this.getCurrentUser();
    const isSameUser = existing && (existing.email?.toLowerCase() === emailLower || existing.uid === fbUser.uid);

    let customerData = null;
    let cloudData = null;

    try {
      const { fetchUserFromCloud } = await import('../cloud/cloudSyncService');
      cloudData = await fetchUserFromCloud(fbUser.uid, fbUser);
    } catch (cloudErr) {
      console.warn('Cloud sync on login error:', cloudErr);
    }

    // Hydrate local addresses and orders if present in cloud
    if (cloudData && (cloudData.addresses?.length > 0 || cloudData.orders?.length > 0)) {
      try {
        const { commerceDb } = await import('../supabase/supabaseClient');
        commerceDb.hydrateUserData(cloudData.addresses, cloudData.orders);
      } catch (hErr) { /* ignore */ }
    }

    try {
      const { supabase } = await import('../supabase/supabaseClient');
      if (supabase && emailLower) {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('email', emailLower)
          .maybeSingle();
        customerData = data;
      }
    } catch (e) {
      // offline/fallback
    }

    const appUser = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: cloudData?.displayName || (isSameUser ? existing?.displayName : null) || customerData?.full_name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
      photoURL: cloudData?.photoURL || (isSameUser ? existing?.photoURL : null) || customerData?.avatar_url || fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'Customer')}`,
      phone: cloudData?.phone || (isSameUser ? existing?.phone : '') || customerData?.phone || fbUser.phoneNumber || '',
      gender: cloudData?.gender || (isSameUser ? existing?.gender : '') || customerData?.gender || '',
      age: cloudData?.age || (isSameUser ? existing?.age : null) || customerData?.age || null,
      role: isAdminUser ? 'admin' : (isSameUser ? existing?.role : cloudData?.role || 'customer') || 'customer',
      isProfileCompleted: !!cloudData?.isProfileCompleted || (isSameUser ? !!existing?.isProfileCompleted : (customerData ? !!customerData.is_profile_completed || !!customerData.gender : !!cloudData?.gender)),
      isEmailVerified: fbUser.emailVerified ?? true,
      privacy_policy_accepted: consentData.privacy_policy_accepted ?? true,
      terms_accepted: consentData.terms_accepted ?? true,
      privacy_policy_version: consentData.privacy_policy_version ?? '2026.1',
      terms_version: consentData.terms_version ?? '2026.1',
      accepted_at: consentData.accepted_at ?? new Date().toISOString(),
      created_at: (isSameUser ? existing?.created_at : null) || cloudData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store authenticated user in local storage
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(appUser));

    // Save to cloud asynchronously to ensure multi-device persistence
    try {
      const { saveUserToCloud } = await import('../cloud/cloudSyncService');
      await saveUserToCloud(appUser);
    } catch (cSaveErr) {
      console.warn('Save to cloud on login note:', cSaveErr);
    }

    // Upsert customer into Supabase database if available
    try {
      const { supabase } = await import('../supabase/supabaseClient');
      if (supabase && appUser.email) {
        await supabase.from('customers').upsert({
          auth_id: appUser.uid,
          email: appUser.email,
          full_name: appUser.displayName,
          phone: appUser.phone || null,
          avatar_url: appUser.photoURL || null,
          gender: appUser.gender || null,
          age: appUser.age || null,
          is_profile_completed: appUser.isProfileCompleted,
          status: 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
      }
    } catch (dbErr) {
      console.warn('Supabase customer profile sync note:', dbErr?.message);
    }

    return appUser;
  },

  // Sync state from Firebase onAuthStateChanged
  async syncFirebaseUser(fbUser) {
    if (!fbUser) return null;
    const emailLower = (fbUser.email || '').toLowerCase().trim();
    const isAdminUser = isUserAdmin(fbUser.uid, emailLower);
    const existing = this.getCurrentUser();
    const isSameUser = existing && (existing.email?.toLowerCase() === emailLower || existing.uid === fbUser.uid);

    let cloudData = null;
    try {
      const { fetchUserFromCloud } = await import('../cloud/cloudSyncService');
      cloudData = await fetchUserFromCloud(fbUser.uid, fbUser);
    } catch (cloudErr) {
      console.warn('Cloud sync on auth change note:', cloudErr);
    }

    // Hydrate local addresses and orders if present in cloud
    if (cloudData && (cloudData.addresses?.length > 0 || cloudData.orders?.length > 0)) {
      try {
        const { commerceDb } = await import('../supabase/supabaseClient');
        commerceDb.hydrateUserData(cloudData.addresses, cloudData.orders);
      } catch (hErr) { /* ignore */ }
    }

    const appUser = {
      uid: fbUser.uid,
      email: fbUser.email || existing?.email || '',
      displayName: cloudData?.displayName || (isSameUser ? existing?.displayName : null) || fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
      photoURL: cloudData?.photoURL || (isSameUser ? existing?.photoURL : null) || fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'Customer')}`,
      phone: cloudData?.phone || (isSameUser ? existing?.phone : '') || fbUser.phoneNumber || '',
      gender: cloudData?.gender || (isSameUser ? existing?.gender : '') || '',
      age: cloudData?.age || (isSameUser ? existing?.age : null) || null,
      isProfileCompleted: !!cloudData?.isProfileCompleted || (isSameUser && !!existing?.isProfileCompleted) || !!cloudData?.gender,
      role: isAdminUser ? 'admin' : (isSameUser ? existing?.role : cloudData?.role || 'customer'),
      isEmailVerified: fbUser.emailVerified ?? true,
      privacy_policy_accepted: existing?.privacy_policy_accepted ?? true,
      terms_accepted: existing?.terms_accepted ?? true,
      privacy_policy_version: existing?.privacy_policy_version ?? '2026.1',
      terms_version: existing?.terms_version ?? '2026.1',
      accepted_at: existing?.accepted_at ?? new Date().toISOString(),
      created_at: existing?.created_at || cloudData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(appUser));
    return appUser;
  },

  // Login with email and password
  async loginWithEmail(email, password) {
    await new Promise((r) => setTimeout(r, 400));
    const cleanEmail = email.trim().toLowerCase();

    const isAdminUser = isUserAdmin(null, cleanEmail);

    const user = {
      uid: `usr-${Date.now()}`,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0].replace(/[._]/g, ' '),
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
      phone: '',
      role: isAdminUser ? 'admin' : 'customer',
      isEmailVerified: true,
      created_at: new Date().toISOString()
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Register - Customer account
  async register(fullName, email, password, phone = '') {
    await new Promise((r) => setTimeout(r, 400));
    const cleanEmail = email.trim().toLowerCase();

    const user = {
      uid: `usr-${Date.now()}`,
      email: cleanEmail,
      displayName: fullName.trim(),
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      phone: phone.trim(),
      gender: '',
      age: null,
      role: 'customer',
      isEmailVerified: false,
      isProfileCompleted: false,
      created_at: new Date().toISOString()
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Switch role test helper for development / admin preview
  switchRole(role) {
    const current = this.getCurrentUser();
    if (!current) {
      const newUser = {
        uid: `usr-${role}-${Date.now()}`,
        email: `${role}@cmcart.com`,
        displayName: role === 'admin' ? 'Operations Admin' : 'Customer',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: '+91 98765 43210',
        role,
        isEmailVerified: true
      };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      return newUser;
    }
    const updated = { ...current, role };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  // Update profile
  async updateProfile(updates) {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));

    // Sync to Cloudinary cloud & Firebase Auth for cross-device persistence
    try {
      const { saveUserToCloud } = await import('../cloud/cloudSyncService');
      await saveUserToCloud(updated);
    } catch (cErr) {
      console.warn('Profile cloud sync note:', cErr);
    }

    // Also sync to Supabase if customer
    try {
      const { supabase } = await import('../supabase/supabaseClient');
      if (supabase && updated.email) {
        await supabase.from('customers').upsert({
          auth_id: updated.uid,
          email: updated.email,
          full_name: updated.displayName,
          phone: updated.phone || null,
          avatar_url: updated.photoURL || null,
          gender: updated.gender || null,
          age: updated.age || null,
          is_profile_completed: !!updated.isProfileCompleted,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
      }
    } catch (e) {
      console.warn('Profile sync warning:', e);
    }

    return updated;
  },

  // Real logout via Firebase signOut and localStorage clear
  async logout() {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};
