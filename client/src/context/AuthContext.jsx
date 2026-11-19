import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { notify } = useNotification();
  const [token, setToken] = useState(() => localStorage.getItem('shopsphere_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
    setToken(null);
    setUser(null);
  }, []);

  // Listen for auto-logout from api interceptor
  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
      notify.warning('Your session has expired. Please sign in again.');
    };
    window.addEventListener('shopsphere_logout', handleLogoutEvent);
    return () => window.removeEventListener('shopsphere_logout', handleLogoutEvent);
  }, [logout, notify]);

  // Verify and hydrate current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('shopsphere_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[Auth] Session validation failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token, logout]);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('shopsphere_token', res.token);
        localStorage.setItem('shopsphere_user', JSON.stringify(res.user));
        notify.success(`Welcome back, ${res.user.name}!`);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (error) {
      notify.error(error.message);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('shopsphere_token', res.token);
        localStorage.setItem('shopsphere_user', JSON.stringify(res.user));
        notify.success('Account created! Welcome to ShopSphere.');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (error) {
      notify.error(error.message);
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await authService.updateProfile(data);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('shopsphere_user', JSON.stringify(res.user));
        notify.success('Profile details updated successfully!');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (error) {
      notify.error(error.message);
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
