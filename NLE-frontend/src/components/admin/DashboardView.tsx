import { useState, useEffect } from 'react';
import { Users, Gift, FolderTree, Images, type LucideIcon } from 'lucide-react';
import { LoadingState } from '../EmptyState';
import { getApiUrl } from '../../lib/api';

const API = getApiUrl('/api/dashboard/stats');

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalSliders: number;
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

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load dashboard data'); setLoading(false); });
  }, []);

  if (loading) return <div className="py-12"><LoadingState label="Loading dashboard..." /></div>;

  if (error || !data) return (
    <div className="rounded-2xl border border-[#381932] dark:border-[#381932]/50 bg-[#FFF3E6] dark:bg-[#381932]/30 p-4 text-xs font-bold text-[#381932] dark:text-[#381932]">
      ⚠️ {error || 'No dashboard data available'}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#381932] dark:text-[#FFF3E6]">Dashboard Overview</h2>
          <p className="text-xs font-semibold text-[#381932] dark:text-[#381932] mt-0.5">Live real-time statistics of your event booking platform</p>
        </div>
        <div className="w-fit rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-1.5 text-xs font-bold text-[#381932] dark:text-[#381932]">
          Updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={data.totalUsers} sub="Registered customers" colorClass="bg-gradient-to-br from-[#381932] to-[#381932]" />
        <StatCard icon={Gift} label="Total Products" value={data.totalProducts} sub={`${data.activeProducts} active packages`} colorClass="bg-gradient-to-br from-[#381932] to-[#381932]" />
        <StatCard icon={FolderTree} label="Categories" value={data.totalCategories} sub="Active categories" colorClass="bg-gradient-to-br from-[#381932] to-[#381932]" />
        <StatCard icon={Images} label="Hero Sliders" value={data.totalSliders} sub="Live on homepage" colorClass="bg-gradient-to-br from-[#381932] to-[#381932]" />
      </div>
    </div>
  );
};
