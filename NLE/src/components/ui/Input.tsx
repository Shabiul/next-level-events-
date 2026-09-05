import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '../../utils/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium tracking-wide text-[#381932] dark:text-[#381932]">
            {label}
            {required && <span className="text-[#381932] ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={cn(hintId, errorId) || undefined}
          className={cn(
            'h-10 w-full rounded-lg border border-[#381932]/30 bg-[#FFF3E6] px-3.5 text-sm text-[#381932] placeholder:text-[#381932]/70',
            'transition-colors focus:outline-none focus:ring-1 focus:ring-[#381932] focus:border-[#381932]',
            'disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6] dark:placeholder:text-[#381932] dark:focus:ring-[#FFF3E6] dark:focus:border-[#FFF3E6]',
            error && 'border-[#381932] focus:ring-[#381932] focus:border-[#381932]',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-[#381932] dark:text-[#381932]">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-[#381932] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
