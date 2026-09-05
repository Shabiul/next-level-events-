import { type HTMLAttributes } from 'react';
import { cn } from '../../utils/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-[#381932]/30 bg-[#FFF3E6] text-[#381932] shadow-card transition-all duration-200 hover:shadow-card-hover dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 border-b border-[#381932]/30 dark:border-[#381932]', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-semibold text-[#381932] text-base dark:text-[#FFF3E6]', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 border-t border-[#381932]/30 flex items-center gap-3 dark:border-[#381932]', className)} {...props} />;
}
