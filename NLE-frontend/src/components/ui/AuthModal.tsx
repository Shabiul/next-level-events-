import { auth } from "../../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, Shield, KeyRound, UserPlus, LogIn } from 'lucide-react';
import type { AuthTab, AuthUser } from '../../types';
import { cn } from '../../utils/utils';
import { getApiUrl } from '../../services/api.service';
import { trackLogin, trackSignup } from '../../utils/analytics';

function getGoogleAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: string }).code)
    : '';

  if (code === 'auth/popup-blocked') {
    return 'Popup was blocked. Please allow popups and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error during Google login. Please check your connection and retry.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return '';
  }
  return 'Google login failed. Please try again.';
}

function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null) {
    const maybeMsg = (payload as { msg?: unknown; message?: unknown }).msg ?? (payload as { message?: unknown }).message;
    if (typeof maybeMsg === 'string' && maybeMsg.trim()) return maybeMsg;
  }
  return fallback;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  tab: AuthTab;
  onClose: () => void;
  onSetTab: (tab: AuthTab) => void;
  onLogin: (user: AuthUser, token?: string) => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z"/>
  </svg>
);

function validateEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePhone(v: string) { return /^[6-9]\d{9}$/.test(v); }

function getStrength(val: string): { score: number; label: string; color: string; bg: string; width: string } {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const map = [
    { label: '', color: '#E4DCD2', bg: 'bg-[#E4DCD2]', width: '0%' },
    { label: 'Weak', color: '#f87171', bg: 'bg-rose-500', width: '25%' },
    { label: 'Fair', color: '#fbbf24', bg: 'bg-amber-400', width: '50%' },
    { label: 'Good', color: '#34d399', bg: 'bg-emerald-400', width: '75%' },
    { label: 'Strong', color: '#C9BEAB', bg: 'bg-[#C9BEAB]', width: '100%' },
  ];
  return { score, ...map[score] };
}

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  error?: string;
  autoComplete?: string;
  prefix?: string;
  endAdornment?: React.ReactNode;
  maxLength?: number;
  labelRight?: React.ReactNode;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon,
  error,
  autoComplete,
  prefix,
  endAdornment,
  maxLength,
  labelRight,
  placeholder,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-[#F9F6F2]/90 tracking-wide">
          {label}
        </label>
        {labelRight}
      </div>
      <div
        className={cn(
          'flex h-11 sm:h-12 items-center gap-2.5 rounded-xl border bg-black/40 backdrop-blur-md px-3.5 transition-all duration-200',
          error
            ? 'border-rose-400/80 ring-1 ring-rose-400/30'
            : 'border-[#725D75]/25 focus-within:border-[#C9BEAB] focus-within:ring-2 focus-within:ring-[#C9BEAB]/20 hover:border-[#725D75]/40'
        )}
      >
        {icon && <span className="flex-shrink-0 text-[#725D75]">{icon}</span>}
        {prefix && <span className="flex-shrink-0 text-xs font-medium text-[#A78A9F]">{prefix}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          className="w-full bg-transparent text-sm text-[#F9F6F2] outline-none placeholder:text-[#A78A9F]/40"
        />
        {endAdornment}
      </div>
      {error && <span className="text-[11.5px] font-medium text-rose-400 animate-fade-in">{error}</span>}
    </div>
  );
};

