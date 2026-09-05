import { useState, useEffect } from 'react';
import { Users, Gift, FolderTree, Images, Database, RefreshCw, type LucideIcon } from 'lucide-react';
import { LoadingState } from '../EmptyState';
import { getApiUrl, authFetch, parseJsonSafe } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalSliders: number;
  source?: 'api' | 'supabase';
}

const StatCard = ({ icon: Icon, label, value, sub, colorClass }: { icon: LucideIcon; label: string; value: string | number; sub?: string; colorClass: string }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs transition-all hover:border-[#381932] dark:hover:border-[#381932]">
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[#FFF3E6] shadow-md ${colorClass}`}>
      <Icon size={22} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-2xl font-black text-[#381932] dark:text-[#FFF3E6] tracking-tight">{value}</div>
      <div className="text-xs font-bold text-[#381932] dark:text-[#381932]">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] font-semibold text-[#381932] dark:text-[#381932] truncate">{sub}</div>}
    </div>
  </div>
);

export const DashboardView = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    setError('');
    try {
      // First attempt to fetch from backend API
      const res = await authFetch(getApiUrl('/api/dashboard/stats'));
      const parsed = await parseJsonSafe<DashboardData>(res);

      if (parsed.ok && parsed.data && typeof parsed.data.totalUsers === 'number') {
        setData({ ...parsed.data, source: 'api' });
        setLoading(false);
        return;
      }
    } catch {
      // Backend request failed or unreachable; continue to Supabase direct fallback
    }

    // Direct Supabase database fallback: ensures live metrics even if the Express server is cold or returning HTML
    try {
      const [usersRes, productsRes, activeProductsRes, categoriesRes, slidersRes] = await Promise.allSettled([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('sliders').select('*', { count: 'exact', head: true }),
      ]);

      const totalUsers = usersRes.status === 'fulfilled' && usersRes.value.count !== null ? usersRes.value.count : 0;
      const totalProducts = productsRes.status === 'fulfilled' && productsRes.value.count !== null ? productsRes.value.count : 0;
      const activeProducts = activeProductsRes.status === 'fulfilled' && activeProductsRes.value.count !== null ? activeProductsRes.value.count : 0;
      const totalCategories = categoriesRes.status === 'fulfilled' && categoriesRes.value.count !== null ? categoriesRes.value.count : 0;
      const totalSliders = slidersRes.status === 'fulfilled' && slidersRes.value.count !== null ? slidersRes.value.count : 0;

      setData({
        totalUsers,
        totalProducts,
        activeProducts,
        totalCategories,
        totalSliders,
        source: 'supabase',
      });
      setError('');
    } catch (supaErr: any) {
      setError(supaErr?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    void fetchStats();
  };

  if (loading) return <div className="py-12"><LoadingState label="Loading dashboard..." /></div>;

  if (error && !data) return (
    <div className="rounded-2xl border border-[#381932] dark:border-[#381932]/50 bg-[#FFF3E6] dark:bg-[#381932]/30 p-5 text-xs font-bold text-[#381932] dark:text-[#381932] flex items-center justify-between">
      <span>⚠️ {error}</span>
      <button
        onClick={handleManualRefresh}
        className="px-3 py-1.5 rounded-xl bg-[#381932] text-[#FFF3E6] text-xs font-bold cursor-pointer"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6]">Dashboard Overview</h2>
            {data?.source && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold bg-[#FFF3E6] dark:bg-[#381932] text-[#381932] dark:text-[#FFF3E6] border border-[#381932]/20">
                <Database size={10} />
                {data.source === 'api' ? 'API Connected' : 'Supabase Live'}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">Live real-time statistics of your event booking platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-1.5 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#381932]/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="w-fit rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-1.5 text-xs font-bold text-[#381932] dark:text-[#381932]">
            Updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={data.totalUsers} sub="Registered customers" colorClass="bg-gradient-to-br from-[#381932] to-[#381932]" />
          <StatCard icon={Gift} label="Total Products" value={data.totalProducts} sub={`${data.activeProducts} active packages`} colorClass="bg-gradient-to-br from-[#381932] to-[#381932]" />
          <StatCard icon={FolderTree} label="Categories" value={data.totalCategories} sub="Active categories" colorClass="bg-gradient-to-br from-[#381932] to-[#381932]" />
          <StatCard icon={Images} label="Hero Sliders" value={data.totalSliders} sub="Live on homepage" colorClass="bg-gradient-to-br from-[#381932] to-[#381932]" />
        </div>
      )}
    </div>
  );
};
