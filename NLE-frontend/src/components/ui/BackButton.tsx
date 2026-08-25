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
      'inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B76] hover:text-[#1C1B22] transition-colors dark:text-[#C8B5C3] dark:hover:text-[#FAF8F5] cursor-pointer',
      iconOnly
        ? 'h-9 w-9 items-center justify-center rounded-full border border-[#E4DEF2] bg-[#FAF8F5] hover:bg-[#F2EEFA] dark:bg-[#2D1C34] dark:border-[#483250]'
        : '',
      className
    )}
  >
    <ArrowLeft size={iconOnly ? 16 : 14} />
    {!iconOnly && (children || 'Back')}
  </button>
);