const PasswordInput: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  labelRight?: React.ReactNode;
  placeholder?: string;
}> = ({ id, label, value, onChange, error, autoComplete, labelRight, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <InputField
      id={id}
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      icon={<Lock size={15} />}
      error={error}
      autoComplete={autoComplete}
      labelRight={labelRight}
      placeholder={placeholder || '••••••••'}
      endAdornment={
        <button
          type="button"
          tabIndex={-1}
          className="flex-shrink-0 text-[#725D75] hover:text-[#F9F6F2] transition-colors cursor-pointer"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
};

const SocialGoogleButton: React.FC<{ onClick: () => void; loading: boolean; label: string }> = ({ onClick, loading, label }) => (
  <button
    type="button"
    className="flex h-11 sm:h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 px-4 text-xs sm:text-sm font-medium text-[#F9F6F2] transition-all hover:border-white/25 active:scale-[0.98] disabled:opacity-60 shadow-sm cursor-pointer"
    onClick={onClick}
    disabled={loading}
  >
    {loading ? (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#C9BEAB]" />
    ) : (
      <GoogleIcon />
    )}
    <span>{loading ? 'Connecting...' : label}</span>
  </button>
);

const SubmitButton: React.FC<{ loading: boolean; loadingLabel: string; children: React.ReactNode }> = ({ loading, loadingLabel, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F9F6F2] hover:bg-[#F2ECE3] text-[#25172C] text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
  >
    {loading ? (
      <>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#25172C]/20 border-t-[#25172C]" />
        <span>{loadingLabel}</span>
      </>
    ) : (
      <span>{children}</span>
    )}
  </button>
);

/* ========================================================================= */
/* 1. CUSTOMER LOGIN FORM                                                    */
/* ========================================================================= */
const LoginForm: React.FC<{
  onSuccess: (user: AuthUser, token?: string) => void;
  onRegister: () => void;
  onForgot: () => void;
  onAdminPortal: () => void;
}> = ({ onSuccess, onRegister, onForgot, onAdminPortal }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: firebaseUser.photoURL || '',
        }),
      });

      const data = await parseJsonResponse<{ token?: string; user?: { id: string; firstName: string; lastName: string; email: string; role: AuthUser['role'] }; msg?: string; message?: string }>(res);
      if (!res.ok || !data?.token || !data.user) {
        const msg = getApiErrorMessage(data, 'Google login failed');
        setErrors({ email: msg });
        return;
      }

      trackLogin('google', data.user.id);
      onSuccess({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        role: data.user.role,
      }, data.token);
    } catch (error) {
      const msg = getGoogleAuthErrorMessage(error);
      if (msg) setErrors({ email: msg });
    } finally {
      setGoogleLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!validateEmail(email)) errs.email = 'Please enter a valid email address';
    if (pass.length < 6) errs.pass = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await parseJsonResponse<{ token?: string; user?: { id: string; firstName: string; lastName: string; email: string; role: AuthUser['role'] }; msg?: string; message?: string }>(res);
      if (!res.ok || !data?.token || !data.user) {
        const msg = getApiErrorMessage(data, 'Login failed. Please check your credentials.');
        setErrors({ email: msg });
        setLoading(false);
        return;
      }
      trackLogin('email');
      onSuccess({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        role: data.user.role,
      }, data.token);
    } catch {
      setErrors({ email: 'Connection failed. Please check network.' });
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 animate-fade-in" onSubmit={submit} noValidate>
      {/* Header section */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F9F6F2] font-serif">
            Customer Log In
          </h2>
          <p className="mt-1 text-xs sm:text-[13px] text-[#A78A9F] font-light">
            Enter your email to manage your celebration bookings
          </p>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="text-xs sm:text-sm font-semibold text-[#A78A9F] hover:text-[#F9F6F2] hover:underline transition-colors cursor-pointer shrink-0 mt-1"
        >
          Create Account →
        </button>
      </div>

      <InputField
        id="loginEmail"
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        icon={<Mail size={15} />}
        error={errors.email}
        autoComplete="email"
        placeholder="m@example.com"
      />

      <PasswordInput
        id="loginPass"
        label="Password"
        value={pass}
        onChange={setPass}
        error={errors.pass}
        autoComplete="current-password"
        labelRight={
          <button
            type="button"
            className="text-xs text-[#A78A9F] hover:text-[#A78A9F] hover:underline cursor-pointer transition-colors"
            onClick={onForgot}
          >
            Forgot password?
          </button>
        }
      />

      <div className="flex items-center justify-between text-xs pt-0.5">
        <label className="flex cursor-pointer items-center gap-2 text-[#A78A9F] select-none">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-[#725D75]/40 bg-black/40 accent-[#C9BEAB]"
          />
          <span>Remember me</span>
        </label>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <SubmitButton loading={loading} loadingLabel="Signing in...">
          Customer Log In →
        </SubmitButton>

        <SocialGoogleButton
          onClick={handleGoogle}
          loading={googleLoading}
          label="Sign in with Google"
        />

        {/* Customer Registration Callout */}
        <div className="pt-2 text-center text-xs text-[#A78A9F]">
          <span>New to TheDecorParty? </span>
          <button
            type="button"
            onClick={onRegister}
            className="font-semibold text-[#A78A9F] hover:text-[#F9F6F2] hover:underline transition-colors cursor-pointer"
          >
            Create Customer Account
          </button>
        </div>

        {/* Quick Admin Portal Access Link */}
        <div className="pt-2 border-t border-[#725D75]/20 text-center">
          <button
            type="button"
            onClick={onAdminPortal}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#A78A9F] hover:text-[#A78A9F] transition-colors cursor-pointer"
          >
            <Shield size={13} className="text-[#A78A9F]" />
            <span>Authorized Staff? Switch to Admin Portal</span>
          </button>
        </div>
      </div>
    </form>
  );
};

