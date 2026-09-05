import React from 'react';
import { LayoutDashboard, FolderTree, Gift, Package, Inbox, Users, PartyPopper, Sparkles, LogOut, ChevronRight, Settings, IndianRupee, UserCog } from 'lucide-react';
import type { AdminView, AuthUser } from '../../types';
import { cn } from '../../lib/utils';

// The CRM is a separate app from the customer site -- "back to website"
// is a real cross-app navigation, not a react-router route.
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:3000';

const NAV_ITEMS: { view: AdminView; icon: React.ElementType; label: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { view: 'categories', icon: FolderTree, label: 'Categories' },
  { view: 'products', icon: Gift, label: 'Products' },
  { view: 'addons', icon: Sparkles, label: 'Add-ons' },
  { view: 'activities', icon: PartyPopper, label: 'Activities' },
  { view: 'orders', icon: Package, label: 'Bookings' },
  { view: 'payments', icon: IndianRupee, label: 'Payments' },
  { view: 'enquiries', icon: Inbox, label: 'Enquiries' },
  { view: 'users', icon: Users, label: 'Users' },
  { view: 'settings', icon: Settings, label: 'Site Settings' },
  { view: 'staff', icon: UserCog, label: 'Staff' },
];

interface SidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  user: AuthUser;
  onCloseMobile?: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user, onCloseMobile, onLogout }) => {
  const goToSite = () => { window.location.href = SITE_URL; };

  const handleSelect = (view: AdminView) => {
    onViewChange(view);
    onCloseMobile?.();
  };

  // Dashboard is always visible; "staff" (managing other staff) is
  // admin-only; everything else is gated by the staff account's granted
  // permissions. Admins implicitly see everything.
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.view === 'dashboard') return true;
    if (user.role === 'admin') return true;
    if (item.view === 'staff') return false;
    return user.permissions?.includes(item.view) ?? false;
  });

  return (
    <div className="flex h-full w-full flex-col border-r border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] select-none">
      {/* Brand Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#381932] dark:border-[#381932] px-5 py-4">
        <div 
          onClick={goToSite} 
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
        {visibleItems.map(item => {
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
            {user.role === 'admin' ? 'ADMIN' : 'STAFF'}
          </span>
        </div>

        <button
          type="button"
          onClick={goToSite}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#381932] dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-3 py-2 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] transition-colors cursor-pointer"
        >
          View Website
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#381932] px-3 py-2 text-xs font-bold text-[#FFF3E6] hover:opacity-90 transition-colors cursor-pointer"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </div>
  );
};
