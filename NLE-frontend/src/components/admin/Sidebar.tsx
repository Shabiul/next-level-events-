import React from 'react';
import { LayoutDashboard, FolderTree, Gift, Images, Package, Inbox, Users, FileText, PartyPopper, Sparkles, LogOut, ChevronRight } from 'lucide-react';
import type { AdminView, AuthUser } from '../../types';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS: { view: AdminView; icon: React.ElementType; label: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { view: 'categories', icon: FolderTree, label: 'Categories' },
  { view: 'products', icon: Gift, label: 'Products' },
  { view: 'addons', icon: Sparkles, label: 'Add-ons' },
  { view: 'activities', icon: PartyPopper, label: 'Activities' },
  { view: 'sliders', icon: Images, label: 'Hero Sliders' },
  { view: 'orders', icon: Package, label: 'Orders' },
  { view: 'enquiries', icon: Inbox, label: 'Enquiries' },
  { view: 'users', icon: Users, label: 'Users' },
  { view: 'terms', icon: FileText, label: 'Pages & Legal' },
];

interface SidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  user: AuthUser;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user, onCloseMobile }) => {
  const navigate = useNavigate();

  const handleSelect = (view: AdminView) => {
    onViewChange(view);
    onCloseMobile?.();
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] select-none">
      {/* Brand Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#381932] dark:border-[#381932] px-5 py-4">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] font-extrabold shadow-2xs group-hover:scale-105 transition-transform">
            <PartyPopper size={18} />
          </div>
          <div>
            <div className="text-sm font-black text-[#381932] dark:text-[#FFF3E6] leading-tight">Admin Portal</div>
            <div className="text-[10px] font-bold text-[#381932] dark:text-[#381932] uppercase tracking-wider">The Decor Party</div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = currentView === item.view;
          return (
            <button
              key={item.view}
              type="button"
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-[0.98]',
                active 
                  ? 'bg-[#381932] text-[#FFF3E6] shadow-md shadow-[#381932]/20' 
                  : 'text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] hover:text-[#381932] dark:hover:text-[#FFF3E6]'
              )}
              onClick={() => handleSelect(item.view)}
            >
              <Icon size={18} className={cn('shrink-0', active ? 'text-[#FFF3E6]' : 'text-[#381932] dark:text-[#381932]')} />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {active ? (
                <span className="h-2 w-2 rounded-full bg-[#FFF3E6] animate-pulse shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-[#381932] dark:text-[#381932] opacity-0 hover:opacity-100 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Profile & Back to Site */}
      <div className="shrink-0 border-t border-[#381932] dark:border-[#381932] p-3 bg-[#FFF3E6]/50 dark:bg-[#381932]/50 space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="min-w-0 pr-2">
            <div className="truncate text-xs font-black text-[#381932] dark:text-[#FFF3E6]">{user.name || `${user.firstName || ''} ${user.lastName || ''}`}</div>
            <div className="truncate text-[10px] font-semibold text-[#381932] dark:text-[#381932]">{user.email}</div>
          </div>
          <span className="shrink-0 rounded-full bg-[#FFF3E6] dark:bg-[#381932]/60 px-2 py-0.5 text-[10px] font-extrabold text-[#381932] dark:text-[#FFF3E6] border border-[#381932] dark:border-[#381932]">
            ADMIN
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] transition-colors cursor-pointer"
        >
          <LogOut size={14} /> Back to Website
        </button>
      </div>
    </div>
  );
};
