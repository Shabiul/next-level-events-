import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Phone, KeyRound, Eye, EyeOff, AlertCircle, Settings } from 'lucide-react';
import { getApiUrl, getApiBaseUrl, setApiBaseUrl, isBackendConfigured } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { AuthUser } from '../types';

const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePhone = (v: string) => /^[6-9]\d{9}$/.test(v);

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
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // login fields
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  // register fields
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [confirm, setConfirm] = useState('');
  const [adminSecret, setAdminSecret] = useState('');

  // API endpoint configuration settings
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => getApiBaseUrl());

  const finishLogin = (user: AuthUser, token: string) => auth.login(user, token);

  const handleSaveApiUrl = () => {
    setApiBaseUrl(customApiUrl);
    setErrors({});
    setShowApiSettings(false);
  };

  const handleResetApiUrl = () => {
    setApiBaseUrl('');
    setCustomApiUrl('');
    setErrors({});
  };

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

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!first.trim()) errs.first = 'Enter first name';
    if (!last.trim()) errs.last = 'Enter last name';
    if (!validateEmail(email)) errs.email = 'Enter a valid email address';
    if (!validatePhone(phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (pass.length < 8) errs.pass = 'Password must be at least 8 characters';
    if (pass !== confirm) errs.confirm = 'Passwords do not match';
    if (!adminSecret.trim()) errs.adminSecret = 'Admin security passcode is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const emailNorm = email.trim().toLowerCase();

    try {
      if (isBackendConfigured() || import.meta.env.DEV) {
        try {
          const res = await fetch(getApiUrl('/api/auth/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: first.trim(),
              lastName: last.trim(),
              email: emailNorm,
              password: pass,
              phone: phone.trim(),
              role: 'admin',
              adminSecret: adminSecret.trim(),
            }),
          });
          const data = await res.json().catch(() => null);
          if (res.ok) {
            const loginRes = await fetch(getApiUrl('/api/auth/login'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: emailNorm, password: pass }),
            });
            const loginData = await loginRes.json().catch(() => null);
            if (loginRes.ok && loginData?.token && loginData.user) {
              finishLogin(loginData.user, loginData.token);
              return;
            }
          } else if (res.status === 400 || res.status === 401) {
            setErrors({ adminSecret: getApiErrorMessage(data, 'Registration failed. Verify the passcode.') });
            setLoading(false);
            return;
          }
        } catch {
          // Fall through to direct Supabase registration
        }
      }

      // Check passcode
      if (adminSecret.trim() !== 'TDP_ADMIN_TEST_2026' && adminSecret.trim() !== 'TDP_ADMIN_PROD_2026') {
        setErrors({ adminSecret: 'Invalid admin security passcode.' });
        setLoading(false);
        return;
      }

      const { data: supaReg, error: regErr } = await supabase.auth.signUp({
        email: emailNorm,
        password: pass,
        options: {
          data: {
            role: 'admin',
            first_name: first.trim(),
            last_name: last.trim(),
            phone: phone.trim(),
            permissions: ['products', 'categories', 'orders', 'addons', 'activities', 'sliders', 'users', 'settings', 'terms'],
          },
        },
      });

      if (regErr || !supaReg?.user) {
        setErrors({ adminSecret: regErr?.message || 'Registration failed.' });
        setLoading(false);
        return;
      }

      await supabase.from('users').upsert({
        id: supaReg.user.id,
        email: emailNorm,
        role: 'admin',
        first_name: first.trim(),
        last_name: last.trim(),
        phone: phone.trim(),
        permissions: ['products', 'categories', 'orders', 'addons', 'activities', 'sliders', 'users', 'settings', 'terms'],
      }).then(null, () => {});

      if (supaReg.session?.access_token) {
        const user: AuthUser = {
          id: supaReg.user.id,
          email: emailNorm,
          role: 'admin',
          name: `${first.trim()} ${last.trim()}`.trim(),
          firstName: first.trim(),
          lastName: last.trim(),
          permissions: ['products', 'categories', 'orders', 'addons', 'activities', 'sliders', 'users', 'settings', 'terms'],
        };
        finishLogin(user, supaReg.session.access_token);
      } else {
        setMode('login');
        setLoading(false);
      }
    } catch {
      setErrors({ adminSecret: 'Network error during registration.' });
      setLoading(false);
    }
  };

  const activeBaseUrl = getApiBaseUrl();

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
            {mode === 'login' ? 'Secure Admin & Staff Portal' : 'Register a new administrator'}
          </p>
        </div>

        {/* Global OAuth / Auth Errors */}
        {(auth.oauthError || errors.oauth) && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">{auth.oauthError || errors.oauth}</div>
          </div>
        )}

        {mode === 'login' ? (
          <div className="space-y-4">
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
              <button
                type="button"
                onClick={() => { setErrors({}); setMode('register'); }}
                className="w-full text-center text-xs font-medium text-[#381932]/80 dark:text-[#FFF3E6]/80 hover:underline cursor-pointer"
              >
                Register a new administrator
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={submitRegister} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Field icon={<User size={15} />} error={errors.first}>
                <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" className={inputClass} autoComplete="given-name" />
              </Field>
              <Field icon={<User size={15} />} error={errors.last}>
                <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" className={inputClass} autoComplete="family-name" />
              </Field>
            </div>
            <Field icon={<Mail size={15} />} error={errors.email}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Official email" className={inputClass} autoComplete="email" />
            </Field>
            <Field icon={<Phone size={15} />} error={errors.phone}>
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className={inputClass} autoComplete="tel" maxLength={10} />
            </Field>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Field icon={<Lock size={15} />} error={errors.pass}>
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min 8 chars" className={inputClass} autoComplete="new-password" />
              </Field>
              <Field icon={<Lock size={15} />} error={errors.confirm}>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className={inputClass} autoComplete="new-password" />
              </Field>
            </div>
            <Field icon={<KeyRound size={15} />} error={errors.adminSecret}>
              <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Admin security passcode" className={inputClass} />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#381932] dark:bg-[#FFF3E6] hover:opacity-90 text-[#FFF3E6] dark:text-[#381932] py-3 text-xs font-bold shadow-lg disabled:opacity-60 cursor-pointer transition-all"
            >
              {loading ? 'Registering...' : 'Register & Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setErrors({}); setMode('login'); }}
              className="w-full text-center text-xs font-medium text-[#381932]/80 dark:text-[#FFF3E6]/80 hover:underline cursor-pointer"
            >
              ← Back to sign in
            </button>
          </form>
        )}

        {/* Backend API Connection Status & Settings */}
        <div className="pt-2 border-t border-[#381932]/10 dark:border-[#FFF3E6]/10 text-center">
          <button
            type="button"
            onClick={() => setShowApiSettings((s) => !s)}
            className="text-[11px] font-semibold text-[#381932]/60 dark:text-[#FFF3E6]/60 hover:text-[#381932] dark:hover:text-[#FFF3E6] hover:underline inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings size={12} />
            {activeBaseUrl ? `API: ${activeBaseUrl.replace(/^https?:\/\//, '')}` : 'Configure Backend API URL'}
          </button>

          {showApiSettings && (
            <div className="mt-2.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-left space-y-2 text-xs border border-[#381932]/10 dark:border-[#FFF3E6]/10">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[#381932] dark:text-[#FFF3E6]">
                  Backend API Endpoint
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isBackendConfigured() ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                  {isBackendConfigured() ? 'Connected' : 'Supabase Direct'}
                </span>
              </div>
              <p className="text-[11px] text-[#381932]/70 dark:text-[#FFF3E6]/70 leading-relaxed">
                If your NLE backend is deployed on Vercel, enter its URL here (e.g. <code className="bg-black/10 px-1 py-0.5 rounded text-[10px]">https://your-nle-deployment.vercel.app</code>) or configure <code className="bg-black/10 px-1 py-0.5 rounded text-[10px]">VITE_API_URL</code> in Vercel project settings.
              </p>
              <input
                type="url"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="https://your-nle-project.vercel.app"
                className="w-full px-3 py-1.5 rounded-xl border border-[#381932]/20 dark:border-[#FFF3E6]/20 bg-white dark:bg-[#381932] text-xs font-mono outline-none"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveApiUrl}
                  className="px-3 py-1 bg-[#381932] text-white dark:bg-[#FFF3E6] dark:text-[#381932] rounded-lg font-bold text-[11px] cursor-pointer hover:opacity-90"
                >
                  Save URL
                </button>
                {customApiUrl && (
                  <button
                    type="button"
                    onClick={handleResetApiUrl}
                    className="px-2 py-1 text-[11px] text-red-500 hover:underline font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

