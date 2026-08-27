import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../../services/firebase";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, Shield, KeyRound } from 'lucide-react';
import type { AuthTab, AuthUser } from '../../types';
import { cn } from '../../utils/utils';
import { getApiUrl } from '../../services/api.service';
import { trackLogin, trackSignup } from '../../utils/analytics';

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

function validateEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePhone(v: string) { return /^[6-9]\d{9}$/.test(v); }

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
        <label htmlFor={id} className="text-xs font-medium text-[#746B72] tracking-wide">
          {label}
        </label>
        {labelRight}
      </div>
      <div
        className={cn(
          'flex h-11 sm:h-12 items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-colors duration-200',
          error
            ? 'border-rose-400 ring-1 ring-rose-400/30'
            : 'border-[#E4DCD2] focus-within:border-[#A78A9F] focus-within:ring-1 focus-within:ring-[#A78A9F]/30 hover:border-[#A78A9F]/60'
        )}
      >
        {icon && <span className="flex-shrink-0 text-[#725D75]">{icon}</span>}
        {prefix && <span className="flex-shrink-0 text-xs font-medium text-[#746B72]">{prefix}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          className="w-full bg-transparent text-sm text-[#2F2930] outline-none placeholder:text-[#746B72]/50"
        />
        {endAdornment}
      </div>
      {error && <span className="text-[11.5px] font-medium text-rose-500 animate-fade-in">{error}</span>}
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
          className="flex-shrink-0 text-[#725D75] hover:text-[#A78A9F] transition-colors cursor-pointer"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
};

