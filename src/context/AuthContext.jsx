import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/firebase/firebaseAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

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

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const u = await authService.loginWithGoogle();
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
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