/* ========================================================================= */
/* 2. CUSTOMER REGISTER FORM                                                 */
/* ========================================================================= */
const RegisterForm: React.FC<{
  onSuccess: (user: AuthUser, token?: string) => void;
  onLogin: () => void;
  onAdminRegister: () => void;
}> = ({ onSuccess, onLogin, onAdminRegister }) => {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const strength = getStrength(pass);

  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: firebaseUser.photoURL || '',
        }),
      });

      const data = await parseJsonResponse<{ token?: string; user?: { id: string; firstName: string; lastName: string; email: string; role: AuthUser['role'] }; msg?: string; message?: string }>(res);
      if (!res.ok || !data?.token || !data.user) {
        const msg = getApiErrorMessage(data, 'Google registration failed');
        setErrors({ email: msg });
        return;
      }

      trackSignup('google');
      onSuccess({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        role: data.user.role,
      }, data.token);
    } catch (error) {
      const msg = getGoogleAuthErrorMessage(error);
      if (msg) setErrors({ email: msg });
    } finally {
      setGoogleLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const errs: Record<string, string> = {};
    if (!first.trim()) errs.first = 'Enter your first name';
    if (!last.trim()) errs.last = 'Enter your last name';
    if (!validateEmail(email)) errs.email = 'Enter a valid email address';
    if (!validatePhone(phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (pass.length < 8) errs.pass = 'Password must be at least 8 characters';
    if (pass !== confirm) errs.confirm = 'Passwords do not match';
    if (!terms) errs.terms = 'You must agree to the Terms & Privacy Policy';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: first.trim(), lastName: last.trim(), email: email.trim(), password: pass, phone: phone.trim() })
      });
      const data = await parseJsonResponse<{ msg?: string; message?: string }>(res);
      if (!res.ok) {
        const msg = getApiErrorMessage(data, 'Registration failed. Please try again.');
        setSubmitError(msg);
        setErrors({ email: msg });
        setLoading(false);
        return;
      }

      const loginRes = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass })
      });
      const loginData = await parseJsonResponse<{ token?: string; user?: { id: string; firstName: string; lastName: string; email: string; role: AuthUser['role'] }; msg?: string; message?: string }>(loginRes);
      if (loginRes.ok && loginData?.token && loginData.user) {
        trackSignup('email');
        onSuccess({
          id: loginData.user.id,
          firstName: loginData.user.firstName,
          lastName: loginData.user.lastName,
          email: loginData.user.email,
          role: loginData.user.role,
        }, loginData.token);
      } else {
        setSubmitError('Account created! Please log in with your credentials.');
        setLoading(false);
        onLogin();
      }
    } catch {
      setSubmitError('Registration failed due to a network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-3.5 animate-fade-in" onSubmit={submit} noValidate>
      {/* Header section with Log In toggle */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F9F6F2] font-serif">
            Create Customer Account
          </h2>
          <p className="mt-1 text-xs sm:text-[13px] text-[#A78A9F] font-light">
            Join TheDecorParty to book and customize celebration events
          </p>
        </div>
        <button
          type="button"
          onClick={onLogin}
          className="text-xs sm:text-sm font-semibold text-[#A78A9F] hover:text-[#F9F6F2] hover:underline transition-colors cursor-pointer shrink-0 mt-1"
        >
          Sign In →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <InputField
          id="regFirst"
          label="First Name"
          value={first}
          onChange={setFirst}
          icon={<User size={15} />}
          error={errors.first}
          autoComplete="given-name"
          placeholder="First name"
        />
        <InputField
          id="regLast"
          label="Last Name"
          value={last}
          onChange={setLast}
          error={errors.last}
          autoComplete="family-name"
          placeholder="Last name"
        />
      </div>

      <InputField
        id="regEmail"
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        icon={<Mail size={15} />}
        error={errors.email}
        autoComplete="email"
        placeholder="m@example.com"
      />

      <InputField
        id="regPhone"
        label="Mobile Number"
        type="tel"
        value={phone}
        onChange={v => setPhone(v.replace(/\D/g, '').slice(0, 10))}
        icon={<Phone size={15} />}
        prefix="+91"
        error={errors.phone}
        autoComplete="tel"
        maxLength={10}
        placeholder="9876543210"
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <PasswordInput
            id="regPass"
            label="Password"
            value={pass}
            onChange={setPass}
            error={errors.pass}
            autoComplete="new-password"
            placeholder="Min 8 chars"
          />
          {pass && (
            <div className="mt-1 flex flex-col gap-0.5">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn('h-full rounded-full transition-all duration-300', strength.bg)}
                  style={{ width: strength.width }}
                />
              </div>
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="text-[#A78A9F]">Strength:</span>
                <span className="font-semibold" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            </div>
          )}
        </div>

        <PasswordInput
          id="regConfirm"
          label="Confirm Password"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm || (confirm && pass !== confirm ? 'Passwords do not match' : undefined)}
          autoComplete="new-password"
          placeholder="Repeat pass"
        />
      </div>

      <div>
        <label className="flex items-start gap-2 text-xs text-[#A78A9F] select-none cursor-pointer">
          <input
            type="checkbox"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#725D75]/40 bg-black/40 accent-[#C9BEAB]"
          />
          <span>
            I agree to the Terms of Service & Privacy Policy
          </span>
        </label>
        {errors.terms && <span className="mt-0.5 block text-xs font-medium text-rose-400">{errors.terms}</span>}
      </div>

      {submitError && (
        <div className="rounded-xl bg-rose-500/20 border border-rose-500/40 p-2.5 text-xs font-medium text-rose-300" role="alert">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-1">
        <SubmitButton loading={loading} loadingLabel="Creating customer account...">
          Create Customer Account →
        </SubmitButton>

        <SocialGoogleButton
          onClick={handleGoogle}
          loading={googleLoading}
          label="Sign up with Google"
        />

        {/* Existing account switcher */}
        <div className="pt-2 text-center text-xs text-[#A78A9F]">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={onLogin}
            className="font-semibold text-[#A78A9F] hover:text-[#F9F6F2] hover:underline transition-colors cursor-pointer"
          >
            Customer Sign In
          </button>
        </div>

        <div className="pt-2 border-t border-[#725D75]/20 text-center">
          <button
            type="button"
            onClick={onAdminRegister}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#A78A9F] hover:text-[#A78A9F] transition-colors cursor-pointer"
          >
            <Shield size={13} className="text-[#A78A9F]" />
            <span>Authorized Manager? Register Admin Account</span>
          </button>
        </div>
      </div>
    </form>
  );
};

