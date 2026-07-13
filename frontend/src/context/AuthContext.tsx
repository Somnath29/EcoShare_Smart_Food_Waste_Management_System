import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, User, UserRole } from '../types/auth.js';
import { apiRequest, getAuthToken, setAuthToken, removeAuthToken } from '../services/api.js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        setToken(currentToken);
      } else {
        // Clear corrupt state
        logout();
      }
    } catch (error) {
      console.error('[Auth check error]:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (data.success && data.token && data.user) {
        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message || 'Login successful' };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Server error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, role: UserRole, password: string) => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, role, password },
      });

      if (data.success && data.token && data.user) {
        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message || 'Registration successful' };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Server error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      return {
        success: data.success,
        message: data.message,
        debugToken: data.debugToken,
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Server error' };
    }
  };

  const resetPassword = async (password: string, resetToken: string) => {
    try {
      const data = await apiRequest(`/auth/reset-password/${resetToken}`, {
        method: 'POST',
        body: { password },
      });
      return { success: data.success, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Server error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
