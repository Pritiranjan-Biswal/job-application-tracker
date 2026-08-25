import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Check existing session on application boot
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.getMe();
      if (data && data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // 401 unauthenticated is expected when not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sign up
  const signup = async (formData) => {
    try {
      const data = await authService.signup(formData);
      if (data && data.success && data.user) {
        setUser(data.user);
        toast.success(data.message || 'Account created successfully! Welcome!');
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      if (data && data.success && data.user) {
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.info('You have been logged out.');
      return { success: true };
    } catch (error) {
      setUser(null);
      return { success: true };
    }
  };

  // Update user in state after profile edits
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    signup,
    login,
    logout,
    updateUser,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
