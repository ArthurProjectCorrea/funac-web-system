'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import {
  AuthContextType,
  AuthStatus,
  LoginFormData,
  LoginResponse,
  MfaFormData,
  User,
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
          setStatus('unauthenticated');
          return;
        }

        // Try to get user profile
        const profile = await apiClient.getProfile();
        setUser(profile.user);
        setStatus('authenticated');
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearAuthState();
      }
    };

    initializeAuth();
  }, []);

  const clearAuthState = () => {
    setUser(null);
    setStatus('unauthenticated');
    apiClient.clearTokens();
  };

  const login = async (credentials: LoginFormData): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(
        credentials.email,
        credentials.password
      );

      if (!response.requiresMfa) {
        // Direct login without MFA
        const { accessToken, refreshToken, user } = response;

        if (accessToken && refreshToken && user) {
          apiClient.setAccessToken(accessToken);

          // Store refresh token based on rememberMe preference
          const cookieOptions = credentials.rememberMe
            ? { expires: 7, secure: true, sameSite: 'strict' as const }
            : { secure: true, sameSite: 'strict' as const };

          Cookies.set('refresh_token', refreshToken, cookieOptions);

          setUser(user);
          setStatus('authenticated');
        }
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMfa = async (
    data: MfaFormData,
    sessionId: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.verifyMfa(data.code, sessionId);
      const { accessToken, refreshToken, user } = response;

      apiClient.setAccessToken(accessToken);
      Cookies.set('refresh_token', refreshToken, {
        expires: 7,
        secure: true,
        sameSite: 'strict',
      });

      setUser(user);
      setStatus('authenticated');

      // Redirect to intended page or dashboard
      const returnUrl = new URLSearchParams(window.location.search).get(
        'returnUrl'
      );
      router.push(returnUrl || '/dashboard');
    } catch (error) {
      console.error('MFA verification failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
      setIsLoading(false);
      router.push('/login');
    }
  };

  const logoutAll = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      clearAuthState();
      setIsLoading(false);
      router.push('/login');
    }
  };

  const value: AuthContextType = {
    user,
    status,
    login,
    verifyMfa,
    logout,
    logoutAll,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { status, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        const currentPath = window.location.pathname;
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      }
    }, [status, router]);

    if (status === 'loading') {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (status === 'unauthenticated' || !user) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook for checking permissions
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user?.permissions) return false;

    return user.permissions.some(
      permission =>
        permission.action === action && permission.resource === resource
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;

    return user.roles.some(role => role.name === roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!user?.roles) return false;

    return user.roles.some(role => roleNames.includes(role.name));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    permissions: user?.permissions || [],
    roles: user?.roles || [],
  };
}
