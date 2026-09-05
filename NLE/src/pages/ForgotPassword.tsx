import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useAppBack } from '../hooks/useAppBack';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.msg || 'If an account exists, a password reset link has been sent to your email.');
    } catch {
      setError('Failed to send reset link. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = useAppBack('/');

  return (
    <>
      {/* Mobile top subheader */}
      <div className="sticky top-16 z-20 border-b border-[#381932] dark:border-[#381932] bg-[#FFF3E6]/90 dark:bg-[#381932]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between px-4 md:px-6">
          <BackButton onClick={goBack} aria-label="Back to home" />
          <h1 className="text-sm font-semibold text-[#381932] dark:text-[#FFF3E6] md:text-base">Reset password</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-[#381932] dark:text-[#FFF3E6] sm:text-2xl">Reset password</h2>
            <p className="mt-1.5 text-xs text-[#381932] dark:text-[#381932] sm:text-sm">
              Enter your registered email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {message ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl border border-[#381932] dark:border-[#381932]/60 bg-[#FFF3E6]/60 dark:bg-[#381932]/40 p-4 text-sm font-medium text-[#381932] dark:text-[#381932]">
                {message}
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#381932] dark:text-[#381932] hover:underline"
                onClick={() => navigate('/')}
              >
                <ArrowLeft size={14} /> Return to Home
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgotEmailInput" className="text-xs font-medium text-[#381932] dark:text-[#381932]">
                  Email Address
                </label>
                <div
                  className={`flex h-11 items-center gap-2.5 rounded-xl border bg-[#FFF3E6] dark:bg-[#381932] px-3.5 transition-all duration-200 ${
                    error
                      ? 'border-[#381932] dark:border-[#381932]/50 ring-2 ring-[#381932] dark:ring-[#381932]/30'
                      : 'border-[#381932] dark:border-[#381932] focus-within:border-[#381932]/60 dark:focus-within:border-[#381932] focus-within:ring-2 focus-within:ring-[#381932]/10 hover:border-[#381932] dark:hover:border-[#381932]'
                  }`}
                >
                  <Mail size={16} className="text-[#381932] dark:text-[#381932]" />
                  <input
                    id="forgotEmailInput"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm text-[#381932] dark:text-[#381932] outline-none placeholder:text-[#381932] dark:placeholder:text-[#381932]"
                  />
                </div>
                {error && <span className="text-xs font-medium text-[#381932]">{error}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-[47px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#381932] via-[#381932] to-[#381932] px-5 text-sm sm:text-base font-bold text-[#FFF3E6] shadow-md shadow-[#381932]/20 transition-all duration-200 hover:shadow-lg hover:shadow-[#381932]/30 hover:scale-[1.005] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#381932]/30 border-t-white" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <>
                    <span>Send reset link</span>
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </>
                )}
              </button>

              <div className="mt-1 text-center">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#381932] hover:underline"
                  onClick={() => auth.open('login')}
                >
                  ← Back to log in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
