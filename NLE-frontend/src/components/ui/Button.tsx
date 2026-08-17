import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ' +
    'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-[#A78A9F] text-[#34203C] font-semibold hover:bg-[#C9BEAB] shadow-xs active:scale-[0.98] dark:bg-[#A78A9F] dark:text-[#1B101F] dark:hover:bg-[#C9BEAB]',
        secondary: 'bg-transparent text-[#34203C] border border-[#A78A9F] hover:bg-[#A78A9F]/10 dark:bg-transparent dark:text-[#FAF8F5] dark:border-[#A78A9F] dark:hover:bg-[#A78A9F]/15',
        outline: 'bg-transparent text-[#34203C] border border-[#DDD5C7] hover:border-[#A78A9F] hover:bg-[#FAF8F5] dark:text-[#C9BEAB] dark:border-[#483250] dark:hover:bg-[#2D1C34]',
        subtle: 'bg-[#F5EFE6] text-[#34203C] hover:bg-[#E6DFD5] dark:bg-[#2D1C34] dark:text-[#FAF8F5] dark:hover:bg-[#38223E]',
        ghost: 'text-[#34203C] hover:bg-[#F5EFE6] dark:text-[#FAF8F5] dark:hover:bg-[#2D1C34]',
        khaki: 'bg-[#C9BEAB] text-[#34203C] font-semibold hover:bg-[#FAF8F5] shadow-xs',
        lilac: 'bg-[#A78A9F] text-[#34203C] font-semibold hover:bg-[#C9BEAB] shadow-xs',
        violet: 'bg-[#34203C] text-[#FAF8F5] font-semibold hover:bg-[#483250] shadow-xs',
        gold: 'bg-[#C9BEAB] text-[#34203C] hover:bg-[#FAF8F5] shadow-xs',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-[#A78A9F] hover:text-[#725D75] underline-offset-4 hover:underline p-0 h-auto font-medium dark:text-[#C9BEAB]',
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
