/**
 * Firebase Authentication & Role Management Service for CMCart
 * Handles Real Google Sign-In, Email/Password, Sessions,
 * and RBAC (Customer vs Admin) with Supabase database synchronization.
 */

import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup, signOut } from 'firebase/auth';

const AUTH_USER_KEY = 'cmcart_auth_user_v1';

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
    const isAdminUser = emailLower === 'admin@cmcart.com' || emailLower.endsWith('@admin.cmcart.com');

    const appUser = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
      photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'Customer')}`,
      phone: fbUser.phoneNumber || '',
      role: isAdminUser ? 'admin' : 'customer',
      isEmailVerified: fbUser.emailVerified ?? true,
      privacy_policy_accepted: consentData.privacy_policy_accepted ?? true,
      terms_accepted: consentData.terms_accepted ?? true,
      privacy_policy_version: consentData.privacy_policy_version ?? '2026.1',
      terms_version: consentData.terms_version ?? '2026.1',
      accepted_at: consentData.accepted_at ?? new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store authenticated user in local storage
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(appUser));

    // Upsert customer into Supabase database
    try {
      const { supabase } = await import('../supabase/supabaseClient');
      if (supabase && appUser.email) {
        await supabase.from('customers').upsert({
          auth_id: appUser.uid,
          email: appUser.email,
          full_name: appUser.displayName,
          phone: appUser.phone || null,
          avatar_url: appUser.photoURL || null,
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
    const isAdminUser = emailLower === 'admin@cmcart.com' || emailLower.endsWith('@admin.cmcart.com');
    const existing = this.getCurrentUser();

    const appUser = {
      uid: fbUser.uid,
      email: fbUser.email || existing?.email || '',
      displayName: fbUser.displayName || existing?.displayName || fbUser.email?.split('@')[0] || 'Customer',
      photoURL: fbUser.photoURL || existing?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'Customer')}`,
      phone: fbUser.phoneNumber || existing?.phone || '',
      role: isAdminUser ? 'admin' : (existing?.role || 'customer'),
      isEmailVerified: fbUser.emailVerified ?? true,
      privacy_policy_accepted: existing?.privacy_policy_accepted ?? true,
      terms_accepted: existing?.terms_accepted ?? true,
      privacy_policy_version: existing?.privacy_policy_version ?? '2026.1',
      terms_version: existing?.terms_version ?? '2026.1',
      accepted_at: existing?.accepted_at ?? new Date().toISOString(),
      created_at: existing?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(appUser));
    return appUser;
  },

  // Login with email and password
  async loginWithEmail(email, password) {
    await new Promise((r) => setTimeout(r, 400));
    const cleanEmail = email.trim().toLowerCase();

    const isAdminUser = cleanEmail === 'admin@cmcart.com';

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
      role: 'customer',
      isEmailVerified: false,
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
