import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/utils';

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconOnly?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ iconOnly = false, className, children, ...props }) => (
  <button
    type="button"
    {...props}
    className={cn(
      'inline-flex items-center gap-1.5 text-xs font-semibold text-[#381932] hover:text-[#381932] transition-colors dark:text-[#FFF3E6] dark:hover:text-[#FFF3E6] cursor-pointer',
      iconOnly
        ? 'h-9 w-9 items-center justify-center rounded-full border border-[#381932]/30 bg-[#FFF3E6] hover:bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932]'
        : '',
      className
    )}
  >
    <ArrowLeft size={iconOnly ? 16 : 14} />
    {!iconOnly && (children || 'Back')}
  </button>
);