const SubmitButton: React.FC<{ loading: boolean; loadingLabel: string; children: React.ReactNode }> = ({ loading, loadingLabel, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#725D75] hover:bg-[#A78A9F] text-white text-sm font-medium shadow-sm transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
  >
    {loading ? (
      <>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
/* ========================================================================= */
/* 1. CUSTOMER PHONE + OTP LOGIN (the only customer auth method)             */
/* ========================================================================= */
const RESEND_SECONDS = 30;

function friendlyOtpError(code: string): string {
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'That mobile number looks invalid. Please recheck the 10 digits.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a bit before trying again.';
    case 'auth/invalid-verification-code':
      return 'Incorrect OTP. Please check the 6 digits and try again.';
    case 'auth/code-expired':
      return 'This OTP has expired. Request a new one.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for this project right now. Please try again shortly.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const PhoneAuthForm: React.FC<{
  onSuccess: (user: AuthUser, token?: string) => void;
  onAdminPortal: () => void;
}> = ({ onSuccess, onAdminPortal }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const confirmationRef = useRef<import('firebase/auth').ConfirmationResult | null>(null);
  const verifierRef = useRef<InstanceType<typeof RecaptchaVerifier> | null>(null);
  const pendingTokenRef = useRef<string | undefined>(undefined);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const getVerifier = () => {
    if (!verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
    return verifierRef.current;
  };

  const sendOtp = async () => {
    if (!validatePhone(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, getVerifier());
      confirmationRef.current = confirmation;
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      setResendIn(RESEND_SECONDS);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: string }).code) : '';
      setError(friendlyOtpError(code));
      // A failed send can leave the invisible widget in a bad state -- reset it
      // so the next attempt gets a fresh challenge instead of silently failing.
      verifierRef.current?.clear();
      verifierRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < 6; i++) next[i] = pasted[i] || next[i] || '';
      return next;
    });
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Enter the full 6-digit OTP');
      return;
    }
    if (!confirmationRef.current) {
      setError('Your OTP session expired. Please request a new code.');
      setStep('phone');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(code);
      const firebaseUser = result.user;

      const res = await fetch(getApiUrl('/api/auth/phone'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: firebaseUser.uid, phone: `+91${phone}` }),
      });
      const data = await parseJsonResponse<{ token?: string; isNewUser?: boolean; user?: { id: string; firstName: string; lastName: string; email: string; role: AuthUser['role']; phone: string }; msg?: string }>(res);
      if (!res.ok || !data?.token || !data.user) {
        setError(getApiErrorMessage(data, 'Could not complete sign-in. Please try again.'));
        setLoading(false);
        return;
      }

      trackLogin('phone', data.user.id);

      if (data.isNewUser) {
        pendingTokenRef.current = data.token;
        setLoading(false);
        setStep('name');
        return;
      }

      onSuccess({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      }, data.token);
    } catch (err) {
      const code2 = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: string }).code) : '';
      setError(friendlyOtpError(code2));
      setLoading(false);
    }
  };

  const finishProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!first.trim()) {
      setError('Please tell us your name');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = pendingTokenRef.current;
      const res = await fetch(getApiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: first.trim(), lastName: last.trim() }),
      });
      const data = await parseJsonResponse<{ user?: { id: string; firstName: string; lastName: string; email: string; phone: string; role: AuthUser['role'] } }>(res);
      trackSignup('phone');
      onSuccess({
        id: data?.user?.id || '',
        firstName: data?.user?.firstName || first.trim(),
        lastName: data?.user?.lastName || last.trim(),
        email: data?.user?.email || '',
        phone: data?.user?.phone || `+91${phone}`,
        role: data?.user?.role || 'user',
      }, token);
    } catch {
      setError('Could not save your name, but you are signed in. You can add it later from your profile.');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div id="recaptcha-container" />

      {step === 'phone' && (
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); sendOtp(); }} noValidate>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#725D75] font-serif">
              Welcome to The Decor Party
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#746B72] font-normal">
              Enter your mobile number to log in or create an account.
            </p>
          </div>

          <InputField
            id="phoneNumber"
            label="Mobile Number"
            type="tel"
            value={phone}
            onChange={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
            icon={<Phone size={15} />}
            prefix="+91"
            error={error}
            autoComplete="tel"
            maxLength={10}
            placeholder="Enter your 10-digit mobile number"
          />

          <SubmitButton loading={loading} loadingLabel="Sending OTP...">
            Send OTP →
          </SubmitButton>

          <div className="pt-2 border-t border-[#E4DCD2] text-center">
            <button
              type="button"
              onClick={onAdminPortal}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#A78A9F] hover:text-[#725D75] transition-colors cursor-pointer"
            >
              <Shield size={13} className="text-[#A78A9F]" />
              <span>Authorized Staff? Switch to Admin Portal</span>
            </button>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <form className="flex flex-col gap-4" onSubmit={verifyOtp} noValidate>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#725D75] font-serif">
              Verify Your Number
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#746B72] font-normal">
              Enter the 6-digit OTP sent to +91 {phone}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { otpRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                onPaste={handleOtpPaste}
                className="h-12 w-11 sm:h-14 sm:w-12 rounded-lg border border-[#E4DCD2] bg-white text-center text-lg font-semibold text-[#2F2930] outline-none focus:border-[#A78A9F] focus:ring-1 focus:ring-[#A78A9F]/30 transition-colors duration-200"
              />
            ))}
          </div>
          {error && <span className="text-[11.5px] font-medium text-rose-500 animate-fade-in">{error}</span>}

          <SubmitButton loading={loading} loadingLabel="Verifying...">
            Verify &amp; Continue →
          </SubmitButton>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="font-medium text-[#746B72] hover:text-[#2F2930] transition-colors cursor-pointer"
            >
              ← Change number
            </button>
            <button
              type="button"
              disabled={resendIn > 0}
              onClick={sendOtp}
              className="font-semibold text-[#725D75] hover:text-[#A78A9F] disabled:text-[#A78A9F]/50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}

      {step === 'name' && (
        <form className="flex flex-col gap-4" onSubmit={finishProfile} noValidate>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#725D75] font-serif">
              What should we call you?
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#746B72] font-normal">
              One last step to set up your celebration account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <InputField
              id="nameFirst"
              label="First Name"
              value={first}
              onChange={setFirst}
              icon={<User size={15} />}
              error={error}
              autoComplete="given-name"
              placeholder="First name"
            />
            <InputField
              id="nameLast"
              label="Last Name"
              value={last}
              onChange={setLast}
              autoComplete="family-name"
              placeholder="Last name"
            />
          </div>

          <SubmitButton loading={loading} loadingLabel="Saving...">
            Continue →
          </SubmitButton>
        </form>
      )}
    </div>
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
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#725D75] font-serif">
          Administrator Sign In
        </h2>
        <p className="mt-1 text-xs sm:text-[13px] text-[#746B72] font-normal">
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
            className="text-[#A78A9F] hover:text-[#725D75] transition-colors cursor-pointer"
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
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#725D75] font-serif">
          Register Admin Account
        </h2>
        <p className="mt-0.5 text-xs sm:text-[13px] text-[#746B72] font-normal">
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
            className="text-[#A78A9F] hover:text-[#725D75] transition-colors cursor-pointer"
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
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#725D75] font-serif">
          Reset password
        </h2>
        <p className="mt-1 text-xs sm:text-[13px] text-[#746B72] font-normal">
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
      <h2 className="text-xl font-semibold text-[#725D75] font-serif">{title}</h2>
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

  const isAdminTab = tab === 'admin-login' || tab === 'admin-register';

  return (
    <>
      {/* Dark scrim behind the modal */}
      <div
        className="fixed inset-0 z-[10000] bg-[#2F2930]/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Card Container */}
        <div
          className={cn(
            "relative flex w-full flex-col overflow-hidden rounded-2xl border border-[#E4DCD2] bg-white p-6 sm:p-8 shadow-md animate-scale-in text-[#2F2930] my-auto transition-all duration-300",
            isAdminTab || tab === 'register' ? "max-w-[480px]" : "max-w-[440px]"
          )}
        >
          {/* Subtle ambient accents */}
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-[#F3EFE7] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-[#A78A9F]/10 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            className="absolute right-4 top-4 sm:right-5 sm:top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F9F6F2] border border-[#E4DCD2] text-[#746B72] hover:text-[#2F2930] hover:bg-white transition-colors cursor-pointer z-20"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Top Segmented Tab Pill for Admin Auth */}
          {isAdminTab && (
            <div className="flex items-center rounded-xl bg-[#F3EFE7] border border-[#E4DCD2] p-1 mb-5 w-full relative z-10">
              <button
                type="button"
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg transition-colors duration-200 cursor-pointer text-center',
                  tab === 'admin-login'
                    ? 'bg-white text-[#725D75] shadow-xs font-semibold'
                    : 'text-[#746B72] hover:text-[#2F2930]'
                )}
                onClick={() => onSetTab('admin-login')}
              >
                <Shield size={14} className={tab === 'admin-login' ? 'text-[#725D75]' : 'text-[#A78A9F]'} />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg transition-colors duration-200 cursor-pointer text-center',
                  tab === 'admin-register'
                    ? 'bg-white text-[#725D75] shadow-xs font-semibold'
                    : 'text-[#746B72] hover:text-[#2F2930]'
                )}
                onClick={() => onSetTab('admin-register')}
              >
                <KeyRound size={14} className={tab === 'admin-register' ? 'text-[#725D75]' : 'text-[#A78A9F]'} />
                <span>Register Admin</span>
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="relative z-10">
            {(tab === 'login' || tab === 'register' || tab === 'phone') && (
              <PhoneAuthForm
                onSuccess={(u, token) => handleSuccess(u, token, 'Welcome!', 'You are now logged into your celebration account.')}
                onAdminPortal={() => onSetTab('admin-login')}
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
