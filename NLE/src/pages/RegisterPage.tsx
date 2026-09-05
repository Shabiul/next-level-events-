import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../lib/api';
import { trackSignup } from '../lib/analytics';
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (mobile.trim() && !/^[6-9]\d{9}$/.test(mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Registration failed');
      }

      auth.login(data.user, data.token);
      trackSignup('email', data.user.id || data.user._id);
      navigate('/profile');
    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
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
      if (!response.ok) throw new Error(data.message || 'Google signup failed');

      auth.login(data.user, data.token);
      trackSignup('google', data.user.id || data.user._id);
      navigate('/profile');
    } catch (err: any) {
      setErrors({ general: err.message || 'Google authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-8 md:px-6">
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
              <UserPlus size={22} />
            </div>
            <h1 className="text-2xl font-black text-[#381932] dark:text-[#FFF3E6] tracking-tight">Create an Account</h1>
            <p className="mt-1 text-xs font-semibold text-[#381932] dark:text-[#381932]">Join The Decor Party for party setups and order tracking</p>
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
            <GoogleIcon /> Sign up with Google
          </button>

          <div className="flex items-center gap-3 text-xs font-bold text-[#381932]">
            <div className="flex-1 border-t border-[#381932] dark:border-[#381932]" />
            <span>OR REGISTER FORM</span>
            <div className="flex-1 border-t border-[#381932] dark:border-[#381932]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold uppercase text-[#381932]">First Name *</label>
                <div className="relative mt-1">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-3 py-2.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#381932]"
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-[11px] font-bold text-[#381932]">{errors.firstName}</p>}
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase text-[#381932]">Last Name</label>
                <div className="relative mt-1">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-3 py-2.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#381932]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase text-[#381932]">Email Address *</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-4 py-2.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#381932]"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] font-bold text-[#381932]">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase text-[#381932]">Mobile Number (Optional)</label>
              <div className="relative mt-1">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-4 py-2.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#381932]"
                />
              </div>
              {errors.mobile && <p className="mt-1 text-[11px] font-bold text-[#381932]">{errors.mobile}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold uppercase text-[#381932]">Password *</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-10 py-2.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#381932]"
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

              <div>
                <label className="text-xs font-extrabold uppercase text-[#381932]">Confirm Password *</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#381932]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932]/90 pl-10 pr-4 py-2.5 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] outline-none focus:border-[#381932] dark:focus:border-[#381932]"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-[11px] font-bold text-[#381932]">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#381932] hover:opacity-90 text-[#FFF3E6] py-3.5 text-xs font-bold shadow-lg shadow-[#381932]/25 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-xs font-semibold text-[#381932] dark:text-[#381932] pt-2 border-t border-[#381932] dark:border-[#381932]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#381932] dark:text-[#381932] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
