import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { useAppBack } from '../hooks/useAppBack';
import { getApiUrl } from '../lib/api';

function getStrength(val: string) {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
}

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const goBack = useAppBack('/');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (getStrength(password) < 2) { setError('Password is too weak'); return; }
    if (!token) { setError('Invalid reset link'); return; }

    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/auth/reset-password/${token}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || 'Reset failed');
      } else {
        setSuccess('Password reset successful. You can now login with your new password.');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch {
      setError('Reset failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(password);

  return (
    <>
      <div className="sticky top-0 z-20 bg-[#FFF3E6] border-b">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center h-12">
            <BackButton
              onClick={goBack}
              aria-label="Back"
              iconOnly
              className="-ml-2 p-2"
            />
            <div className="flex-1 text-center text-lg font-semibold">Set a new password</div>
            <div className="w-11" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md p-6">
        <h2 className="sr-only">Set a new password</h2>
        <p className="mb-4 text-sm text-ink-muted">Choose a secure password for your account.</p>
        {success ? (
          <div className="rounded-lg bg-[#FFF3E6] p-3 text-sm text-[#381932]">{success}</div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <label className="text-sm font-medium">New password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
            <div className="text-xs text-ink-muted">Strength: {['Very weak','Weak','Okay','Good','Strong'][strength] || 'Very weak'}</div>
            <label className="text-sm font-medium">Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
            {error && <div className="text-sm text-[#381932]">{error}</div>}
            <button type="submit" disabled={loading} className="rounded-lg bg-[#381932] py-2 text-[#FFF3E6]">{loading ? 'Saving...' : 'Set new password'}</button>
          </form>
        )}
      </div>
    </>
  );
}
