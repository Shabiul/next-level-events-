export interface BadgeColorOption {
  value: string;
  label: string;
  badgeClass: string;
  adminBadgeClass: string;
}

export const BADGE_COLORS: BadgeColorOption[] = [
  {
    value: 'purple',
    label: 'Purple (Royal)',
    badgeClass: 'bg-[#381932] text-[#FFF3E6] shadow-xs',
    adminBadgeClass: 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]',
  },
  {
    value: 'pink',
    label: 'Pink (Trending)',
    badgeClass: 'bg-[#381932] text-[#FFF3E6] shadow-xs',
    adminBadgeClass: 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]',
  },
  {
    value: 'gold',
    label: 'Gold (Premium)',
    badgeClass: 'bg-[#381932] text-[#381932] font-bold shadow-xs',
    adminBadgeClass: 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#FFF3E6] border-[#381932] dark:border-[#381932]',
  },
  {
    value: 'green',
    label: 'Green (New Launch)',
    badgeClass: 'bg-[#381932] text-[#FFF3E6] shadow-xs',
    adminBadgeClass: 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]',
  },
  {
    value: 'rose',
    label: 'Rose (Hot Sale)',
    badgeClass: 'bg-[#381932] text-[#FFF3E6] shadow-xs',
    adminBadgeClass: 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]',
  },
  {
    value: 'red',
    label: 'Red (Flash Deal)',
    badgeClass: 'bg-[#381932] text-[#FFF3E6] shadow-xs',
    adminBadgeClass: 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]',
  },
  {
    value: 'blue',
    label: 'Blue (Verified)',
    badgeClass: 'bg-[#381932] text-[#FFF3E6] shadow-xs',
    adminBadgeClass: 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]',
  },
  {
    value: 'indigo',
    label: 'Indigo (Popular)',
    badgeClass: 'bg-[#381932] text-[#FFF3E6] shadow-xs',
    adminBadgeClass: 'bg-[#FFF3E6] dark:bg-[#381932]/60 text-[#381932] dark:text-[#381932] border-[#381932] dark:border-[#381932]',
  },
  {
    value: 'dark',
    label: 'Black (Luxe Edition)',
    badgeClass: 'bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932] border border-[#381932] dark:border-[#381932] shadow-xs',
    adminBadgeClass: 'bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932] border border-[#381932] dark:border-[#381932]',
  },
];

const BADGE_MAP: Record<string, string> = BADGE_COLORS.reduce((acc, curr) => {
  acc[curr.value] = curr.badgeClass;
  return acc;
}, {} as Record<string, string>);

const ADMIN_BADGE_MAP: Record<string, string> = BADGE_COLORS.reduce((acc, curr) => {
  acc[curr.value] = curr.adminBadgeClass;
  return acc;
}, {} as Record<string, string>);

export function getBadgeColorClass(color?: string): string {
  if (!color) return BADGE_MAP.purple;
  const key = color.toLowerCase();
  return BADGE_MAP[key] || BADGE_MAP.purple;
}

export function getAdminBadgeColorClass(color?: string): string {
  if (!color) return ADMIN_BADGE_MAP.purple;
  const key = color.toLowerCase();
  return ADMIN_BADGE_MAP[key] || ADMIN_BADGE_MAP.purple;
}
