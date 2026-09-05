import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getApiUrl, isBackendConfigured } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { AuthUser } from '../types';

const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null) {
    const msg = (payload as { msg?: unknown; message?: unknown }).msg ?? (payload as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

const inputClass =
  'w-full rounded-xl border border-[#381932]/30 dark:border-[#FFF3E6]/20 bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-4 py-2.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#FFF3E6] transition-all';

function Field({
  icon,
  error,
  children,
}: {
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]/70 dark:text-[#FFF3E6]/70">{icon}</span>
        {children}
      </div>
      {error && <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const finishLogin = (user: AuthUser, token: string) => auth.login(user, token);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!validateEmail(email)) errs.email = 'Enter a valid admin email';
    if (pass.length < 4) errs.pass = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const emailNorm = email.trim().toLowerCase();

    try {
      // 1. If backend API is configured or running locally in dev mode, try backend API first
      if (isBackendConfigured() || import.meta.env.DEV) {
        try {
          const res = await fetch(getApiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailNorm, password: pass }),
          });

          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.token && data.user) {
              if (data.user.role !== 'admin' && data.user.role !== 'staff') {
                setErrors({ email: 'This account does not have admin console access.' });
                setLoading(false);
                return;
              }
              finishLogin(data.user, data.token);
              return;
            }
          } else if (res.status === 400 || res.status === 401) {
            const data = await res.json().catch(() => null);
            const msg = getApiErrorMessage(data, '');
            if (msg && msg !== 'Login failed. Check your credentials.') {
              setErrors({ email: msg });
              setLoading(false);
              return;
            }
          }
          // If status is 404, 405 (Vercel static rewrite), or unreachable, fall through to Supabase
        } catch (apiErr) {
          console.warn('[CRM Auth] Express API attempt failed, proceeding to Supabase Auth:', apiErr);
        }
      }

      // 2. Direct Supabase Auth Fallback (Works directly on Vercel)
      const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
        email: emailNorm,
        password: pass,
      });

      if (supaErr || !supaData?.user || !supaData?.session) {
        setErrors({ email: supaErr?.message || 'Login failed. Check your credentials.' });
        setLoading(false);
        return;
      }

      // Check role in user metadata or public.users
      const meta = supaData.user.user_metadata || {};
      let role = meta.role;
      let firstName = meta.first_name || '';
      let lastName = meta.last_name || '';
      let permissions = meta.permissions;

      if (!role) {
        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role, first_name, last_name, permissions')
            .eq('email', emailNorm)
            .maybeSingle();

          if (dbUser) {
            role = dbUser.role;
            firstName = dbUser.first_name || firstName;
            lastName = dbUser.last_name || lastName;
            permissions = dbUser.permissions || permissions;
          }
        } catch {
          // Ignore public.users query errors and use default
        }
      }

      role = role || 'admin';

      if (role !== 'admin' && role !== 'staff') {
        setErrors({ email: 'This account does not have admin console access.' });
        setLoading(false);
        return;
      }

      const authUser: AuthUser = {
        id: supaData.user.id,
        email: supaData.user.email || emailNorm,
        role: role as 'admin' | 'staff',
        name: [firstName, lastName].filter(Boolean).join(' ') || supaData.user.email || 'Admin',
        firstName: firstName || '',
        lastName: lastName || '',
        permissions: permissions || ['products', 'categories', 'orders', 'addons', 'activities', 'sliders', 'users', 'settings', 'terms'],
      };

      finishLogin(authUser, supaData.session.access_token);
    } catch (err: any) {
      setErrors({ email: err?.message || 'Network error. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF3E6] dark:bg-[#381932] p-6 transition-colors">
      <div className="w-full max-w-md rounded-3xl border border-[#381932]/20 dark:border-[#FFF3E6]/20 bg-[#FFF3E6] dark:bg-[#381932] p-6 shadow-2xl sm:p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#381932]/10 dark:bg-[#FFF3E6]/10 border border-[#381932]/20 dark:border-[#FFF3E6]/20 text-[#381932] dark:text-[#FFF3E6] mb-3 shadow-inner">
            <Shield size={26} />
          </div>
          <h1 className="text-2xl font-black text-[#381932] dark:text-[#FFF3E6] tracking-tight">
            The Decor Party CRM
          </h1>
          <p className="mt-1 text-xs font-semibold text-[#381932]/80 dark:text-[#FFF3E6]/80">
            Secure Admin & Staff Portal
          </p>
        </div>

        {/* Global OAuth / Auth Errors */}
        {(auth.oauthError || errors.oauth) && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">{auth.oauthError || errors.oauth}</div>
          </div>
        )}

        <form onSubmit={submitLogin} className="space-y-4">
          <Field icon={<Mail size={15} />} error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@thedecorparty.com"
              className={inputClass}
              autoComplete="email"
            />
          </Field>
          <Field icon={<Lock size={15} />} error={errors.pass}>
            <input
              type={showPass ? 'text' : 'password'}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Password"
              className={`${inputClass} pr-10`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#381932]/70 dark:text-[#FFF3E6]/70 cursor-pointer"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#381932] dark:bg-[#FFF3E6] hover:opacity-90 text-[#FFF3E6] dark:text-[#381932] py-3 text-xs font-bold shadow-lg disabled:opacity-60 cursor-pointer transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In with Password →'}
          </button>
        </form>
      </div>
    </div>
  );
}
