import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Gates a route behind authentication WITHOUT navigating away -- the URL and any
 * router state (e.g. a pending booking) are preserved, so once the user signs in
 * through the global login modal the protected content renders in place and a
 * page refresh keeps them here.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth();
  const authed = auth.isLoggedIn && !!auth.user;
  const restoring = auth.isLoading || !auth.initialized;

  useEffect(() => {
    if (!restoring && !authed && !auth.isOpen) {
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
        <button
          type="button"
          onClick={() => auth.open('login')}
          className="rounded-lg bg-[#381932] px-6 py-3 text-[11px] font-serif font-semibold uppercase tracking-wide text-[#FFF3E6] hover:bg-[#483250] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
