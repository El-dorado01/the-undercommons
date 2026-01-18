'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { sharetribeSdk } from '@/lib/sharetribe';
import { type CurrentUser } from 'sharetribe-flex-sdk';

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: any) => Promise<void>;
  signup: (params: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (params: any) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check initial authentication state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await sharetribeSdk.currentUser.show({
          include: ['profileImage'],
        });
        if (currentUser) {
          setUser(currentUser as unknown as CurrentUser);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // Not authenticated or error
        console.log('User not authenticated:', e);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (params: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await sharetribeSdk.login(params);
      const currentUser = await sharetribeSdk.currentUser.show({
        include: ['profileImage'],
      });
      setUser(currentUser as unknown as CurrentUser);
      setIsAuthenticated(true);
    } catch (e: any) {
      console.error('Login error:', e);
      setError(e.message || 'Login failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (params: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Sharetribe SDK requires specific signup flow, usually creates a user
      // For this implementation, we assume we use the currentUser.create method
      // Note: Make sure SDK and marketplace are configured for public signup if this is used directly
      await sharetribeSdk.currentUser.create(params);

      // Auto-login after signup if needed, or ask user to login
      // Usually need to login to get the token
      await sharetribeSdk.login({
        username: params.email,
        password: params.password,
      });

      const currentUser = await sharetribeSdk.currentUser.show({
        include: ['profileImage'],
      });
      setUser(currentUser as unknown as CurrentUser);
      setIsAuthenticated(true);
    } catch (e: any) {
      console.error('Signup error:', e);
      setError(e.message || 'Signup failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await sharetribeSdk.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (e: any) {
      console.error('Logout error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (params: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await sharetribeSdk.currentUser.updateProfile(params);
      const currentUser = await sharetribeSdk.currentUser.show({
        include: ['profileImage'],
      });
      setUser(currentUser as unknown as CurrentUser);
    } catch (e: any) {
      console.error('Update profile error:', e);
      setError(e.message || 'Update failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
