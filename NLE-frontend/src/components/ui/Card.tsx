import { type HTMLAttributes } from 'react';
import { cn } from '../../utils/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-[#E8E7E3] bg-white text-[#1C1C1C] shadow-card transition-all duration-200 hover:shadow-card-hover dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-white',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 border-b border-[#E8E7E3] dark:border-[#2E2E2E]', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-semibold text-[#1C1C1C] text-base dark:text-white', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 border-t border-[#E8E7E3] flex items-center gap-3 dark:border-[#2E2E2E]', className)} {...props} />;
}
