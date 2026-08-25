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
        primary: 'bg-[#8F6FC4] text-white font-semibold hover:bg-[#483250] shadow-xs active:scale-[0.98] dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300',
        secondary: 'bg-transparent text-[#1C1B22] border border-[#8F6FC4] hover:bg-[#8F6FC4]/10 dark:bg-transparent dark:text-[#FAF8F5] dark:border-[#A78A9F] dark:hover:bg-[#A78A9F]/15',
        outline: 'bg-transparent text-[#1C1B22] border border-[#E4DEF2] hover:border-[#8F6FC4] hover:bg-[#FAF8F5] dark:text-[#C9BEAB] dark:border-[#483250] dark:hover:bg-[#2D1C34]',
        subtle: 'bg-[#F2EEFA] text-[#1C1B22] hover:bg-[#EAE5F5] dark:bg-[#2D1C34] dark:text-[#FAF8F5] dark:hover:bg-[#38223E]',
        ghost: 'text-[#1C1B22] hover:bg-[#F2EEFA] dark:text-[#FAF8F5] dark:hover:bg-[#2D1C34]',
        khaki: 'bg-[#C7B8E8] text-[#1C1B22] font-semibold hover:bg-[#FAF8F5] shadow-xs',
        lilac: 'bg-[#8F6FC4] text-[#1C1B22] font-semibold hover:bg-[#C7B8E8] shadow-xs',
        violet: 'bg-[#8F6FC4] text-[#FAF8F5] font-semibold hover:bg-[#483250] shadow-xs',
        gold: 'bg-[#C7B8E8] text-[#1C1B22] hover:bg-[#FAF8F5] shadow-xs',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-[#8F6FC4] hover:text-[#6B6B76] underline-offset-4 hover:underline p-0 h-auto font-medium dark:text-[#C9BEAB]',
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
