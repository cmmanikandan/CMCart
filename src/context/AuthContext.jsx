import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, isUserAdmin } from '../services/firebase/firebaseAuth';
import { auth } from '../services/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin' || isUserAdmin(user?.uid, user?.email);

  // Listen for live Firebase authentication session changes
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const appUser = await authService.syncFirebaseUser(fbUser);
        setUser(appUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = await authService.loginWithEmail(email, password);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, phone) => {
    setLoading(true);
    try {
      const u = await authService.register(fullName, email, password, phone);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (consentData) => {
    setLoading(true);
    try {
      const u = await authService.loginWithGoogle(consentData);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const switchRole = (role) => {
    const u = authService.switchRole(role);
    setUser(u);
    return u;
  };

  const updateProfile = async (updates) => {
    const u = await authService.updateProfile(updates);
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        isAdmin,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        switchRole,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
