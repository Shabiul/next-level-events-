import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#381932] text-[#381932] shadow hover:opacity-90',
        destructive: 'bg-[#381932] text-[#FFF3E6] shadow-xs hover:opacity-90',
        outline: 'border border-[#381932] bg-transparent shadow-xs hover:bg-[#FFF3E6] hover:text-[#381932] dark:border-[#381932] dark:hover:bg-[#381932] dark:hover:text-[#381932]',
        secondary: 'bg-[#FFF3E6] text-[#381932] shadow-xs hover:bg-[#FFF3E6] dark:bg-[#381932] dark:text-[#381932]',
        ghost: 'hover:bg-[#FFF3E6] hover:text-[#381932] dark:hover:bg-[#381932] dark:hover:text-[#381932]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9 p-0 inline-flex items-center justify-center',
        'icon-lg': 'h-10 w-10 p-0 inline-flex items-center justify-center',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(buttonVariants({ variant, size }), (children.props as any).className, className),
        ref,
        ...props,
      });
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
