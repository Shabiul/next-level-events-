import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ' +
    'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-[#381932] text-[#FFF3E6] font-semibold hover:opacity-90 shadow-xs active:scale-[0.98] dark:bg-[#FFF3E6] dark:text-[#381932] dark:hover:bg-[#FFF3E6]',
        secondary: 'bg-transparent text-[#381932] border border-[#381932] hover:bg-[#A78A9F]/18 dark:bg-transparent dark:text-[#FFF3E6] dark:border-[#381932] dark:hover:bg-[#A78A9F]/22',
        outline: 'bg-transparent text-[#381932] border border-[#381932]/30 hover:border-[#381932] hover:bg-[#FFF3E6] dark:text-[#381932] dark:border-[#381932] dark:hover:bg-[#381932]',
        subtle: 'bg-[#FFF3E6] text-[#381932] hover:bg-[#FFF3E6] dark:bg-[#381932] dark:text-[#FFF3E6] dark:hover:bg-[#381932]',
        ghost: 'text-[#381932] hover:bg-[#FFF3E6] dark:text-[#FFF3E6] dark:hover:bg-[#381932]',
        khaki: 'bg-[#381932] text-[#381932] font-semibold hover:bg-[#FFF3E6] shadow-xs',
        lilac: 'bg-[#381932] text-[#381932] font-semibold hover:opacity-90 shadow-xs',
        violet: 'bg-[#381932] text-[#FFF3E6] font-semibold hover:opacity-90 shadow-xs',
        gold: 'bg-[#381932] text-[#381932] hover:bg-[#FFF3E6] shadow-xs',
        danger: 'bg-[#381932] text-[#FFF3E6] hover:opacity-90',
        link: 'text-[#381932] hover:text-[#381932] underline-offset-4 hover:underline p-0 h-auto font-medium dark:text-[#381932]',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-11 px-6 text-sm font-semibold rounded-lg',
        xl: 'h-13 px-8 text-base font-semibold rounded-xl',
        icon: 'h-10 w-10 p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
