import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextType {
  value: string | null;
  toggle: (itemValue: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

export function Accordion({
  type = 'single',
  collapsible = true,
  className,
  children,
  defaultValue = null,
}: {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
  defaultValue?: string | null;
}) {
  const [value, setValue] = React.useState<string | null>(defaultValue);

  const toggle = (itemValue: string) => {
    if (type === 'single') {
      if (value === itemValue) {
        if (collapsible) setValue(null);
      } else {
        setValue(itemValue);
      }
    } else {
      // In single mode or multiple
      setValue(value === itemValue ? null : itemValue);
    }
  };

  return (
    <AccordionContext.Provider value={{ value, toggle }}>
      <div className={cn('space-y-1', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

const AccordionItemContext = React.createContext<{ value: string } | null>(null);

export function AccordionItem({
  value,
  className,
  children,
  ...props
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn('border-b border-[#381932] dark:border-[#381932]', className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);

  if (!ctx || !itemCtx) return null;
  const isOpen = ctx.value === itemCtx.value;

  return (
    <button
      type="button"
      onClick={() => ctx.toggle(itemCtx.value)}
      className={cn(
        'flex w-full items-center justify-between py-3 text-sm font-medium transition-all text-left cursor-pointer',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200 text-[#381932]',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);

  if (!ctx || !itemCtx) return null;
  const isOpen = ctx.value === itemCtx.value;

  if (!isOpen) return null;

  return (
    <div className={cn('overflow-hidden text-sm transition-all', className)} {...props}>
      {children}
    </div>
  );
}
