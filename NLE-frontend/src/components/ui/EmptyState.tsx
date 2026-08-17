import React from 'react';
import { Loader2, PackageSearch } from 'lucide-react';
import { Button } from './Button';

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading packages...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#6F6F6B] dark:text-[#A0A09C]">
    <Loader2 className="animate-spin text-[#1C1C1C] dark:text-white" size={28} />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 px-4 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F3F0] dark:bg-[#262626] mb-2">
      <PackageSearch className="text-[#6F6F6B] dark:text-[#A0A09C]" size={24} strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold text-[#1C1C1C] dark:text-white">{title}</h3>
    {description && <p className="max-w-sm text-xs md:text-sm text-[#6F6F6B] dark:text-[#A0A09C]">{description}</p>}
    {actionLabel && onAction && (
      <Button variant="primary" size="sm" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