/* ========================================================================= */
/* 3. ADMIN PORTAL LOGIN FORM                                                */
/* ========================================================================= */
const AdminLoginForm: React.FC<{
  onSuccess: (user: AuthUser, token?: string) => void;
  onAdminRegister: () => void;
  onUserLogin: () => void;
}> = ({ onSuccess, onAdminRegister, onUserLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!validateEmail(email)) errs.email = 'Enter valid administrator email';
    if (pass.length < 4) errs.pass = 'Enter administrator password';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await parseJsonResponse<{ token?: string; user?: { id: string; firstName: string; lastName: string; email: string; role: AuthUser['role'] }; msg?: string; message?: string }>(res);
      if (!res.ok || !data?.token || !data.user) {
        const msg = getApiErrorMessage(data, 'Admin authorization failed. Invalid credentials.');
        setErrors({ email: msg });
        setLoading(false);
        return;
      }

      if (data.user.role !== 'admin') {
        setErrors({ email: 'Access denied. This account does not possess admin privileges.' });
        setLoading(false);
        return;
      }

      trackLogin('admin_portal', data.user.id);
      onSuccess({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        role: 'admin',
      }, data.token);
    } catch {
      setErrors({ email: 'Connection error during admin login.' });
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 animate-fade-in" onSubmit={submit} noValidate>
      {/* Admin Badge & Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9BEAB]/15 border border-[#C9BEAB]/30 text-[#A78A9F] text-[11px] font-bold uppercase tracking-wider mb-2.5">
          <Shield size={13} className="text-[#A78A9F]" />
          <span>Admin Control Portal</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F9F6F2] font-serif">
          Administrator Sign In
        </h2>
        <p className="mt-1 text-xs sm:text-[13px] text-[#A78A9F] font-light">
          Enter authorized administrative credentials to access controls
        </p>
      </div>

      <InputField
        id="adminLoginEmail"
        label="Admin Email"
        type="email"
        value={email}
        onChange={setEmail}
        icon={<Mail size={15} />}
        error={errors.email}
        autoComplete="email"
        placeholder="admin@nextlevelevents.com"
      />

      <PasswordInput
        id="adminLoginPass"
        label="Admin Password"
        value={pass}
        onChange={setPass}
        error={errors.pass}
        autoComplete="current-password"
      />

      <div className="flex flex-col gap-3 mt-2">
        <SubmitButton loading={loading} loadingLabel="Authorizing Admin...">
          Access Admin Dashboard →
        </SubmitButton>

        <div className="flex items-center justify-between pt-2 border-t border-[#725D75]/20 text-xs">
          <button
            type="button"
            onClick={onAdminRegister}
            className="text-[#A78A9F] hover:underline font-medium cursor-pointer"
          >
            Register Admin Account
          </button>
          <button
            type="button"
            onClick={onUserLogin}
            className="text-[#A78A9F] hover:text-[#F9F6F2] transition-colors cursor-pointer"
          >
            ← Customer Login
          </button>
        </div>
      </div>
    </form>
  );
};

/* ========================================================================= */
/* 4. ADMIN REGISTRATION FORM                                                */
/* ========================================================================= */
const AdminRegisterForm: React.FC<{
  onSuccess: (user: AuthUser, token?: string) => void;
  onAdminLogin: () => void;
  onUserLogin: () => void;
}> = ({ onSuccess, onAdminLogin, onUserLogin }) => {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const errs: Record<string, string> = {};
    if (!first.trim()) errs.first = 'Enter first name';
    if (!last.trim()) errs.last = 'Enter last name';
    if (!validateEmail(email)) errs.email = 'Enter a valid email address';
    if (!validatePhone(phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (pass.length < 8) errs.pass = 'Password must be at least 8 characters';
    if (pass !== confirm) errs.confirm = 'Passwords do not match';
    if (!adminSecret.trim()) errs.adminSecret = 'Admin Security Passcode is required';
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
        })
      });
      const data = await parseJsonResponse<{ msg?: string; message?: string; role?: string }>(res);
      if (!res.ok) {
        const msg = getApiErrorMessage(data, 'Admin registration failed. Please verify passcode.');
        setSubmitError(msg);
        setErrors({ adminSecret: msg });
        setLoading(false);
        return;
      }

      // Auto-login as admin
      const loginRes = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass })
      });
      const loginData = await parseJsonResponse<{ token?: string; user?: { id: string; firstName: string; lastName: string; email: string; role: AuthUser['role'] }; msg?: string; message?: string }>(loginRes);
      if (loginRes.ok && loginData?.token && loginData.user) {
        trackSignup('admin');
        onSuccess({
          id: loginData.user.id,
          firstName: loginData.user.firstName,
          lastName: loginData.user.lastName,
          email: loginData.user.email,
          role: 'admin',
        }, loginData.token);
      } else {
        setSubmitError('Admin account created! Please sign in with your credentials.');
        setLoading(false);
        onAdminLogin();
      }
    } catch {
      setSubmitError('Network error during admin registration.');
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-3.5 animate-fade-in" onSubmit={submit} noValidate>
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9BEAB]/15 border border-[#C9BEAB]/30 text-[#A78A9F] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Shield size={13} className="text-[#A78A9F]" />
          <span>Staff Registration</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F9F6F2] font-serif">
          Register Admin Account
        </h2>
        <p className="mt-0.5 text-xs sm:text-[13px] text-[#A78A9F] font-light">
          Authorized manager / decorator account creation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <InputField
          id="adminRegFirst"
          label="First Name"
          value={first}
          onChange={setFirst}
          icon={<User size={15} />}
          error={errors.first}
          autoComplete="given-name"
          placeholder="First name"
        />
        <InputField
          id="adminRegLast"
          label="Last Name"
          value={last}
          onChange={setLast}
          error={errors.last}
          autoComplete="family-name"
          placeholder="Last name"
        />
      </div>

      <InputField
        id="adminRegEmail"
        label="Official Email"
        type="email"
        value={email}
        onChange={setEmail}
        icon={<Mail size={15} />}
        error={errors.email}
        autoComplete="email"
        placeholder="admin@nextlevelevents.com"
      />

      <InputField
        id="adminRegPhone"
        label="Mobile Number"
        type="tel"
        value={phone}
        onChange={v => setPhone(v.replace(/\D/g, '').slice(0, 10))}
        icon={<Phone size={15} />}
        prefix="+91"
        error={errors.phone}
        autoComplete="tel"
        maxLength={10}
        placeholder="9876543210"
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <PasswordInput
          id="adminRegPass"
          label="Password"
          value={pass}
          onChange={setPass}
          error={errors.pass}
          autoComplete="new-password"
          placeholder="Min 8 chars"
        />
        <PasswordInput
          id="adminRegConfirm"
          label="Confirm Password"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
          autoComplete="new-password"
          placeholder="Repeat pass"
        />
      </div>

      {/* Admin Security Key Field */}
      <InputField
        id="adminSecretKey"
        label="Admin Security Passcode"
        type="password"
        value={adminSecret}
        onChange={setAdminSecret}
        icon={<KeyRound size={15} className="text-[#A78A9F]" />}
        error={errors.adminSecret}
        placeholder="e.g. TDP_ADMIN_2026"
        labelRight={
          <span className="text-[10.5px] text-[#A78A9F] font-medium">
            (Required for Admin access)
          </span>
        }
      />

      {submitError && (
        <div className="rounded-xl bg-rose-500/20 border border-rose-500/40 p-2.5 text-xs font-medium text-rose-300" role="alert">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-1">
        <SubmitButton loading={loading} loadingLabel="Registering Admin...">
          Register as Admin Account →
        </SubmitButton>

        <div className="flex items-center justify-between pt-2 border-t border-[#725D75]/20 text-xs">
          <button
            type="button"
            onClick={onAdminLogin}
            className="text-[#A78A9F] hover:underline font-medium cursor-pointer"
          >
            Already Admin? Log in
          </button>
          <button
            type="button"
            onClick={onUserLogin}
            className="text-[#A78A9F] hover:text-[#F9F6F2] transition-colors cursor-pointer"
          >
            ← Customer Login
          </button>
        </div>
      </div>
    </form>
  );
};

