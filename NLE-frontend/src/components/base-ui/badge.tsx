import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#381932] text-[#381932] shadow hover:opacity-90',
        secondary: 'border-transparent bg-[#FFF3E6] text-[#381932] hover:bg-[#FFF3E6] dark:bg-[#381932] dark:text-[#381932]',
        destructive: 'border-transparent bg-[#381932] text-[#FFF3E6] shadow hover:opacity-90',
        outline: 'text-[#381932] border-[#381932] dark:text-[#381932] dark:border-[#381932]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
