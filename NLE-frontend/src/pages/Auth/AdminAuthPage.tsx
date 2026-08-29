import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield } from 'lucide-react';

interface AdminAuthPageProps {
  initialTab?: 'admin-login' | 'admin-register';
}

export default function AdminAuthPage({ initialTab = 'admin-login' }: AdminAuthPageProps) {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }
    auth.open(initialTab);
  }, [auth.isAdmin, auth.open, initialTab, navigate]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-[#FFF3E6] dark:bg-[#381932] text-[#381932] dark:text-[#FFF3E6]">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#381932] dark:bg-[#381932] border border-[#381932]/40 flex items-center justify-center text-[#381932] shadow-xl">
          <Shield size={32} />
        </div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">The Decor Party Admin Portal</h1>
        <p className="text-xs sm:text-sm text-[#381932] dark:text-[#FFF3E6]">
          Please sign in with authorized administrator credentials or staff registration to manage orders, catalog, and bookings.
        </p>
        <button
          type="button"
          onClick={() => auth.open(initialTab)}
          className="mt-2 px-6 py-2.5 rounded-xl bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932] text-xs font-semibold shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          Open Admin Portal Modal →
        </button>
      </div>
    </div>
  );
}
