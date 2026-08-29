import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationMenuContextType {
  activeItem: string | null;
  setActiveItem: (item: string | null) => void;
  openWithTimer: (item: string) => void;
  closeWithTimer: () => void;
}

const NavigationMenuContext = React.createContext<NavigationMenuContextType | null>(null);

export function NavigationMenu({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = React.useRef<HTMLElement | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const openWithTimer = (item: string) => {
    clearTimer();
    setActiveItem(item);
  };

  const closeWithTimer = () => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setActiveItem(null);
    }, 180);
  };

  React.useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <NavigationMenuContext.Provider value={{ activeItem, setActiveItem, openWithTimer, closeWithTimer }}>
      <nav
        ref={containerRef}
        className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)}
        onMouseLeave={closeWithTimer}
        onMouseEnter={clearTimer}
        {...props}
      >
        {children}
      </nav>
    </NavigationMenuContext.Provider>
  );
}

export function NavigationMenuList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)}
      {...props}
    >
      {children}
    </ul>
  );
}

const NavigationMenuItemContext = React.createContext<{ id: string } | null>(null);

export function NavigationMenuItem({
  className,
  children,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  const id = React.useId();
  return (
    <NavigationMenuItemContext.Provider value={{ id }}>
      <li className={cn('relative', className)} {...props}>
        {children}
      </li>
    </NavigationMenuItemContext.Provider>
  );
}

export function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const menuCtx = React.useContext(NavigationMenuContext);
  const itemCtx = React.useContext(NavigationMenuItemContext);
  const isOpen = menuCtx?.activeItem === itemCtx?.id;

  return (
    <button
      type="button"
      onClick={() => {
        if (!menuCtx || !itemCtx) return;
        menuCtx.setActiveItem(isOpen ? null : itemCtx.id);
      }}
      onMouseEnter={() => {
        if (itemCtx && menuCtx) menuCtx.openWithTimer(itemCtx.id);
      }}
      className={cn(
        'group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'relative top-[1px] ml-1 h-3.5 w-3.5 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
        aria-hidden="true"
      />
    </button>
  );
}

export function NavigationMenuContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const menuCtx = React.useContext(NavigationMenuContext);
  const itemCtx = React.useContext(NavigationMenuItemContext);
  const isOpen = menuCtx?.activeItem === itemCtx?.id;

  if (!isOpen) return null;

  return (
    <div
      onMouseEnter={() => {
        if (itemCtx && menuCtx) menuCtx.openWithTimer(itemCtx.id);
      }}
      onMouseLeave={() => {
        menuCtx?.closeWithTimer();
      }}
      className={cn(
        'fixed left-1/2 -translate-x-1/2 top-[76px] sm:top-[82px] z-50 animate-in fade-in-0 zoom-in-95 duration-200 pointer-events-auto',
        className
      )}
      data-slot="navigation-menu-viewport"
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
    </div>
  );
}

export function NavigationMenuLink({
  className,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        'group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-[#FFF3E6] dark:hover:bg-[#381932]',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