/* ========================================================================= */
/* 5. FORGOT PASSWORD FORM                                                   */
/* ========================================================================= */
const ForgotForm: React.FC<{ onBack: () => void; onSuccess: (user: AuthUser, token?: string) => void }> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const send = () => {
    if (!validateEmail(email)) { setError('Enter a valid email address'); return; }
    onSuccess({ id: `u_${Date.now()}`, firstName: '', lastName: '', email, role: 'user' });
  };

  return (
    <form onSubmit={e => { e.preventDefault(); send(); }} className="flex flex-col gap-4 animate-fade-in" noValidate>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F9F6F2] font-serif">
          Reset password
        </h2>
        <p className="mt-1 text-xs sm:text-[13px] text-[#A78A9F] font-light">
          Enter your email to receive a password reset link.
        </p>
      </div>

      <InputField
        id="forgotEmail"
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        icon={<Mail size={15} />}
        error={error}
        autoComplete="email"
        placeholder="m@example.com"
      />

      <div className="flex flex-col gap-3 mt-1">
        <SubmitButton loading={false} loadingLabel="Sending...">
          Send reset link
        </SubmitButton>

        <button
          type="button"
          className="text-center text-xs font-medium text-[#A78A9F] hover:text-[#A78A9F] transition-colors cursor-pointer py-1"
          onClick={onBack}
        >
          ← Back to login
        </button>
      </div>
    </form>
  );
};

