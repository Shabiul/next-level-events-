import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
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

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account already exists with this email. Try signing in instead.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'No account found with this email. Try creating one instead.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
};
function mapFirebaseAuthError(err: unknown, fallback: string): string {
  const code = (err as { code?: string })?.code;
  return (code && FIREBASE_ERROR_MESSAGES[code]) || fallback;
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
/* 1. CUSTOMER LOGIN FORM -- Google or email/password, both via Firebase Auth */
/* ========================================================================= */
const EmailAuthForm: React.FC<{
  onSuccess: (user: AuthUser, token?: string) => void;
}> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Both Google and email/password land here: exchange the Firebase ID
  // token for our own app session (the backend verifies it and finds/creates
  // the matching user by email).
  const exchangeFirebaseToken = async (idToken: string, provider: 'google' | 'email') => {
    const res = await fetch(getApiUrl('/api/auth/google'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: idToken }),
    });
    const data = await parseJsonResponse<{ user?: { id: string; firstName: string; lastName: string; email: string; phone: string; role: AuthUser['role'] }; token?: string }>(res);
    if (!res.ok || !data?.user || !data.token) {
      throw new Error(getApiErrorMessage(data, 'Sign-in failed. Please try again.'));
    }
    trackLogin(provider, data.user.id);
    onSuccess({
      id: data.user.id,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      email: data.user.email,
      phone: data.user.phone,
      role: data.user.role,
    }, data.token);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      await exchangeFirebaseToken(idToken, 'google');
    } catch (err) {
      setError(mapFirebaseAuthError(err, 'Google authentication failed. Please try again.'));
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'signup' && !first.trim()) {
      setError('Please tell us your name');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let idToken: string;
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        const displayName = `${first.trim()} ${last.trim()}`.trim();
        if (displayName) {
          await updateProfile(cred.user, { displayName });
          idToken = await cred.user.getIdToken(true); // refresh so the token carries the name we just set
        } else {
          idToken = await cred.user.getIdToken();
        }
      } else {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        idToken = await cred.user.getIdToken();
      }
      await exchangeFirebaseToken(idToken, 'email');
      if (mode === 'signup') trackSignup('email');
    } catch (err) {
      setError(mapFirebaseAuthError(err, mode === 'signup' ? 'Could not create your account. Please try again.' : 'Login failed. Please check your credentials.'));
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-4">
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

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#381932] font-serif">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="mt-1 text-xs sm:text-[13px] text-[#381932] font-normal">
          {mode === 'signup' ? 'Set up your celebration account with your email.' : 'Sign in with your email to continue.'}
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit} noValidate>
        {mode === 'signup' && (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <InputField
              id="signupFirst"
              label="First Name"
              value={first}
              onChange={setFirst}
              icon={<User size={15} />}
              autoComplete="given-name"
              placeholder="First name"
            />
            <InputField
              id="signupLast"
              label="Last Name"
              value={last}
              onChange={setLast}
              autoComplete="family-name"
              placeholder="Last name"
            />
          </div>
        )}
        <InputField
          id="authEmail"
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          icon={<Mail size={15} />}
          autoComplete="email"
          placeholder="name@example.com"
        />
        <InputField
          id="authPassword"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          icon={<Lock size={15} />}
          error={error}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          placeholder="••••••••"
          endAdornment={
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-[#381932] cursor-pointer">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <SubmitButton loading={loading} loadingLabel={mode === 'signup' ? 'Creating account...' : 'Signing in...'}>
          {mode === 'signup' ? 'Create Account →' : 'Sign In →'}
        </SubmitButton>
      </form>

      <button
        type="button"
        onClick={() => { setMode((m) => (m === 'signin' ? 'signup' : 'signin')); setError(''); }}
        className="text-center text-xs font-medium text-[#381932] hover:text-[#381932] transition-colors cursor-pointer"
      >
        {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
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
              <EmailAuthForm
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
