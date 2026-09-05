import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Phone, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getApiUrl } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { signInWithOAuth } from '../lib/supabase';
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

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
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

  const finishLogin = (user: AuthUser, token: string) => auth.login(user, token);

  const handleOAuthLogin = async (provider: 'google' | 'github' = 'google') => {
    setOauthLoading(true);
    setErrors({});
    try {
      await signInWithOAuth(provider);
      // Supabase will redirect the browser to the OAuth provider
    } catch (err: any) {
      setErrors({ oauth: err?.message || 'Failed to start Supabase OAuth sign-in.' });
      setOauthLoading(false);
    }
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!validateEmail(email)) errs.email = 'Enter a valid admin email';
    if (pass.length < 4) errs.pass = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.token || !data.user) {
        setErrors({ email: getApiErrorMessage(data, 'Login failed. Check your credentials.') });
        setLoading(false);
        return;
      }
      if (data.user.role !== 'admin' && data.user.role !== 'staff') {
        setErrors({ email: 'This account does not have admin console access.' });
        setLoading(false);
        return;
      }
      finishLogin(data.user, data.token);
    } catch {
      setErrors({ email: 'Network error. Please try again.' });
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
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: first.trim(),
          lastName: last.trim(),
          email: email.trim(),
          password: pass,
          phone: phone.trim(),
          role: 'admin',
          adminSecret: adminSecret.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErrors({ adminSecret: getApiErrorMessage(data, 'Registration failed. Verify the passcode.') });
        setLoading(false);
        return;
      }

      const loginRes = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });
      const loginData = await loginRes.json().catch(() => null);
      if (loginRes.ok && loginData?.token && loginData.user) {
        finishLogin(loginData.user, loginData.token);
      } else {
        setMode('login');
        setLoading(false);
      }
    } catch {
      setErrors({ adminSecret: 'Network error during registration.' });
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
            {/* Supabase OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={oauthLoading || loading}
              className="w-full flex items-center justify-center rounded-2xl border border-[#381932]/20 dark:border-[#FFF3E6]/20 bg-white dark:bg-[#381932]/80 hover:bg-neutral-50 dark:hover:bg-[#381932] text-[#381932] dark:text-[#FFF3E6] py-3 text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
            >
              <GoogleIcon />
              {oauthLoading ? 'Redirecting to Supabase OAuth...' : 'Sign in with Google (Supabase OAuth)'}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#381932]/20 dark:border-[#FFF3E6]/20 w-full" />
              <span className="bg-[#FFF3E6] dark:bg-[#381932] px-3 text-[10px] font-bold tracking-wider uppercase text-[#381932]/60 dark:text-[#FFF3E6]/60 shrink-0">
                Or with Admin Email
              </span>
              <div className="border-t border-[#381932]/20 dark:border-[#FFF3E6]/20 w-full" />
            </div>

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
                disabled={loading || oauthLoading}
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
      </div>
    </div>
  );
}
