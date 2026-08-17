import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading || !auth.initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] text-sm text-[#6F6F6B] dark:bg-[#121212] dark:text-[#A0A09C]">
        Verifying admin access...
      </div>
    );
  }

  if (!auth.isLoggedIn || !auth.user) {
    auth.open('login');
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!auth.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
