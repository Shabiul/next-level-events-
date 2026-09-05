import * as React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType | null>(null);

export function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (val: boolean) => {
      if (onOpenChange) onOpenChange(val);
      if (!isControlled) setUncontrolledOpen(val);
    },
    [isControlled, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  asChild,
  children,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    ctx.setOpen(true);
    props.onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: any) => {
        (children.props as any).onClick?.(e);
        ctx.setOpen(true);
      },
      ...props,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export function SheetContent({
  side = 'right',
  className,
  children,
  ...props
}: {
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SheetContext);
  if (!ctx || !ctx.open) return null;

  const sideClasses = {
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t',
    left: 'inset-y-0 left-0 h-full border-r',
    right: 'inset-y-0 right-0 h-full border-l',
  };

  // Portal to document.body: `fixed inset-0` only covers the true viewport
  // when nothing else defines the fixed-position containing block. Any
  // ancestor with a backdrop-filter/filter/transform (e.g. the header pill's
  // backdrop-blur) would otherwise re-anchor this overlay to that ancestor's
  // box instead of the screen, squashing the whole drawer down to it.
  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#381932]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => ctx.setOpen(false)}
      />
      {/* Sheet Panel */}
      <div
        className={cn(
          'fixed z-50 bg-[#FFF3E6] shadow-xl transition-transform duration-300 ease-in-out dark:bg-[#381932]',
          sideClasses[side],
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => ctx.setOpen(false)}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-5 w-5 text-[#381932] hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#FFF3E6]" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
