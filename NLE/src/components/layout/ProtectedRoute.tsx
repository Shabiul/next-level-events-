import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Gates a route behind authentication WITHOUT losing user context.
 * If the user closes the login popup while attempting to book,
 * they are redirected to the services page.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authed = auth.isLoggedIn && !!auth.user;
  const restoring = auth.isLoading || !auth.initialized;
  const hasPrompted = useRef(false);

  useEffect(() => {
    if (!restoring && !authed && !auth.isOpen && !hasPrompted.current) {
      hasPrompted.current = true;
      auth.open('login');
    }
  }, [restoring, authed, auth]);

  if (restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF3E6] text-sm text-[#381932]">
        Restoring your session...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FFF3E6] px-6 text-center">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#381932]">
          Please sign in to continue
        </h1>
        <p className="max-w-sm text-sm text-[#381932]/70">
          Log in with your account to view this page. You&apos;ll return right here once you&apos;re signed in.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => auth.open('login')}
            className="rounded-lg bg-[#381932] px-6 py-3 text-[11px] font-serif font-semibold uppercase tracking-wide text-[#FFF3E6] hover:bg-[#483250] transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="rounded-lg border border-[#381932]/30 bg-transparent px-6 py-3 text-[11px] font-serif font-semibold uppercase tracking-wide text-[#381932] hover:bg-[#381932]/10 transition-colors cursor-pointer"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
