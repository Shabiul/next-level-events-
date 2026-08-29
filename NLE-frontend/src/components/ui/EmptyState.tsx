import React from 'react';
import { Loader2, PackageSearch } from 'lucide-react';
import { Button } from './Button';

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading packages...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#381932] dark:text-[#381932]">
    <Loader2 className="animate-spin text-[#381932] dark:text-[#FFF3E6]" size={28} />
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
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3E6] dark:bg-[#381932] mb-2">
      <PackageSearch className="text-[#381932] dark:text-[#381932]" size={24} strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold text-[#381932] dark:text-[#FFF3E6]">{title}</h3>
    {description && <p className="max-w-sm text-xs md:text-sm text-[#381932] dark:text-[#381932]">{description}</p>}
    {actionLabel && onAction && (
      <Button variant="primary" size="sm" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
