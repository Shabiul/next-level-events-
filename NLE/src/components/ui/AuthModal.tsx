import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth as firebaseAuth } from '../../firebase';
import type { AuthTab, AuthUser } from '../../types';
import { cn } from '../../utils/utils';
import { getApiUrl } from '../../services/api.service';
import { trackLogin, trackSignup } from '../../utils/analytics';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
    <path fill="#381932" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#381932" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FFF3E6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#381932" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z"/>
  </svg>
);

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
        <label htmlFor={id} className="text-xs font-medium text-[#381932] tracking-wide">
          {label}
        </label>
        {labelRight}
      </div>
      <div
        className={cn(
          'flex h-11 sm:h-12 items-center gap-2.5 rounded-lg border bg-[#FFF3E6] px-3.5 transition-colors duration-200',
          error
            ? 'border-[#381932] ring-1 ring-[#381932]/30'
            : 'border-[#381932]/30 focus-within:border-[#381932] focus-within:ring-1 focus-within:ring-[#381932]/30 hover:border-[#381932]/60'
        )}
      >
        {icon && <span className="flex-shrink-0 text-[#381932]">{icon}</span>}
        {prefix && <span className="flex-shrink-0 text-xs font-medium text-[#381932]">{prefix}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          className="w-full bg-transparent text-sm text-[#381932] outline-none placeholder:text-[#381932]/50"
        />
        {endAdornment}
      </div>
      {error && <span className="text-[11.5px] font-medium text-[#381932] animate-fade-in">{error}</span>}
    </div>
  );
};

