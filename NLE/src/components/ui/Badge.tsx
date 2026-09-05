import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#FFF3E6] text-[#381932] border border-[#381932]/30 dark:bg-[#381932] dark:text-[#FFF3E6] dark:border-[#381932]',
        outline: 'bg-transparent text-[#381932] border border-[#381932]/30 dark:text-[#FFF3E6] dark:border-[#381932]',
        success: 'bg-[#FFF3E6] text-[#381932] border border-[#381932] dark:bg-[#381932]/40 dark:text-[#381932] dark:border-[#381932]',
        warning: 'bg-[#FFF3E6] text-[#381932] border border-[#381932] dark:bg-[#381932]/40 dark:text-[#FFF3E6] dark:border-[#381932]',
        danger: 'bg-[#FFF3E6] text-[#381932] border border-[#381932] dark:bg-[#381932]/40 dark:text-[#381932] dark:border-[#381932]',
        neutral: 'bg-[#FFF3E6] text-[#381932] dark:bg-[#381932] dark:text-[#381932]',
        dark: 'bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
