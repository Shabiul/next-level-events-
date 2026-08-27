import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  ShoppingCart,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  ChevronDown,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowRight,
  Gift,
  Phone,
  Search,
  Truck,
  LifeBuoy,
  MapPinned,
  LogIn,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AdminCategory, AuthTab, AuthUser, Translations } from '../../types';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils/utils';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../base-ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '../base-ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../base-ui/accordion';
import { SERVICE_COLUMNS } from '../../data/servicesData';

interface AuthSlice {
  isLoggedIn: boolean;
  user: AuthUser | null;
  isAdmin?: boolean;
  open: (tab?: AuthTab) => void;
  logout: () => void;
}

export interface HeaderProps {
  currentLang?: string;
  onLanguageChange?: (lang: string) => void;
  user?: AuthUser | null;
  auth: AuthSlice;
  t?: Translations | Record<string, string>;
  onOpenAuth?: (tab: AuthTab) => void;
  onLogout?: () => void;
  onLogoClick?: () => void;
  showAssistantButton?: boolean;
  showMobileMenu?: boolean;
  onAssistantOpen?: () => void;
  categories?: AdminCategory[];
  onSelectCategory?: (catName: string, subName?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  auth,
  user: _user,
  onOpenAuth: _onOpenAuth,
  onLogout: _onLogout,
  onLogoClick,
  onAssistantOpen,
  categories: _categories = [],
  onSelectCategory,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('home');
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerPillRef = useRef<HTMLDivElement>(null);

  // Update scroll position for the utility strip's collapse-on-scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section observer for smooth scroll spy
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '') {
      setActiveSection('');
      return;
    }

    const sectionIds = ['curated-decors', 'packages', 'contact', 'footer'];
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const handleScrollSpy = () => {
      const scrollPos = window.scrollY;
      if (scrollPos < 250) {
        setActiveSection('home');
        return;
      }

      let currentActive = 'home';
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 160 && rect.bottom >= 120) {
          const id = el.id;
          if (id === 'curated-decors' || id === 'services') {
            currentActive = 'services';
          } else if (id === 'footer' || id === 'contact') {
            currentActive = 'contact';
          } else {
            currentActive = id;
          }
          break;
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(navSearchQuery.trim())}`);
      setNavSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  /**
   * Unified Anchor Navigation Handler
   * - If on HomePage: Smooth scroll directly to DOM element below sticky navbar
   * - If on Subpage: Navigate to `/#${targetId}` to trigger homepage offset scroll
   */
  const handleNavAnchor = (targetId: string) => {
    setMobileMenuOpen(false);

    if (location.pathname === '/' || location.pathname === '') {
      if (targetId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('home');
      } else {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      if (targetId === 'top') {
        navigate('/');
      } else {
        navigate(`/#${targetId}`);
      }
    }
  };

  const handleNavCategory = (catName: string, subName?: string) => {
    setMobileMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(catName, subName);
    } else {
      const url =
        subName && subName !== '__all__'
          ? `/category/${encodeURIComponent(catName)}/${encodeURIComponent(subName)}`
          : `/category/${encodeURIComponent(catName)}`;
      navigate(url);
    }
  };

  const navLinkClass = (active: boolean) =>
    cn(
      'relative px-1 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer',
      active
        ? 'text-[#725D75]'
        : isDark
          ? 'text-[#F9F6F2]/85 hover:text-white'
          : 'text-[#2F2930] hover:text-[#725D75]'
    );

  const navUnderline = (active: boolean) => (
    <span
      className={cn(
        'pointer-events-none absolute left-0 -bottom-[1px] h-[1.5px] w-full origin-left scale-x-0 bg-[#725D75] transition-transform duration-200',
        active && 'scale-x-100'
      )}
    />
  );

  const iconButtonClass = cn(
    'relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer',
    isDark ? 'text-[#F9F6F2] hover:bg-white/10' : 'text-[#2F2930] hover:bg-[#725D75]/08'
  );

