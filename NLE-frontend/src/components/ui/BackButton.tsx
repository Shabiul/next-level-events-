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
      'inline-flex items-center gap-1.5 text-xs font-semibold text-[#725D75] hover:text-[#34203C] transition-colors dark:text-[#C8B5C3] dark:hover:text-[#FAF8F5] cursor-pointer',
      iconOnly
        ? 'h-9 w-9 items-center justify-center rounded-full border border-[#DDD5C7] bg-[#FAF8F5] hover:bg-[#F5EFE6] dark:bg-[#2D1C34] dark:border-[#483250]'
        : '',
      className
    )}
  >
    <ArrowLeft size={iconOnly ? 16 : 14} />
    {!iconOnly && (children || 'Back')}
  </button>
);
