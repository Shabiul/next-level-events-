import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthUser } from '../types';
import { getApiUrl } from '../lib/api';
import { supabase, signOutSupabase } from '../lib/supabase';
import { toast } from 'react-toastify';

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isLoading: boolean;
  initialized: boolean;
  oauthError: string | null;
}

interface AuthContextValue extends AuthState {
  login: (user: AuthUser, token: string) => void;
  logout: () => Promise<void>;
  clearOauthError: () => void;
}

const initialAuthState: AuthState = {
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  isStaff: false,
  isLoading: true,
  initialized: false,
  oauthError: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function stateFor(user: AuthUser): AuthState {
  return {
    user,
    isLoggedIn: true,
    isAdmin: user.role === 'admin',
    isStaff: user.role === 'staff',
    isLoading: false,
    initialized: true,
    oauthError: null,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const isHandlingOAuth = useRef(false);

  const exchangeSupabaseSession = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/supabase-oauth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.token || !data?.user) {
        const errorMsg = data?.msg || 'Supabase OAuth verification failed. Admin access denied.';
        toast.error(errorMsg);
        await signOutSupabase();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({
          user: null,
          isLoggedIn: false,
          isAdmin: false,
          isStaff: false,
          isLoading: false,
          initialized: true,
          oauthError: errorMsg,
        });
        return false;
      }

      const user = data.user as AuthUser;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setState(stateFor(user));
      toast.success(`Welcome back, ${user.name || user.email}!`);
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Network error during OAuth login.';
      toast.error(msg);
      await signOutSupabase();
      setState({
        user: null,
        isLoggedIn: false,
        isAdmin: false,
        isStaff: false,
        isLoading: false,
        initialized: true,
        oauthError: msg,
      });
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. Check if Supabase redirected back with a session or active session exists
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          isHandlingOAuth.current = true;
          const success = await exchangeSupabaseSession(sessionData.session.access_token);
          if (success) return;
        }
      } catch (err) {
        console.warn('Failed checking Supabase session:', err);
      }

      // 2. If no Supabase session or OAuth failed, check existing local JWT
      const token = localStorage.getItem('token');
      if (!token) {
        if (mounted) {
          setState({
            user: null,
            isLoggedIn: false,
            isAdmin: false,
            isStaff: false,
            isLoading: false,
            initialized: true,
            oauthError: null,
          });
        }
        return;
      }

      fetch(getApiUrl('/api/auth/profile'), { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload?.user) throw new Error('Failed to restore session');
          return payload.user as AuthUser;
        })
        .then((user) => {
          if (!mounted) return;
          if (user.role !== 'admin' && user.role !== 'staff') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setState({
              user: null,
              isLoggedIn: false,
              isAdmin: false,
              isStaff: false,
              isLoading: false,
              initialized: true,
              oauthError: null,
            });
            return;
          }
          localStorage.setItem('user', JSON.stringify(user));
          setState(stateFor(user));
        })
        .catch(() => {
          if (!mounted) return;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setState({
            user: null,
            isLoggedIn: false,
            isAdmin: false,
            isStaff: false,
            isLoading: false,
            initialized: true,
            oauthError: null,
          });
        });
    }

    initAuth();

    // Listen for Supabase auth state changes (e.g. when OAuth completes)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token && !isHandlingOAuth.current) {
        isHandlingOAuth.current = true;
        await exchangeSupabaseSession(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({
          user: null,
          isLoggedIn: false,
          isAdmin: false,
          isStaff: false,
          isLoading: false,
          initialized: true,
          oauthError: null,
        });
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [exchangeSupabaseSession]);

  const login = useCallback((user: AuthUser, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState(stateFor(user));
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await signOutSupabase();
    setState({
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      isStaff: false,
      isLoading: false,
      initialized: true,
      oauthError: null,
    });
  }, []);

  const clearOauthError = useCallback(() => {
    setState((prev) => ({ ...prev, oauthError: null }));
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout, clearOauthError }),
    [state, login, logout, clearOauthError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
