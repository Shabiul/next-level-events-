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
      let response: Response | null = null;
      try {
        response = await fetch(getApiUrl('/api/auth/supabase-oauth'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        });
      } catch (netErr) {
        console.warn('Could not contact /api/auth/supabase-oauth:', netErr);
      }

      const data = response ? await response.json().catch(() => null) : null;

      if (response && response.ok && data?.token && data?.user) {
        const user = data.user as AuthUser;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user));
        setState(stateFor(user));
        toast.success(`Welcome back, ${user.name || user.email}!`);
        return true;
      }

      // If backend is unavailable or returns 405/404, verify directly with Supabase
      const { data: supaUser, error: supaErr } = await supabase.auth.getUser(accessToken);
      if (supaUser?.user && !supaErr) {
        const metadata = supaUser.user.user_metadata || {};
        let role = metadata.role;
        let firstName = metadata.first_name || '';
        let lastName = metadata.last_name || '';
        let permissions = metadata.permissions;

        if (!role) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role, first_name, last_name, permissions')
            .eq('email', (supaUser.user.email || '').toLowerCase().trim())
            .maybeSingle();

          if (dbUser) {
            role = dbUser.role;
            firstName = dbUser.first_name || firstName;
            lastName = dbUser.last_name || lastName;
            permissions = dbUser.permissions || permissions;
          }
        }

        role = role || 'admin';

        if (role === 'admin' || role === 'staff') {
          const user: AuthUser = {
            id: supaUser.user.id,
            email: supaUser.user.email || '',
            role: role as 'admin' | 'staff',
            name: [firstName, lastName].filter(Boolean).join(' ') || supaUser.user.email || 'Admin',
            firstName: firstName || '',
            lastName: lastName || '',
            permissions: permissions || ['products', 'categories', 'orders', 'addons', 'activities', 'sliders', 'users', 'settings', 'terms'],
          };
          localStorage.setItem('token', accessToken);
          localStorage.setItem('user', JSON.stringify(user));
          setState(stateFor(user));
          toast.success(`Welcome back, ${user.name || user.email}!`);
          return true;
        }
      }

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
          if (response.status === 405 || !response.ok) {
            // If backend returned 405/404, check if this is a valid Supabase token or cached user
            const { data: supaUserData } = await supabase.auth.getUser(token).catch(() => ({ data: null }));
            if (supaUserData?.user) {
              const cached = localStorage.getItem('user');
              if (cached) {
                try {
                  const u = JSON.parse(cached);
                  if (u?.role === 'admin' || u?.role === 'staff') {
                    return u as AuthUser;
                  }
                } catch {}
              }
              const meta = supaUserData.user.user_metadata || {};
              return {
                id: supaUserData.user.id,
                email: supaUserData.user.email || '',
                role: (meta.role as 'admin' | 'staff') || 'admin',
                name: [meta.first_name, meta.last_name].filter(Boolean).join(' ') || supaUserData.user.email || 'Admin',
                firstName: meta.first_name || '',
                lastName: meta.last_name || '',
                permissions: meta.permissions || ['products', 'categories', 'orders', 'addons', 'activities', 'sliders', 'users', 'settings', 'terms'],
              } as AuthUser;
            }
            throw new Error('Failed to restore session');
          }
          const payload = await response.json().catch(() => null);
          if (!payload?.user) throw new Error('Failed to restore session');
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
        .catch(async () => {
          if (!mounted) return;
          // Before logging out, check if user has active Supabase session or cached admin user
          const { data: supaSession } = await supabase.auth.getSession().catch(() => ({ data: null }));
          if (supaSession?.session) {
            const cached = localStorage.getItem('user');
            if (cached) {
              try {
                const u = JSON.parse(cached);
                if (u?.role === 'admin' || u?.role === 'staff') {
                  setState(stateFor(u));
                  return;
                }
              } catch {}
            }
          }

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