  return (
    <header
      ref={headerPillRef}
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-300',
        isDark ? 'bg-[#1B101F]' : 'bg-[#F9F6F2]'
      )}
    >
      {/* ================================================================= */}
      {/* THIN UTILITY STRIP -- hides once the page is scrolled              */}
      {/* ================================================================= */}
      <div
        className={cn(
          'w-full overflow-hidden bg-[#725D75] text-[#F9F6F2] transition-all duration-300 ease-out',
          scrollY > 40 ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
        )}
      >
        <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-12 py-1.5 text-[11px] sm:text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 truncate">
            <Truck size={12} className="text-[#C9BEAB] shrink-0" />
            Free Delivery on orders above ₹999
          </span>
          <span className="flex-1 sm:flex-none text-center inline-flex items-center justify-center gap-1.5 truncate">
            <Sparkles size={12} className="text-[#C9BEAB] shrink-0" />
            Make Every Celebration Magical
          </span>
          <span className="hidden sm:inline-flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => navigate('/bookings')} className="inline-flex items-center gap-1.5 hover:text-[#C9BEAB] transition-colors cursor-pointer">
              <MapPinned size={12} />
              Track Order
            </button>
            <span className="text-white/30">|</span>
            <button type="button" onClick={() => navigate('/contact')} className="inline-flex items-center gap-1.5 hover:text-[#C9BEAB] transition-colors cursor-pointer">
              <LifeBuoy size={12} />
              Help &amp; Support
            </button>
          </span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* UNIFIED NAVBAR -- logo + nav + search + actions                    */}
      {/* A wide floating PILL spanning nearly the full viewport width on   */}
      {/* the landing page (reference: murudeshwara.com-style capsule nav); */}
      {/* a narrower floating rounded card everywhere else.                 */}
      {/* ================================================================= */}
      <div className={isHome ? 'w-full px-3 sm:px-6 lg:px-10 py-3 sm:py-4' : 'mx-auto max-w-[1720px] px-3 sm:px-5 lg:px-8 py-2 sm:py-3'}>
        <div
          className={cn(
            'flex items-center gap-2 sm:gap-3 lg:gap-5 h-[68px] sm:h-[76px] lg:h-[80px] backdrop-blur-md transition-colors duration-300',
            isHome
              ? cn(
                  'w-full rounded-full border px-4 sm:px-6 lg:px-8',
                  isDark
                    ? 'bg-[#1B101F]/90 border-[#483250] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]'
                    : 'bg-white/90 border-[#E4DCD2] shadow-[0_2px_16px_rgba(47,41,48,0.06)]'
                )
              : cn(
                  'rounded-[18px] sm:rounded-[20px] border px-3 sm:px-5 lg:px-6',
                  isDark
                    ? 'bg-[#1B101F]/90 border-[#483250] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]'
                    : 'bg-white/90 border-[#E4DCD2] shadow-[0_2px_16px_rgba(47,41,48,0.06)]'
                )
          )}
        >
          {/* Brand Logo */}
          <button
            type="button"
            onClick={onLogoClick || (() => handleNavAnchor('top'))}
            className="flex items-center text-left cursor-pointer focus:outline-none group shrink-0"
            aria-label="TheDecorParty Home"
          >
            <div className="flex flex-col items-start leading-none">
              <span
                className={cn(
                  'font-serif text-[9px] sm:text-[10px] font-bold tracking-[0.28em] uppercase transition-colors duration-300',
                  isDark ? 'text-[#725D75]' : 'text-[#746B72]'
                )}
              >
                THE
              </span>
              <div className="flex items-baseline gap-1 -mt-0.5">
                <span
                  className={cn(
                    'font-serif text-base sm:text-lg font-bold tracking-[0.08em] uppercase transition-colors duration-300',
                    isDark ? 'text-[#F9F6F2]' : 'text-[#2F2930]'
                  )}
                >
                  DECOR
                </span>
                <span
                  className={cn(
                    "font-heading italic lowercase text-[1.1rem] sm:text-[1.2rem] font-medium tracking-normal transition-colors duration-300",
                    isDark ? 'text-[#A78A9F]' : 'text-[#746B72]'
                  )}
                >
                  Party
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Nav Links (own row, single unified bar) */}
          <div className="hidden xl:block flex-1 min-w-0">
            <NavigationMenu className={cn(isDark ? 'text-[#F9F6F2]' : 'text-[#2F2930]')}>
              <NavigationMenuList className="flex items-center justify-center gap-5 2xl:gap-7">

                {/* Home */}
                <NavigationMenuItem>
                  <button
                    type="button"
                    onClick={() => handleNavAnchor('top')}
                    className={navLinkClass(location.pathname === '/' && activeSection === 'home')}
                  >
                    Home
                    {navUnderline(location.pathname === '/' && activeSection === 'home')}
                  </button>
                </NavigationMenuItem>

                {/* Services (mega-menu trigger) */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      'bg-transparent px-1 py-1.5 text-[13px] font-medium transition-colors duration-200 cursor-pointer',
                      activeSection === 'services'
                        ? 'text-[#725D75]'
                        : isDark
                          ? 'text-[#F9F6F2]/85 hover:text-white data-[state=open]:text-white'
                          : 'text-[#2F2930] hover:text-[#725D75] data-[state=open]:text-[#725D75]'
                    )}
                  >
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-0">
                    <div className="w-[720px] max-w-[96vw] rounded-3xl border border-[#E4DCD2] dark:border-[#483250] bg-[#F9F6F2] dark:bg-[#201325] p-6 shadow-2xl">
                      <div className="grid grid-cols-12 gap-6">
                        {SERVICE_COLUMNS.map((column, colIdx) => (
                          <div
                            key={column.key}
                            className={cn(
                              'text-left',
                              colIdx === 0
                                ? 'col-span-7 border-r border-[#E4DCD2]/70 dark:border-[#483250]/70 pr-5'
                                : 'col-span-5'
                            )}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                column.key === 'curated-decors'
                                  ? handleNavAnchor('curated-decors')
                                  : handleNavCategory(column.title)
                              }
                              className="flex items-center gap-2 pb-3 border-b border-[#E4DCD2]/60 dark:border-[#483250]/60 mb-3 w-full text-left hover:opacity-80 transition-opacity cursor-pointer group"
                            >
                              <column.icon size={16} className="text-[#725D75]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-[#2F2930] dark:text-[#FAF8F5]">
                                {column.title}
                              </span>
                              <ArrowUpRight size={12} className="text-[#746B72] ml-auto group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                            <div
                              className={cn(
                                'grid gap-1 pr-1',
                                colIdx === 0 ? 'grid-cols-2 max-h-[320px] overflow-y-auto' : 'grid-cols-1'
                              )}
                            >
                              {column.items.map((item) => (
                                <NavigationMenuLink
                                  key={item.label}
                                  href={`/category/${encodeURIComponent(item.label)}`}
                                  onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    handleNavCategory(item.label);
                                  }}
                                  className="group flex items-center justify-between gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#2F2930] hover:bg-[#725D75]/15 dark:text-[#FAF8F5] dark:hover:bg-[#38223E] transition-colors duration-200 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2 min-w-0">
                                    {item.icon && (
                                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F9F6F2] text-[#725D75] group-hover:bg-white group-hover:text-[#58445B] transition-colors duration-200 dark:bg-[#2D1C34] dark:text-[#C9BEAB]">
                                        <item.icon size={16} strokeWidth={1.75} />
                                      </span>
                                    )}
                                    <span className="truncate group-hover:text-[#725D75] dark:group-hover:text-[#C9BEAB] transition-colors duration-200">
                                      {item.label}
                                    </span>
                                  </span>
                                  <ArrowUpRight size={12} className="text-[#746B72] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-1" />
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Express Callout Strip */}
                      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-[#725D75] px-5 py-3.5 text-[#F9F6F2] shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Gift size={16} className="text-[#A78A9F] shrink-0" />
                          <p className="text-xs font-semibold leading-snug truncate">
                            <span className="text-[#A78A9F] font-bold uppercase tracking-wider mr-1.5">Express 3hr</span>
                            Same-day Bengaluru surprises — instant slots for tonight.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/explore')}
                          className="shrink-0 flex items-center justify-center gap-1 rounded-lg bg-[#F9F6F2] px-4 py-2 text-xs font-medium text-[#2F2930] shadow-sm hover:bg-[#C9BEAB] transition-colors cursor-pointer"
                        >
                          <span>Explore All</span>
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Packages */}
                <NavigationMenuItem>
                  <button
                    type="button"
                    onClick={() => {
                      if (location.pathname !== '/packages') {
                        navigate('/packages');
                      }
                    }}
                    className={navLinkClass(location.pathname === '/packages')}
                  >
                    Packages
                    {navUnderline(location.pathname === '/packages')}
                  </button>
                </NavigationMenuItem>

                {/* Gallery */}
                <NavigationMenuItem>
                  <button
                    type="button"
                    onClick={() => {
                      if (location.pathname !== '/gallery') {
                        navigate('/gallery');
                      }
                    }}
                    className={navLinkClass(location.pathname === '/gallery')}
                  >
                    Gallery
                    {navUnderline(location.pathname === '/gallery')}
                  </button>
                </NavigationMenuItem>

                {/* Contact Us -- second-to-last */}
                <NavigationMenuItem>
                  <button
                    type="button"
                    onClick={() => {
                      if (location.pathname !== '/contact') {
                        navigate('/contact');
                      }
                    }}
                    className={navLinkClass(location.pathname === '/contact')}
                  >
                    Contact Us
                    {navUnderline(location.pathname === '/contact')}
                  </button>
                </NavigationMenuItem>

                {/* About Us -- last item */}
                <NavigationMenuItem>
                  <button
                    type="button"
                    onClick={() => {
                      if (location.pathname !== '/about') {
                        navigate('/about');
                      }
                    }}
                    className={navLinkClass(location.pathname === '/about')}
                  >
                    About Us
                    {navUnderline(location.pathname === '/about')}
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Spacer to push actions right on <xl, where nav links are hidden */}
          <div className="xl:hidden flex-1" />

          {/* Right Action Items */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Search (icon + popover, never a persistent large bar) */}
            <div ref={searchRef} className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className={iconButtonClass}
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.75} />
              </button>

              {searchOpen && (
                <div
                  className={cn(
                    'absolute right-0 top-[calc(100%+10px)] w-[280px] sm:w-[340px] rounded-xl border p-2 shadow-md animate-scale-in z-50',
                    isDark ? 'bg-[#1B101F] border-[#483250]' : 'bg-white border-[#E4DCD2]'
                  )}
                >
                  <form onSubmit={submitSearch} className="flex items-center gap-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search themes, products & more..."
                      value={navSearchQuery}
                      onChange={(e) => setNavSearchQuery(e.target.value)}
                      className={cn(
                        'w-full bg-transparent text-sm border-none outline-none px-2',
                        isDark ? 'text-[#FAF8F5] placeholder:text-[#A78A9F]/60' : 'text-[#2F2930] placeholder:text-[#746B72]/70'
                      )}
                    />
                    <button
                      type="submit"
                      aria-label="Submit search"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#725D75] text-white hover:bg-[#A78A9F] transition-colors duration-200 cursor-pointer"
                    >
                      <Search size={14} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => navigate('/wishlist')}
              className={cn(iconButtonClass, 'hidden sm:flex')}
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className={cn('absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold', isDark ? 'bg-[#C9BEAB] text-[#1B101F]' : 'bg-[#725D75] text-white')}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className={iconButtonClass}
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={18} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className={cn('absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold', isDark ? 'bg-[#725D75] text-[#1B101F]' : 'bg-[#725D75] text-white')}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Theme Toggle (existing feature, tucked in unobtrusively) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(iconButtonClass, 'hidden lg:flex')}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
            </button>

            {/* User / Auth (hidden on mobile -- lives inside the drawer there) */}
            <div ref={accountRef} className="relative hidden sm:block">
              {auth.isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border py-1.5 px-2.5 transition-colors duration-200 cursor-pointer',
                    isDark
                      ? 'border-[#483250] bg-white/5 hover:bg-white/10 text-[#F9F6F2]'
                      : 'border-[#E4DCD2] bg-white hover:bg-[#725D75]/06 text-[#2F2930]'
                  )}
                >
                  <Avatar user={auth.user} className="h-5 w-5" />
                  <span className="hidden xl:inline text-xs font-semibold max-w-[80px] truncate">
                    {auth.user?.firstName || auth.user?.name || 'Account'}
                  </span>
                  <ChevronDown size={11} className={isDark ? 'text-[#A78A9F]' : 'text-[#746B72]'} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => auth.open('login')}
                  aria-label="Login"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border transition-colors duration-200 cursor-pointer',
                    'h-9 w-9 sm:h-10 sm:w-10 justify-center px-0 xl:h-auto xl:w-auto xl:justify-start xl:px-3 xl:py-2 text-xs font-medium',
                    isDark
                      ? 'text-[#F9F6F2] bg-white/5 hover:bg-white/10 border-[#483250]'
                      : 'text-[#2F2930] bg-white hover:bg-[#725D75]/06 border-[#E4DCD2]'
                  )}
                >
                  <UserIcon size={16} strokeWidth={1.75} />
                  <span className="hidden xl:inline">Login</span>
                </button>
              )}

              {/* Account Dropdown */}
              {accountOpen && auth.isLoggedIn && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#E4DCD2]/80 bg-[#F9F6F2] p-1.5 shadow-md dark:bg-[#2D1C34] dark:border-[#483250] animate-scale-in z-50">
                  <div className="px-3 py-2 border-b border-[#E4DCD2] dark:border-[#483250]">
                    <p className="text-xs font-bold text-[#2F2930] dark:text-[#FAF8F5] truncate">
                      {auth.user?.firstName} {auth.user?.lastName}
                    </p>
                    <p className="text-[11px] text-[#746B72] dark:text-[#A78A9F] truncate">
                      {auth.user?.email || auth.user?.phone}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate('/profile');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#2F2930] hover:bg-[#F9F6F2] dark:text-[#FAF8F5] dark:hover:bg-[#38223E] text-left cursor-pointer"
                    >
                      <UserIcon size={14} />
                      <span>My Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate('/bookings');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#2F2930] hover:bg-[#F9F6F2] dark:text-[#FAF8F5] dark:hover:bg-[#38223E] text-left cursor-pointer"
                    >
                      <Calendar size={14} />
                      <span>My Bookings</span>
                    </button>
                    {auth.isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          navigate('/admin');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 text-left cursor-pointer"
                      >
                        <Layers size={14} />
                        <span>Admin Portal</span>
                      </button>
                    )}
                  </div>
                  <div className="border-t border-[#E4DCD2] dark:border-[#483250] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        auth.logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-left cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Book Now */}
            <button
              type="button"
              onClick={() => {
                if (cartCount > 0) {
                  navigate('/cart');
                } else {
                  navigate('/packages');
                }
              }}
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium tracking-wide shadow-sm transition-colors duration-200 cursor-pointer bg-[#725D75] hover:bg-[#A78A9F] text-white"
            >
              <span>Book Now</span>
              <ArrowRight size={14} strokeWidth={2} />
            </button>

            {/* Mobile Sheet Trigger */}
            <div className="xl:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label="Open Navigation Menu"
                  >
                    <Menu size={20} strokeWidth={1.75} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-[#F9F6F2] dark:bg-[#1B101F] p-6 overflow-y-auto">
                  <div className="flex flex-col gap-5 pt-4">

                    {/* Brand header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#E4DCD2] dark:border-[#483250]">
                      <span className="font-serif text-sm font-bold tracking-wider text-[#2F2930] dark:text-[#FAF8F5] uppercase">
                        TheDecorParty
                      </span>
                    </div>

                    {/* Mobile Quick Search */}
                    <form
                      onSubmit={submitSearch}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3.5 py-2 border transition-all duration-300',
                        isDark
                          ? 'border-white/20 bg-black/40 text-[#F9F6F2]'
                          : 'border-[#E4DCD2] bg-white text-[#2F2930]'
                      )}
                    >
                      <Search size={14} className="text-[#725D75] shrink-0" />
                      <input
                        type="text"
                        placeholder="Search celebrations, themes..."
                        value={navSearchQuery}
                        onChange={(e) => setNavSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs font-medium border-none outline-none placeholder:text-[#725D75]/60 text-[#2F2930] dark:text-[#FAF8F5]"
                      />
                    </form>

                    <div className="flex flex-col gap-1 text-sm font-semibold text-[#2F2930] dark:text-[#FAF8F5]">

                      {/* Home */}
                      <button
                        type="button"
                        onClick={() => handleNavAnchor('top')}
                        className="text-left py-2 px-1 hover:text-[#725D75] transition-colors border-b border-[#E4DCD2]/50 dark:border-[#483250]/50"
                      >
                        Home
                      </button>

                      {/* Services Accordion */}
                      <Accordion type="single" collapsible className="w-full border-b border-[#E4DCD2]/50 dark:border-[#483250]/50">
                        <AccordionItem value="mobile-services" className="border-none">
                          <AccordionTrigger className="py-2 px-1 text-sm font-semibold text-[#2F2930] dark:text-[#FAF8F5] hover:no-underline">
                            Services
                          </AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-3 pl-3 pt-1 pb-3 text-xs text-[#746B72] dark:text-[#C9BEAB]">
                            {SERVICE_COLUMNS.map((column) => (
                              <div key={column.key} className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    column.key === 'curated-decors'
                                      ? handleNavAnchor('curated-decors')
                                      : handleNavCategory(column.title)
                                  }
                                  className="flex items-center gap-1.5 text-left py-1 font-bold uppercase tracking-wider text-[10px] text-[#2F2930] dark:text-[#FAF8F5]"
                                >
                                  <column.icon size={12} className="text-[#725D75]" />
                                  {column.title}
                                </button>
                                {column.items.map((item) => (
                                  <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => handleNavCategory(item.label)}
                                    className="group flex items-center gap-2 text-left py-1 pl-2 hover:text-[#725D75] dark:hover:text-white transition-colors duration-200"
                                  >
                                    {item.icon && (
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#F9F6F2] text-[#725D75] dark:bg-[#2D1C34] dark:text-[#C9BEAB]">
                                        <item.icon size={12} strokeWidth={1.75} />
                                      </span>
                                    )}
                                    <span>{item.label}</span>
                                  </button>
                                ))}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleNavAnchor('express')}
                              className="text-left py-1 font-bold uppercase tracking-wider text-[10px] text-[#2F2930] dark:text-[#FAF8F5]"
                            >
                              Express 3-Hour Setup
                            </button>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* Packages */}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (location.pathname !== '/packages') {
                            navigate('/packages');
                          }
                        }}
                        className={cn(
                          "text-left py-2 px-1 hover:text-[#725D75] transition-colors border-b border-[#E4DCD2]/50 dark:border-[#483250]/50",
                          location.pathname === '/packages' && "text-[#725D75] font-bold"
                        )}
                      >
                        Packages &amp; Pricing
                      </button>

                      {/* Gallery */}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (location.pathname !== '/gallery') {
                            navigate('/gallery');
                          }
                        }}
                        className={cn(
                          "text-left py-2 px-1 hover:text-[#725D75] transition-colors border-b border-[#E4DCD2]/50 dark:border-[#483250]/50",
                          location.pathname === '/gallery' && "text-[#725D75] font-bold"
                        )}
                      >
                        Visual Gallery
                      </button>

                      {/* Contact Us */}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (location.pathname !== '/contact') {
                            navigate('/contact');
                          }
                        }}
                        className={cn(
                          "text-left py-2 px-1 hover:text-[#725D75] transition-colors border-b border-[#E4DCD2]/50 dark:border-[#483250]/50",
                          location.pathname === '/contact' && "text-[#725D75] font-bold"
                        )}
                      >
                        Contact Us
                      </button>

                      {/* About Us -- second-last item, immediately after Contact Us */}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (location.pathname !== '/about') {
                            navigate('/about');
                          }
                        }}
                        className={cn(
                          "text-left py-2 px-1 hover:text-[#725D75] transition-colors border-b border-[#E4DCD2]/50 dark:border-[#483250]/50",
                          location.pathname === '/about' && "text-[#725D75] font-bold"
                        )}
                      >
                        About Us
                      </button>

                      {/* Login (mobile-only entry -- desktop shows it as an icon) */}
                      {!auth.isLoggedIn ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            auth.open('login');
                          }}
                          className="flex items-center gap-2 text-left py-2 px-1 hover:text-[#725D75] transition-colors border-b border-[#E4DCD2]/50 dark:border-[#483250]/50"
                        >
                          <LogIn size={14} className="text-[#725D75]" />
                          <span>Login</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/profile');
                          }}
                          className="flex items-center gap-2 text-left py-2 px-1 hover:text-[#725D75] transition-colors border-b border-[#E4DCD2]/50 dark:border-[#483250]/50"
                        >
                          <UserIcon size={14} className="text-[#725D75]" />
                          <span>My Profile</span>
                        </button>
                      )}

                      {/* AI Planner */}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onAssistantOpen) onAssistantOpen();
                          else navigate('/ai-planner');
                        }}
                        className="flex items-center gap-2 text-left py-2 px-1 hover:text-[#725D75] transition-colors border-b border-[#E4DCD2]/50 dark:border-[#483250]/50"
                      >
                        <Sparkles size={14} className="text-[#725D75]" />
                        <span>AI Celebration Planner</span>
                      </button>
                    </div>

                    {/* Action CTA */}
                    <div className="flex flex-col gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/checkout');
                        }}
                        className="w-full rounded-lg bg-[#725D75] dark:bg-[#C9BEAB] dark:text-[#34203C] text-[#F9F6F2] py-3 text-xs sm:text-sm font-medium tracking-wide text-center cursor-pointer"
                      >
                        Book Now
                      </button>

                      <a
                        href="https://wa.me/917022058460"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-lg border border-[#E4DCD2] dark:border-[#483250] py-2.5 text-xs sm:text-sm font-medium tracking-wide text-[#2F2930] dark:text-[#FAF8F5] text-center"
                      >
                        <Phone size={13} className="text-[#25D366]" />
                        <span>WhatsApp Quick Assistance</span>
                      </a>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
