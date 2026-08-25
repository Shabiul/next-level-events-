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
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-[#FAF8F5] dark:bg-[#1B101F] text-[#1C1B22] dark:text-[#FAF8F5]">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#8F6FC4] dark:bg-[#2A1732] border border-[#8F6FC4]/40 flex items-center justify-center text-[#C7B8E8] shadow-xl">
          <Shield size={32} />
        </div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">TheDecorParty Admin Portal</h1>
        <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C8B5C3]">
          Please sign in with authorized administrator credentials or staff registration to manage orders, catalog, and bookings.
        </p>
        <button
          type="button"
          onClick={() => auth.open(initialTab)}
          className="mt-2 px-6 py-2.5 rounded-xl bg-[#8F6FC4] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#25172C] text-xs font-semibold shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          Open Admin Portal Modal →
        </button>
      </div>
    </div>
  );
}
