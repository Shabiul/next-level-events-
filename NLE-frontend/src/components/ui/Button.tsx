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
        primary: 'bg-[#725D75] text-white font-semibold hover:bg-[#483250] shadow-xs active:scale-[0.98] dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300',
        secondary: 'bg-transparent text-[#2F2930] border border-[#725D75] hover:bg-[#725D75]/10 dark:bg-transparent dark:text-[#FAF8F5] dark:border-[#A78A9F] dark:hover:bg-[#A78A9F]/15',
        outline: 'bg-transparent text-[#2F2930] border border-[#E4DCD2] hover:border-[#725D75] hover:bg-[#F9F6F2] dark:text-[#C9BEAB] dark:border-[#483250] dark:hover:bg-[#2D1C34]',
        subtle: 'bg-[#F9F6F2] text-[#2F2930] hover:bg-[#F9F6F2] dark:bg-[#2D1C34] dark:text-[#FAF8F5] dark:hover:bg-[#38223E]',
        ghost: 'text-[#2F2930] hover:bg-[#F9F6F2] dark:text-[#FAF8F5] dark:hover:bg-[#2D1C34]',
        khaki: 'bg-[#C9BEAB] text-[#2F2930] font-semibold hover:bg-[#F9F6F2] shadow-xs',
        lilac: 'bg-[#725D75] text-[#2F2930] font-semibold hover:bg-[#C9BEAB] shadow-xs',
        violet: 'bg-[#725D75] text-[#F9F6F2] font-semibold hover:bg-[#483250] shadow-xs',
        gold: 'bg-[#C9BEAB] text-[#2F2930] hover:bg-[#F9F6F2] shadow-xs',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-[#725D75] hover:text-[#746B72] underline-offset-4 hover:underline p-0 h-auto font-medium dark:text-[#C9BEAB]',
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