/* ========================================================================= */
/* 6. SUCCESS PANEL                                                          */
/* ========================================================================= */
const SuccessPanel: React.FC<{ title: string; msg: string; isAdmin?: boolean; onClose: () => void }> = ({ title, msg, isAdmin, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-3.5 py-6 text-center animate-scale-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#725D75] border border-[#725D75]/40 text-[#A78A9F] shadow-lg">
        {isAdmin ? <Shield size={26} className="text-[#A78A9F]" /> : <Sparkles size={26} className="text-[#A78A9F]" />}
      </div>
      <h2 className="text-xl font-bold text-[#F9F6F2] font-serif">{title}</h2>
      <p className="text-xs sm:text-sm text-[#A78A9F] max-w-xs leading-relaxed">{msg}</p>
      <button
        className="mt-3 flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-[#F9F6F2] hover:bg-[#F2ECE3] text-sm font-semibold text-[#25172C] shadow-lg transition-all cursor-pointer"
        onClick={() => {
          onClose();
          if (isAdmin) navigate('/admin');
        }}
      >
        <span>{isAdmin ? 'Open Admin Control Center →' : 'Continue →'}</span>
      </button>
    </div>
  );
};

/* ========================================================================= */
/* 7. MAIN AUTH MODAL EXPORT                                                 */
/* ========================================================================= */
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, tab, onClose, onSetTab, onLogin }) => {
  const [successData, setSuccessData] = useState<{ title: string; msg: string; isAdmin?: boolean } | null>(null);
  const navigate = useNavigate();

  const handleSuccess = useCallback(
    (user: AuthUser, token: string | undefined, title: string, msg: string) => {
      setSuccessData({ title, msg, isAdmin: user.role === 'admin' });
      onLogin(user, token);
      if (user.role === 'admin') {
        setTimeout(() => {
          onClose();
          navigate('/admin');
        }, 1200);
      }
    },
    [onLogin, onClose, navigate]
  );

  useEffect(() => {
    if (!isOpen) setSuccessData(null);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const isCustomerTab = tab === 'login' || tab === 'register';
  const isAdminTab = tab === 'admin-login' || tab === 'admin-register';

  return (
    <>
      {/* Frosted dark backdrop */}
      <div
        className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Glass Card Container (Image 2 Style with Website Theme Tokens) */}
        <div
          className={cn(
            "relative flex w-full flex-col overflow-hidden rounded-3xl border border-[#725D75]/30 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)] animate-scale-in text-[#F9F6F2] my-auto transition-all duration-300",
            isAdminTab || tab === 'register' ? "max-w-[480px]" : "max-w-[440px]"
          )}
          style={{
            background: isAdminTab
              ? 'linear-gradient(150deg, rgba(40, 20, 48, 0.92) 0%, rgba(52, 32, 60, 0.90) 50%, rgba(31, 18, 36, 0.95) 100%)'
              : 'linear-gradient(150deg, rgba(37, 23, 44, 0.88) 0%, rgba(45, 28, 52, 0.85) 50%, rgba(31, 18, 36, 0.92) 100%)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Subtle luxury ambient glows */}
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-[#725D75]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-[#483250]/35 blur-3xl pointer-events-none" />

          {/* Close button with frosted glass ring */}
          <button
            className="absolute right-4 top-4 sm:right-5 sm:top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#A78A9F] hover:text-white hover:bg-white/15 transition-all cursor-pointer z-20"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Top Segmented Tab Pill for Customer Auth (Image 1 + Image 2 hybrid) */}
          {isCustomerTab && (
            <div className="flex items-center rounded-2xl bg-black/40 border border-[#725D75]/25 p-1 mb-5 w-full relative z-10">
              <button
                type="button"
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-[13px] font-semibold rounded-xl transition-all cursor-pointer text-center',
                  tab === 'login'
                    ? 'bg-[#F9F6F2] text-[#25172C] shadow-md font-bold'
                    : 'text-[#A78A9F] hover:text-[#F9F6F2]'
                )}
                onClick={() => onSetTab('login')}
              >
                <LogIn size={14} className={tab === 'login' ? 'text-[#25172C]' : 'text-[#725D75]'} />
                <span>Customer Login</span>
              </button>
              <button
                type="button"
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-[13px] font-semibold rounded-xl transition-all cursor-pointer text-center',
                  tab === 'register'
                    ? 'bg-[#F9F6F2] text-[#25172C] shadow-md font-bold'
                    : 'text-[#A78A9F] hover:text-[#F9F6F2]'
                )}
                onClick={() => onSetTab('register')}
              >
                <UserPlus size={14} className={tab === 'register' ? 'text-[#25172C]' : 'text-[#725D75]'} />
                <span>Customer Register</span>
              </button>
            </div>
          )}

          {/* Top Segmented Tab Pill for Admin Auth */}
          {isAdminTab && (
            <div className="flex items-center rounded-2xl bg-black/40 border border-[#C9BEAB]/30 p-1 mb-5 w-full relative z-10">
              <button
                type="button"
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-[13px] font-semibold rounded-xl transition-all cursor-pointer text-center',
                  tab === 'admin-login'
                    ? 'bg-[#C9BEAB] text-[#25172C] shadow-md font-bold'
                    : 'text-[#A78A9F] hover:text-[#F9F6F2]'
                )}
                onClick={() => onSetTab('admin-login')}
              >
                <Shield size={14} className={tab === 'admin-login' ? 'text-[#25172C]' : 'text-[#A78A9F]'} />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-[13px] font-semibold rounded-xl transition-all cursor-pointer text-center',
                  tab === 'admin-register'
                    ? 'bg-[#C9BEAB] text-[#25172C] shadow-md font-bold'
                    : 'text-[#A78A9F] hover:text-[#F9F6F2]'
                )}
                onClick={() => onSetTab('admin-register')}
              >
                <KeyRound size={14} className={tab === 'admin-register' ? 'text-[#25172C]' : 'text-[#A78A9F]'} />
                <span>Register Admin</span>
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="relative z-10">
            {tab === 'login' && (
              <LoginForm
                onSuccess={(u, token) => handleSuccess(u, token, 'Welcome back', 'You are now logged into your celebration account.')}
                onRegister={() => onSetTab('register')}
                onForgot={() => { onClose(); navigate('/forgot-password'); }}
                onAdminPortal={() => onSetTab('admin-login')}
              />
            )}
            {tab === 'register' && (
              <RegisterForm
                onSuccess={(u, token) => handleSuccess(u, token, 'Account created', `Welcome, ${u.firstName}! Your customer account is ready.`)}
                onLogin={() => onSetTab('login')}
                onAdminRegister={() => onSetTab('admin-register')}
              />
            )}
            {tab === 'admin-login' && (
              <AdminLoginForm
                onSuccess={(u, token) => handleSuccess(u, token, 'Admin Authorized', 'Welcome to TheDecorParty Administrator Dashboard.')}
                onAdminRegister={() => onSetTab('admin-register')}
                onUserLogin={() => onSetTab('login')}
              />
            )}
            {tab === 'admin-register' && (
              <AdminRegisterForm
                onSuccess={(u, token) => handleSuccess(u, token, 'Admin Account Created', 'Administrator privileges have been granted.')}
                onAdminLogin={() => onSetTab('admin-login')}
                onUserLogin={() => onSetTab('login')}
              />
            )}
            {tab === 'forgot' && (
              <ForgotForm
                onBack={() => onSetTab('login')}
                onSuccess={(u, token) => handleSuccess(u, token, 'Email sent', `A password reset link has been sent to ${u.email}`)}
              />
            )}
            {tab === 'success' && successData && (
              <SuccessPanel
                title={successData.title}
                msg={successData.msg}
                isAdmin={successData.isAdmin}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
