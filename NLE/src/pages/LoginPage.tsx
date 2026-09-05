import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../lib/api';
import { trackLogin } from '../lib/analytics';
import { auth as firebaseAuth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
    <path fill="#381932" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#381932" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FFF3E6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#381932" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Login failed. Please check your credentials.');
      }

      (auth as any).login(data.user, data.token);
      trackLogin('email', data.user.id || data.user._id);
      navigate(data.user.role === 'admin' ? '/admin' : '/profile');
    } catch (err: any) {
      setErrors({ general: err.message || 'Unable to sign in. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({});
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google sign in failed');

      (auth as any).login(data.user, data.token);
      trackLogin('google', data.user.id || data.user._id);
      navigate(data.user.role === 'admin' ? '/admin' : '/profile');
    } catch (err: any) {
      setErrors({ general: err.message || 'Google authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-8 md:px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#381932] dark:text-[#381932] hover:underline cursor-pointer"
        >
          <ArrowLeft size={16} /> Return to Home
        </button>

        <div className="rounded-3xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-6 shadow-xl sm:p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3E6] dark:bg-[#381932]/80 text-[#381932] dark:text-[#381932] font-extrabold mb-3">
              <LogIn size={22} />
            </div>
            <h1 className="text-2xl font-black text-[#381932] dark:text-[#FFF3E6] tracking-tight">Welcome Back</h1>
            <p className="mt-1 text-xs font-semibold text-[#381932] dark:text-[#381932]">Sign in to manage your party decor bookings</p>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 rounded-xl bg-[#FFF3E6] dark:bg-[#381932]/40 p-3.5 text-xs font-bold text-[#381932] dark:text-[#381932] border border-[#381932] dark:border-[#381932]/50">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/80 px-4 py-3 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] transition-colors shadow-2xs cursor-pointer"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs font-bold text-[#381932]">
            <div className="flex-1 border-t border-[#381932] dark:border-[#381932]" />
            <span>OR EMAIL</span>
            <div className="flex-1 border-t border-[#381932] dark:border-[#381932]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold uppercase text-[#381932]">Email Address</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-4 py-3 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#381932]"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] font-bold text-[#381932]">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase text-[#381932]">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#381932] dark:text-[#381932] hover:underline">Forgot?</Link>
              </div>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-10 py-3 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#381932]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#381932] hover:text-[#381932] dark:hover:text-[#381932] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] font-bold text-[#381932]">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#381932] hover:opacity-90 text-[#FFF3E6] py-3.5 text-xs font-bold shadow-lg shadow-[#381932]/25 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In to Account'}
            </button>
          </form>

          <div className="text-center text-xs font-semibold text-[#381932] dark:text-[#381932] pt-2 border-t border-[#381932] dark:border-[#381932]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#381932] dark:text-[#381932] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