const SubmitButton: React.FC<{ loading: boolean; loadingLabel: string; children: React.ReactNode }> = ({ loading, loadingLabel, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#381932] hover:opacity-90 text-[#FFF3E6] text-sm font-medium shadow-sm transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
  >
    {loading ? (
      <>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#381932]/30 border-t-white" />
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

const PhoneAuthForm: React.FC<{
  onSuccess: (user: AuthUser, token?: string) => void;
}> = ({ onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  const pendingTokenRef = useRef<string | undefined>(undefined);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const sendOtp = async () => {
    if (!validatePhone(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/otp/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const data = await parseJsonResponse<{ success?: boolean; message?: string; resendIn?: number; devCode?: string }>(res);
      if (!res.ok || !data?.success) {
        setError(getApiErrorMessage(data, 'Could not send the OTP. Please try again.'));
        setLoading(false);
        return;
      }
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      setResendIn(data.resendIn ?? RESEND_SECONDS);
      setDevCode(data.devCode ?? null);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch {
      setError('Network error. Please check your connection and try again.');
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
    setError('');
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/otp/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, code }),
      });
      const data = await parseJsonResponse<{ success?: boolean; token?: string; isNewUser?: boolean; user?: { id: string; firstName: string; lastName: string; email: string; role: AuthUser['role']; phone: string }; message?: string }>(res);
      if (!res.ok || !data?.success || !data.token || !data.user) {
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
    } catch {
      setError('Network error while verifying. Please try again.');
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!emailPassword) {
      setError('Password is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: emailPassword }),
      });
      const data = await parseJsonResponse<{ user?: { id: string; firstName: string; lastName: string; email: string; phone: string; role: AuthUser['role'] }; token?: string; msg?: string }>(res);
      if (!res.ok || !data?.user || !data.token) {
        setError(getApiErrorMessage(data, 'Login failed. Please check your credentials.'));
        setLoading(false);
        return;
      }
      trackLogin('email', data.user.id);
      onSuccess({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      }, data.token);
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await parseJsonResponse<{ user?: { id: string; firstName: string; lastName: string; email: string; phone: string; role: AuthUser['role'] }; token?: string }>(res);
      if (!res.ok || !data?.user || !data.token) {
        setError(getApiErrorMessage(data, 'Google sign-in failed.'));
        setLoading(false);
        return;
      }
      trackLogin('google', data.user.id);
      onSuccess({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      }, data.token);
    } catch {
      setError('Google authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {step === 'phone' && (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#381932] bg-[#FFF3E6] px-4 py-3 text-xs font-bold text-[#381932] hover:bg-[#FFF3E6]/70 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[11px] font-bold text-[#381932]">
            <div className="flex-1 border-t border-[#381932]/30" />
            <span>OR</span>
            <div className="flex-1 border-t border-[#381932]/30" />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-[#381932]/30 p-1 text-[11.5px] font-bold">
            <button
              type="button"
              onClick={() => { setMethod('phone'); setError(''); }}
              className={cn('flex-1 rounded-lg py-1.5 transition-colors cursor-pointer', method === 'phone' ? 'bg-[#381932] text-[#FFF3E6]' : 'text-[#381932]')}
            >
              Phone
            </button>
            <button
              type="button"
              onClick={() => { setMethod('email'); setError(''); }}
              className={cn('flex-1 rounded-lg py-1.5 transition-colors cursor-pointer', method === 'email' ? 'bg-[#381932] text-[#FFF3E6]' : 'text-[#381932]')}
            >
              Email
            </button>
          </div>
        </div>
      )}

      {step === 'phone' && method === 'email' && (
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleEmailLogin} noValidate>
          <InputField
            id="loginEmail"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            icon={<Mail size={15} />}
            autoComplete="email"
            placeholder="name@example.com"
          />
          <InputField
            id="loginPassword"
            label="Password"
            type={showEmailPassword ? 'text' : 'password'}
            value={emailPassword}
            onChange={setEmailPassword}
            icon={<Lock size={15} />}
            error={error}
            autoComplete="current-password"
            placeholder="••••••••"
            endAdornment={
              <button type="button" onClick={() => setShowEmailPassword((s) => !s)} className="text-[#381932] cursor-pointer">
                {showEmailPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <SubmitButton loading={loading} loadingLabel="Signing in...">
            Sign In →
          </SubmitButton>
        </form>
      )}

      {step === 'phone' && method === 'phone' && (
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); sendOtp(); }} noValidate>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#381932] font-serif">
              Welcome to The Decor Party
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#381932] font-normal">
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
        </form>
      )}

      {step === 'otp' && (
        <form className="flex flex-col gap-4" onSubmit={verifyOtp} noValidate>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#381932] font-serif">
              Verify Your Number
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#381932] font-normal">
              Enter the 6-digit OTP sent to +91 {phone}
            </p>
            {devCode && (
              <p className="mt-1.5 rounded-md bg-[#A78A9F]/15 px-2 py-1 text-[11px] font-semibold text-[#381932]">
                Dev mode (no SMS provider): your code is <span className="tracking-widest">{devCode}</span>
              </p>
            )}
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
                className="h-12 w-11 sm:h-14 sm:w-12 rounded-lg border border-[#381932]/30 bg-[#FFF3E6] text-center text-lg font-semibold text-[#381932] outline-none focus:border-[#381932] focus:ring-1 focus:ring-[#381932]/30 transition-colors duration-200"
              />
            ))}
          </div>
          {error && <span className="text-[11.5px] font-medium text-[#381932] animate-fade-in">{error}</span>}

          <SubmitButton loading={loading} loadingLabel="Verifying...">
            Verify &amp; Continue →
          </SubmitButton>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="font-medium text-[#381932] hover:text-[#381932] transition-colors cursor-pointer"
            >
              ← Change number
            </button>
            <button
              type="button"
              disabled={resendIn > 0}
              onClick={sendOtp}
              className="font-semibold text-[#381932] hover:text-[#381932] disabled:text-[#381932]/50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}

      {step === 'name' && (
        <form className="flex flex-col gap-4" onSubmit={finishProfile} noValidate>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#381932] font-serif">
              What should we call you?
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#381932] font-normal">
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
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#381932] font-serif">
          Reset password
        </h2>
        <p className="mt-1 text-xs sm:text-[13px] text-[#381932] font-normal">
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
          className="text-center text-xs font-medium text-[#381932] hover:text-[#381932] transition-colors cursor-pointer py-1"
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
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#381932] border border-[#381932]/40 text-[#381932] shadow-lg">
        {isAdmin ? <Shield size={26} className="text-[#381932]" /> : <Sparkles size={26} className="text-[#A78A9F]" />}
      </div>
      <h2 className="text-xl font-semibold text-[#381932] font-serif">{title}</h2>
      <p className="text-xs sm:text-sm text-[#381932] max-w-xs leading-relaxed">{msg}</p>
      <button
        className="mt-3 flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-[#FFF3E6] hover:bg-[#FFF3E6] text-sm font-semibold text-[#381932] shadow-lg transition-all cursor-pointer"
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

  return (
    <>
      {/* Dark scrim behind the modal */}
      <div
        className="fixed inset-0 z-[10000] bg-[#381932]/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        {/* Card Container */}
        <div
          className={cn(
            "relative flex w-full flex-col overflow-hidden rounded-2xl border border-[#381932]/30 bg-[#FFF3E6] p-6 sm:p-8 shadow-md animate-scale-in text-[#381932] my-auto transition-all duration-300",
            tab === 'register' ? "max-w-[480px]" : "max-w-[440px]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle ambient accents */}
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-[#FFF3E6] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-[#A78A9F]/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            className="absolute right-4 top-4 sm:right-5 sm:top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3E6] border border-[#381932]/30 text-[#381932] hover:text-[#381932] hover:bg-[#FFF3E6] transition-colors cursor-pointer z-20"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Content Area */}
          <div className="relative z-10">
            {(tab === 'login' || tab === 'register' || tab === 'phone') && (
              <PhoneAuthForm
                onSuccess={(u, token) => handleSuccess(u, token, 'Welcome!', 'You are now logged into your celebration account.')}
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
