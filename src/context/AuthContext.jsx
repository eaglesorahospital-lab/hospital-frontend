import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial sync from localStorage (supports both user and user_info keys)
    const getStoredUser = () => {
      try {
        const raw = localStorage.getItem('user') || localStorage.getItem('user_info');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const savedUser = authApi.getCurrentUser() || getStoredUser();
    const hasToken = authApi.isAuthenticated() || Boolean(localStorage.getItem('access_token'));

    if (savedUser && hasToken) {
      setUser(savedUser);
    }
    setLoading(false);

    // Sync on external login / logout
    const handleLoginEvent = () => {
      const u = getStoredUser();
      setUser(u);
    };

    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth:login', handleLoginEvent);
    window.addEventListener('auth:logout', handleLogoutEvent);
    window.addEventListener('storage', handleLoginEvent);
    return () => {
      window.removeEventListener('auth:login', handleLoginEvent);
      window.removeEventListener('auth:logout', handleLogoutEvent);
      window.removeEventListener('storage', handleLoginEvent);
    };
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    setUser(data.user);
    return data;
  };

  const register = async (patientData) => {
    return await authApi.register(patientData);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const getUserProfile = async () => {
    return await authApi.getUserProfile();
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user && authApi.isAuthenticated()),
    login,
    register,
    logout,
    getUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

