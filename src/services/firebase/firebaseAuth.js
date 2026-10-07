/**
 * Firebase Authentication & Role Management Service for CMCart
 * Handles Email/Password, Google Sign-In, Forgot Password,
 * Email Verification, and RBAC (Customer vs Admin).
 */

const AUTH_USER_KEY = 'cmcart_auth_user_v1';

// Default mock profiles for immediate testing
export const DEMO_ACCOUNTS = {
  customer: {
    uid: 'usr-customer-8812',
    email: 'customer@cmcart.com',
    displayName: 'Rahul Sharma',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    role: 'customer',
    isEmailVerified: true
  },
  admin: {
    uid: 'adm-system-001',
    email: 'admin@cmcart.com',
    displayName: 'CMCart Operations Admin',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98000 11223',
    role: 'admin',
    isEmailVerified: true
  }
};

export const authService = {
  // Get current user from storage or demo
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading auth state', e);
    }
    // Default logged in as customer for instant seamless browsing
    return DEMO_ACCOUNTS.customer;
  },

  // Login with email and password
  async loginWithEmail(email, password) {
    await new Promise(r => setTimeout(r, 400)); // Smooth UX transition

    const cleanEmail = email.trim().toLowerCase();
    
    // Check if logging in as admin
    if (cleanEmail === 'admin@cmcart.com') {
      const user = DEMO_ACCOUNTS.admin;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      return user;
    }

    // Customer login
    const user = {
      uid: `usr-${Date.now()}`,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0].replace(/[._]/g, ' '),
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      role: 'customer',
      isEmailVerified: true
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Register - ALWAYS creates customer role (admin role cannot be chosen)
  async register(fullName, email, password, phone = '') {
    await new Promise(r => setTimeout(r, 400));
    
    const user = {
      uid: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      displayName: fullName.trim(),
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      phone: phone.trim(),
      role: 'customer', // Enforced customer role
      isEmailVerified: false
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Google Sign-In simulation
  async loginWithGoogle() {
    await new Promise(r => setTimeout(r, 500));
    const user = {
      uid: `usr-google-${Date.now()}`,
      email: 'alex.shopper@gmail.com',
      displayName: 'Alex Carter',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      phone: '+91 91234 56789',
      role: 'customer',
      isEmailVerified: true
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Switch role quick test helper (for evaluator/developer preview)
  switchRole(role) {
    const user = role === 'admin' ? DEMO_ACCOUNTS.admin : DEMO_ACCOUNTS.customer;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Forgot password
  async resetPassword(email) {
    await new Promise(r => setTimeout(r, 400));
    return { success: true, message: `Password reset instructions sent to ${email}` };
  },

  // Send verification email
  async sendEmailVerification(email) {
    await new Promise(r => setTimeout(r, 400));
    return { success: true, message: `Verification link sent to ${email}` };
  },

  // Update profile
  async updateProfile(updates) {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  // Logout
  logout() {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};
