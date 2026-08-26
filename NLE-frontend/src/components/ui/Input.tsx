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
          <label htmlFor={inputId} className="text-xs font-medium tracking-wide text-[#746B72] dark:text-neutral-300">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={cn(hintId, errorId) || undefined}
          className={cn(
            'h-10 w-full rounded-lg border border-[#E4DCD2] bg-white px-3.5 text-sm text-[#2F2930] placeholder:text-[#746B72]/70',
            'transition-colors focus:outline-none focus:ring-1 focus:ring-[#A78A9F] focus:border-[#A78A9F]',
            'disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white dark:focus:border-white',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-[#746B72] dark:text-neutral-400">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-red-500 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
