import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  ShoppingCart,
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
  LifeBuoy,
  MapPinned,
  LogIn,
  PartyPopper,
  X,
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
import { SERVICE_COLUMNS, getServiceThumb } from '../../data/servicesData';
import { useProducts } from '../../hooks/useProducts';
import { useTypewriter } from '../../hooks/useTypewriter';
import { CELEBRATION_SEARCH_SUGGESTIONS } from '../../data/celebrationSuggestions';
import {
  buildServiceIndex,
  searchServices,
  resolveEntryRoute,
  type SearchEntry,
} from '../../utils/serviceSearch';

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
  /** Landing page only: nav sits transparent over the hero video and fades to
   * a solid Milk bar once the user scrolls. Every other page leaves this off
   * and renders the standard sticky bar unchanged. */
  transparentOverHero?: boolean;
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
  transparentOverHero = false,
}) => {
  const { isDark } = useTheme();
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  // Services mega-menu / mobile accordion: a service's sub-services stay
  // collapsed until its own row is clicked, instead of every sub-list
  // being shown at once.
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('home');

  // Landing overlay nav: transparent over the hero, solid Milk after a nudge of scroll.
  const navGlassy = transparentOverHero && scrollY <= 24;
  // Treat the glassy state like dark mode for text/icon colour (Milk on the video).
  const onDarkNav = isDark || navGlassy;
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
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
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setMobileSearchFocused(false);
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

  // ---- Service-based search -------------------------------------------------
  const { products: liveProducts, categories: liveCategories } = useProducts();
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const searchIndex = useMemo(
    () => buildServiceIndex(
      liveCategories && liveCategories.length ? liveCategories : _categories,
      liveProducts
    ),
    [liveCategories, _categories, liveProducts]
  );

  const suggestions = useMemo(
    () => (navSearchQuery.trim().length >= 2 ? searchServices(navSearchQuery, searchIndex) : []),
    [navSearchQuery, searchIndex]
  );

  useEffect(() => { setActiveSuggestion(-1); }, [navSearchQuery]);

  const navSearchTypewriter = useTypewriter(CELEBRATION_SEARCH_SUGGESTIONS);

  const closeSearch = () => {
    setNavSearchQuery('');
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    setMobileSearchFocused(false);
  };

  const goToEntry = (entry: SearchEntry) => {
    closeSearch();
    navigate(resolveEntryRoute(entry));
  };

  const runSearch = () => {
    if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      goToEntry(suggestions[activeSuggestion]);
      return;
    }
    const q = navSearchQuery.trim();
    if (!q) return;
    closeSearch();
    navigate(`/explore?q=${encodeURIComponent(q)}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  };

  const renderSuggestions = () => {
    if (suggestions.length > 0) {
      return (
        <ul className="mt-2 max-h-72 overflow-y-auto flex flex-col gap-0.5">
          {suggestions.map((s, i) => (
            <li key={`${s.kind}-${s.label}`}>
              <button
                type="button"
                onMouseEnter={() => setActiveSuggestion(i)}
                onClick={() => goToEntry(s)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 cursor-pointer',
                  i === activeSuggestion ? 'bg-[#A78A9F]/25' : 'hover:bg-[#A78A9F]/15'
                )}
              >
                <Search size={14} className="shrink-0 text-[#A78A9F]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[#381932] dark:text-[#FFF3E6]">
                    {s.label}
                  </span>
                  <span className="block truncate text-[11px] text-[#381932]/55 dark:text-[#FFF3E6]/55">
                    {s.kind === 'subcategory'
                      ? `in ${s.category}`
                      : s.kind === 'category'
                        ? 'Service category'
                        : 'Package'}
                  </span>
                </span>
                <ArrowRight size={12} className="shrink-0 text-[#381932]/40 dark:text-[#FFF3E6]/40" />
              </button>
            </li>
          ))}
        </ul>
      );
    }
    if (navSearchQuery.trim().length >= 2) {
      return (
        <div className="mt-2 px-2.5 py-3 text-xs leading-relaxed text-[#381932]/60 dark:text-[#FFF3E6]/60">
          No celebrations found for “{navSearchQuery.trim()}”.
          <br />
          Press Enter to search anyway.
        </div>
      );
    }
    return null;
  };

  /**
   * Unified Anchor Navigation Handler
   * - If on HomePage: Smooth scroll directly to DOM element below sticky navbar
   * - If on Subpage: Navigate to `/#${targetId}` to trigger homepage offset scroll
   */
  const handleNavAnchor = (targetId: string) => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);

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
    setMobileServicesOpen(false);
    setExpandedService(null);
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
        ? onDarkNav
          ? 'text-[#FFF3E6]'
          : 'text-[#381932]'
        : onDarkNav
          ? 'text-[#FFF3E6]/85 hover:text-[#FFF3E6]'
          : 'text-[#381932] hover:text-[#381932]'
    );

  const navUnderline = (active: boolean) => (
    <span
      className={cn(
        'pointer-events-none absolute left-0 -bottom-[1px] h-[1.5px] w-full origin-left scale-x-0 transition-transform duration-200',
        onDarkNav ? 'bg-[#FFF3E6]' : 'bg-[#381932]',
        active && 'scale-x-100'
      )}
    />
  );

  const iconButtonClass = cn(
    'relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer',
    onDarkNav ? 'text-[#FFF3E6] hover:bg-[#FFF3E6]/10' : 'text-[#381932] hover:bg-[#A78A9F]/18'
  );

  return (
    <header
      ref={headerPillRef}
      className={cn(
        'z-50 w-full transition-colors duration-300',
        transparentOverHero ? 'fixed top-0 left-0' : 'sticky top-0',
        navGlassy
          ? 'bg-transparent'
          : isDark
            ? 'bg-[#381932]'
            : 'bg-[#FFF3E6]',
        transparentOverHero && !navGlassy && 'border-b border-[#381932]/12 dark:border-[#FFF3E6]/12'
      )}
    >
      {/* ================================================================= */}
      {/* THIN UTILITY STRIP -- hidden entirely when the nav floats over    */}
      {/* the hero; otherwise collapses once the page is scrolled.          */}
      {/* ================================================================= */}
      <div
        className={cn(
          'w-full overflow-hidden bg-[#381932] text-[#FFF3E6] transition-all duration-300 ease-out',
          transparentOverHero || scrollY > 40 ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
        )}
      >
        <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-12 py-1.5 text-[11px] sm:text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 truncate tracking-[0.08em]">
            <Sparkles size={12} className="text-[#A78A9F] shrink-0" />
            Start Your Celebration with The Decor Party ✦
          </span>
          <span className="flex-1 sm:flex-none text-center inline-flex items-center justify-center gap-1.5 truncate">
            <Sparkles size={12} className="text-[#A78A9F] shrink-0" />
            Make Every Celebration Magical
          </span>
          <span className="hidden sm:inline-flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => navigate('/bookings')} className="inline-flex items-center gap-1.5 hover:text-[#381932] transition-colors cursor-pointer">
              <MapPinned size={12} />
              Track Order
            </button>
            <span className="text-[#FFF3E6]/30">|</span>
            <button type="button" onClick={() => navigate('/contact')} className="inline-flex items-center gap-1.5 hover:text-[#381932] transition-colors cursor-pointer">
              <LifeBuoy size={12} />
              Help &amp; Support
            </button>
          </span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* UNIFIED NAVBAR -- logo + nav + search + actions                    */}
      {/* True edge-to-edge full width on the landing page, no side margin; */}
      {/* a narrower floating rounded card everywhere else.                 */}
      {/* ================================================================= */}
      <div className={isHome ? 'w-full' : 'mx-auto max-w-[1720px] px-3 sm:px-5 lg:px-8 py-2 sm:py-3'}>
        <div
          className={cn(
            'flex flex-col transition-colors duration-300',
            !navGlassy && 'backdrop-blur-md',
            navGlassy
              ? 'w-full bg-transparent'
              : isHome
                ? cn(
                    'w-full border-b',
                    isDark ? 'bg-[#381932]/90 border-[#381932]' : 'bg-[#FFF3E6]/90 border-[#381932]/30'
                  )
                : cn(
                    'rounded-[18px] sm:rounded-[20px] border',
                    isDark
                      ? 'bg-[#381932]/90 border-[#381932] shadow-[0_4px_20px_-4px_rgba(56,25,50,0.4)]'
                      : 'bg-[#FFF3E6]/90 border-[#381932]/30 shadow-[0_2px_16px_rgba(56,25,50,0.06)]'
                  )
          )}
        >
          {/* Top Bar Row (Logo, Mobile Services, Desktop Nav Links, Actions) */}
          <div
            className={cn(
              'flex items-center gap-2 sm:gap-3 lg:gap-5 h-[64px] sm:h-[72px] lg:h-[80px] w-full transition-colors duration-300',
              navGlassy
                ? 'px-4 sm:px-6 lg:px-12'
                : isHome
                  ? 'px-4 sm:px-6 lg:px-12'
                  : 'px-3 sm:px-5 lg:px-6'
            )}
          >
            {/* Brand Logo */}
            <button
              type="button"
              onClick={onLogoClick || (() => handleNavAnchor('top'))}
              className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer focus:outline-none group shrink-0"
              aria-label="The Decor Party Home"
            >
              <img
                src="/decor-party-logo.jpeg"
                alt="The Decor Party Logo"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shadow-xs ring-1 ring-[#381932]/15 dark:ring-[#FFF3E6]/25 transition-transform duration-200 group-hover:scale-105 shrink-0 bg-white"
              />
              <div className="flex flex-col items-start leading-none">
                <span
                  className={cn(
                    'font-serif text-[9px] sm:text-[10px] font-bold tracking-[0.22em] transition-colors duration-300',
                    onDarkNav ? 'text-[#FFF3E6]/80' : 'text-[#381932]'
                  )}
                >
                  The
                </span>
                <div className="flex items-baseline gap-1 -mt-0.5">
                  <span className="font-serif text-base sm:text-lg font-bold tracking-[0.02em] inline-flex">
                    <span style={{ color: onDarkNav ? '#F43F5E' : '#E50D67' }}>D</span>
                    <span style={{ color: onDarkNav ? '#FB923C' : '#EA580C' }}>e</span>
                    <span style={{ color: onDarkNav ? '#38BDF8' : '#0284C7' }}>c</span>
                    <span style={{ color: onDarkNav ? '#A78BFA' : '#7C3AED' }}>o</span>
                    <span style={{ color: onDarkNav ? '#60A5FA' : '#1D4ED8' }}>r</span>
                  </span>
                  <span
                    className={cn(
                      "font-heading italic text-[1.1rem] sm:text-[1.2rem] font-medium tracking-normal transition-colors duration-300",
                      onDarkNav ? 'text-[#A78A9F]' : 'text-[#381932]'
                    )}
                  >
                    Party
                  </span>
                </div>
              </div>
            </button>

            {/* Services button beside logo -- ONLY for mobile view (xl:hidden) */}
            <button
              type="button"
              onClick={() => setMobileServicesOpen(true)}
              className={cn(
                'xl:hidden flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-xs shrink-0',
                onDarkNav
                  ? 'bg-[#FFF3E6]/15 text-[#FFF3E6] border border-[#FFF3E6]/30 hover:bg-[#FFF3E6]/25 active:scale-95'
                  : isDark
                    ? 'bg-[#FFF3E6]/10 text-[#FFF3E6] border border-[#FFF3E6]/20 hover:bg-[#FFF3E6]/20 active:scale-95'
                    : 'bg-[#381932]/5 text-[#381932] border border-[#381932]/20 hover:bg-[#381932]/10 active:scale-95'
              )}
              aria-label="Open Celebration Services"
            >
              <span>Services</span>
              <ChevronDown size={11} className="opacity-70 shrink-0" />
            </button>

          {/* Desktop Nav Links (own row, single unified bar) */}
          <div className="hidden xl:block flex-1 min-w-0">
            <NavigationMenu className={cn(onDarkNav ? 'text-[#FFF3E6]' : 'text-[#381932]')}>
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
                        ? onDarkNav ? 'text-[#FFF3E6]' : 'text-[#381932]'
                        : onDarkNav
                          ? 'text-[#FFF3E6]/85 hover:text-[#FFF3E6] data-[state=open]:text-[#FFF3E6]'
                          : 'text-[#381932] hover:text-[#381932] data-[state=open]:text-[#381932]'
                    )}
                  >
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-0">
                    <div className="w-[900px] max-w-[96vw] rounded-3xl border border-[#381932]/30 dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] p-6 shadow-2xl">
                      <div className="flex flex-col gap-5">
                        {SERVICE_COLUMNS.map((column) => (
                          <div key={column.key} className="text-left">
                            <button
                              type="button"
                              onClick={() =>
                                column.key === 'curated-decors'
                                  ? handleNavAnchor('curated-decors')
                                  : handleNavCategory(column.title)
                              }
                              className="flex items-center gap-2 pb-2.5 border-b border-[#381932]/60 dark:border-[#381932]/60 mb-3 w-full text-left hover:opacity-80 transition-opacity cursor-pointer group"
                            >
                              <column.icon size={16} className="text-[#381932]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-[#381932] dark:text-[#FFF3E6]">
                                {column.title}
                              </span>
                              <ArrowUpRight size={12} className="text-[#381932] ml-auto group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                            <div className="grid grid-cols-4 gap-1.5">
                              {column.items.map((item) => {
                                const thumb = getServiceThumb(item.label);
                                const hasSubs = Boolean(item.subServices && item.subServices.length > 0);
                                const isExpanded = expandedService === item.label;
                                return (
                                <div key={item.label} className="flex flex-col gap-1">
                                  <NavigationMenuLink
                                    href={`/category/${encodeURIComponent(item.label)}`}
                                    onClick={(e: React.MouseEvent) => {
                                      e.preventDefault();
                                      if (hasSubs) {
                                        setExpandedService(isExpanded ? null : item.label);
                                      } else {
                                        handleNavCategory(item.label);
                                      }
                                    }}
                                    className="group flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-[#381932] hover:bg-[#A78A9F]/22 dark:text-[#FFF3E6] dark:hover:bg-[#381932] transition-colors duration-200 cursor-pointer"
                                  >
                                    {thumb ? (
                                      <img
                                        src={thumb}
                                        alt=""
                                        loading="lazy"
                                        className="h-8 w-8 shrink-0 rounded-md object-cover ring-1 ring-[#FFF3E6] dark:ring-[#381932]"
                                      />
                                    ) : item.icon ? (
                                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FFF3E6] text-[#381932] group-hover:bg-[#FFF3E6] group-hover:text-[#381932] transition-colors duration-200 dark:bg-[#381932] dark:text-[#381932]">
                                        <item.icon size={16} strokeWidth={1.75} />
                                      </span>
                                    ) : null}
                                    <span className="truncate leading-tight group-hover:text-[#381932] dark:group-hover:text-[#381932] transition-colors duration-200">
                                      {item.label}
                                    </span>
                                    {hasSubs && (
                                      <ChevronDown
                                        size={12}
                                        className={cn('ml-auto shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
                                      />
                                    )}
                                  </NavigationMenuLink>
                                  {hasSubs && isExpanded && (
                                    <div className="flex flex-wrap gap-1 pl-2">
                                      <NavigationMenuLink
                                        href={`/category/${encodeURIComponent(item.label)}`}
                                        onClick={(e: React.MouseEvent) => {
                                          e.preventDefault();
                                          handleNavCategory(item.label);
                                        }}
                                        className="rounded-full bg-[#381932]/10 px-2 py-0.5 text-[10px] font-bold text-[#381932] hover:bg-[#381932]/20 dark:bg-[#FFF3E6]/15 dark:text-[#FFF3E6] dark:hover:bg-[#FFF3E6]/25 transition-colors cursor-pointer"
                                      >
                                        All {item.label}
                                      </NavigationMenuLink>
                                      {item.subServices!.map((sub) => (
                                        <NavigationMenuLink
                                          key={sub}
                                          href={`/category/${encodeURIComponent(item.label)}/${encodeURIComponent(sub)}`}
                                          onClick={(e: React.MouseEvent) => {
                                            e.preventDefault();
                                            handleNavCategory(item.label, sub);
                                          }}
                                          className="rounded-full bg-[#A78A9F]/12 px-2 py-0.5 text-[10px] font-medium text-[#381932]/70 hover:bg-[#A78A9F]/25 hover:text-[#381932] dark:text-[#FFF3E6]/60 dark:hover:bg-[#381932] dark:hover:text-[#FFF3E6] transition-colors cursor-pointer"
                                        >
                                          {sub}
                                        </NavigationMenuLink>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Express Callout Strip */}
                      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-[#381932] px-5 py-3.5 text-[#FFF3E6] shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Gift size={16} className="text-[#381932] shrink-0" />
                          <p className="text-xs font-semibold leading-snug truncate">
                            <span className="text-[#381932] font-bold uppercase tracking-wider mr-1.5">Express Delivery</span>
                            Same-day Bengaluru surprises — instant slots for tonight.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/explore')}
                          className="shrink-0 flex items-center justify-center gap-1 rounded-lg bg-[#FFF3E6] px-4 py-2 text-xs font-medium text-[#381932] shadow-sm hover:opacity-90 transition-colors cursor-pointer"
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
            {/* Desktop Inline Search Bar (integrated in the same line as the navbar) */}
            <div ref={searchRef} className="relative hidden xl:block">
              <form
                onSubmit={submitSearch}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 h-9 sm:h-10 transition-all duration-300',
                  searchOpen || navSearchQuery
                    ? 'w-[250px] 2xl:w-[300px]'
                    : 'w-[180px] 2xl:w-[220px]',
                  onDarkNav
                    ? 'bg-[#FFF3E6]/10 border-[#FFF3E6]/30 text-[#FFF3E6] focus-within:bg-[#FFF3E6]/15 focus-within:border-[#FFF3E6]/60'
                    : isDark
                      ? 'bg-[#381932]/50 border-[#381932] text-[#FFF3E6] focus-within:border-[#A78A9F]'
                      : 'bg-[#FFF3E6] border-[#381932]/25 text-[#381932] focus-within:border-[#381932]/60 shadow-xs'
                )}
              >
                <Search
                  size={15}
                  className={cn(
                    'shrink-0 transition-colors',
                    onDarkNav ? 'text-[#FFF3E6]/75' : 'text-[#381932]/70'
                  )}
                />
                <div className="relative min-w-0 flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={navSearchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                      setNavSearchQuery(e.target.value);
                      if (!searchOpen) setSearchOpen(true);
                    }}
                    onKeyDown={onSearchKeyDown}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={suggestions.length > 0}
                    aria-controls="nav-search-suggestions"
                    className={cn(
                      'w-full bg-transparent text-xs font-medium border-none outline-none pr-1',
                      onDarkNav ? 'text-[#FFF3E6]' : isDark ? 'text-[#FFF3E6]' : 'text-[#381932]'
                    )}
                  />
                  {!navSearchQuery && (
                    <div
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute inset-0 flex items-center overflow-hidden text-xs font-medium',
                        onDarkNav ? 'text-[#FFF3E6]/60' : 'text-[#381932]/60'
                      )}
                    >
                      <span className="truncate">{navSearchTypewriter}</span>
                      <span className={cn('ml-0.5 inline-block h-[1em] w-px shrink-0 animate-pulse', onDarkNav ? 'bg-[#FFF3E6]/60' : 'bg-[#381932]/60')} />
                    </div>
                  )}
                </div>

                {navSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-0.5 rounded-full hover:opacity-75 transition-opacity cursor-pointer shrink-0"
                    aria-label="Clear search"
                  >
                    <X size={12} className={onDarkNav ? 'text-[#FFF3E6]/80' : 'text-[#381932]/70'} />
                  </button>
                )}

                <button
                  type="submit"
                  aria-label="Submit search"
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer',
                    onDarkNav
                      ? 'bg-[#FFF3E6] text-[#381932] hover:bg-white'
                      : 'bg-[#381932] text-[#FFF3E6] hover:bg-[#2a121f]'
                  )}
                >
                  <Search size={11} strokeWidth={2.2} />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {searchOpen && (suggestions.length > 0 || navSearchQuery.trim().length >= 2) && (
                <div
                  id="nav-search-suggestions"
                  className={cn(
                    'absolute left-0 right-0 top-[calc(100%+8px)] min-w-[280px] rounded-2xl border p-2 shadow-xl animate-scale-in z-50',
                    onDarkNav
                      ? 'bg-[#381932] border-[#FFF3E6]/25 text-[#FFF3E6]'
                      : isDark
                        ? 'bg-[#381932] border-[#381932] text-[#FFF3E6]'
                        : 'bg-[#FFF3E6] border-[#381932]/25 text-[#381932]'
                  )}
                >
                  {renderSuggestions()}
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
                <span className={cn('absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold', onDarkNav ? 'bg-[#A78A9F] text-[#381932]' : 'bg-[#381932] text-[#FFF3E6]')}>
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
                <span className={cn('absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold', onDarkNav ? 'bg-[#A78A9F] text-[#381932]' : 'bg-[#381932] text-[#FFF3E6]')}>
                  {cartCount}
                </span>
              )}
            </button>


            {/* User / Auth (hidden on mobile -- lives inside the drawer there) */}
            <div ref={accountRef} className="relative hidden sm:block">
              {auth.isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border py-1.5 px-2.5 transition-colors duration-200 cursor-pointer',
                    onDarkNav
                      ? 'border-[#FFF3E6]/30 bg-[#FFF3E6]/5 hover:bg-[#FFF3E6]/12 text-[#FFF3E6]'
                      : 'border-[#381932]/30 bg-[#FFF3E6] hover:bg-[#A78A9F]/15 text-[#381932]'
                  )}
                >
                  <Avatar user={auth.user} className="h-5 w-5" />
                  <span className="hidden xl:inline text-xs font-semibold max-w-[80px] truncate">
                    {auth.user?.firstName || auth.user?.name || 'Account'}
                  </span>
                  <ChevronDown size={11} className={onDarkNav ? 'text-[#FFF3E6]/80' : 'text-[#381932]'} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => auth.open('login')}
                  aria-label="Login"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border transition-colors duration-200 cursor-pointer',
                    'h-9 w-9 sm:h-10 sm:w-10 justify-center px-0 xl:h-auto xl:w-auto xl:justify-start xl:px-3 xl:py-2 text-xs font-medium',
                    onDarkNav
                      ? 'text-[#FFF3E6] bg-[#FFF3E6]/5 hover:bg-[#FFF3E6]/12 border-[#FFF3E6]/30'
                      : 'text-[#381932] bg-[#FFF3E6] hover:bg-[#A78A9F]/15 border-[#381932]/30'
                  )}
                >
                  <UserIcon size={16} strokeWidth={1.75} />
                  <span className="hidden xl:inline">Login</span>
                </button>
              )}

              {/* Account Dropdown */}
              {accountOpen && auth.isLoggedIn && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#381932]/80 bg-[#FFF3E6] p-1.5 shadow-md dark:bg-[#381932] dark:border-[#381932] animate-scale-in z-50">
                  <div className="px-3 py-2 border-b border-[#381932]/30 dark:border-[#381932]">
                    <p className="text-xs font-bold text-[#381932] dark:text-[#FFF3E6] truncate">
                      {auth.user?.firstName} {auth.user?.lastName}
                    </p>
                    <p className="text-[11px] text-[#381932] dark:text-[#381932] truncate">
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
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#381932] hover:bg-[#FFF3E6] dark:text-[#FFF3E6] dark:hover:bg-[#381932] text-left cursor-pointer"
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
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#381932] hover:bg-[#FFF3E6] dark:text-[#FFF3E6] dark:hover:bg-[#381932] text-left cursor-pointer"
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
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#381932] hover:bg-[#FFF3E6] dark:text-[#FFF3E6] dark:hover:bg-[#381932]/40 text-left cursor-pointer"
                      >
                        <Layers size={14} />
                        <span>Admin Portal</span>
                      </button>
                    )}
                  </div>
                  <div className="border-t border-[#381932]/30 dark:border-[#381932] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        auth.logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932]/40 text-left cursor-pointer"
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
              className={cn(
                'hidden md:inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium tracking-wide shadow-sm transition-colors duration-200 cursor-pointer',
                navGlassy
                  ? 'bg-[#381932] text-[#FFF3E6] border-[#381932] hover:bg-[#2a121f]'
                  : 'bg-[#FFF3E6] text-[#381932] border-[#381932]/30 hover:bg-[#A78A9F]/15'
              )}
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
                <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-[#FFF3E6] dark:bg-[#381932] p-6 overflow-y-auto">
                  <div className="flex flex-col gap-5 pt-4">

                    {/* Brand header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#381932]/30 dark:border-[#381932]">
                      <span className="font-serif text-sm font-bold tracking-wider text-[#381932] dark:text-[#FFF3E6] uppercase">
                        The Decor Party
                      </span>
                    </div>

                    {/* Mobile Quick Search */}
                    <div>
                      <form
                        onSubmit={submitSearch}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3.5 py-2 border transition-all duration-300',
                          isDark
                            ? 'border-[#381932]/20 bg-[#381932]/40 text-[#FFF3E6]'
                            : 'border-[#381932]/30 bg-[#FFF3E6] text-[#381932]'
                        )}
                      >
                        <Search size={14} className="text-[#381932] shrink-0" />
                        <div className="relative min-w-0 flex-1">
                          <input
                            type="text"
                            value={navSearchQuery}
                            onChange={(e) => setNavSearchQuery(e.target.value)}
                            onKeyDown={onSearchKeyDown}
                            autoComplete="off"
                            className="w-full bg-transparent text-xs font-medium border-none outline-none text-[#381932] dark:text-[#FFF3E6]"
                          />
                          {!navSearchQuery && (
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-xs font-medium text-[#381932]/60 dark:text-[#FFF3E6]/60"
                            >
                              <span className="truncate">{navSearchTypewriter}</span>
                              <span className="ml-0.5 inline-block h-[1em] w-px shrink-0 animate-pulse bg-current" />
                            </div>
                          )}
                        </div>
                      </form>
                      {renderSuggestions()}
                    </div>

                    <div className="flex flex-col gap-1 text-sm font-semibold text-[#381932] dark:text-[#FFF3E6]">

                      {/* Home */}
                      <button
                        type="button"
                        onClick={() => handleNavAnchor('top')}
                        className="text-left py-2 px-1 hover:text-[#381932] transition-colors border-b border-[#381932]/50 dark:border-[#381932]/50"
                      >
                        Home
                      </button>

                      {/* Services Accordion */}
                      <Accordion type="single" collapsible className="w-full border-b border-[#381932]/50 dark:border-[#381932]/50">
                        <AccordionItem value="mobile-services" className="border-none">
                          <AccordionTrigger className="py-2 px-1 text-sm font-semibold text-[#381932] dark:text-[#FFF3E6] hover:no-underline">
                            Services
                          </AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-3 pl-3 pt-1 pb-3 text-xs text-[#381932] dark:text-[#381932]">
                            {SERVICE_COLUMNS.map((column) => (
                              <div key={column.key} className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    column.key === 'curated-decors'
                                      ? handleNavAnchor('curated-decors')
                                      : handleNavCategory(column.title)
                                  }
                                  className="flex items-center gap-1.5 text-left py-1 font-bold uppercase tracking-wider text-[10px] text-[#381932] dark:text-[#FFF3E6]"
                                >
                                  <column.icon size={12} className="text-[#381932]" />
                                  {column.title}
                                </button>
                                {column.items.map((item) => {
                                  const thumb = getServiceThumb(item.label);
                                  const hasSubs = Boolean(item.subServices && item.subServices.length > 0);
                                  const isExpanded = expandedService === item.label;
                                  return (
                                  <div key={item.label} className="flex flex-col gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() => hasSubs ? setExpandedService(isExpanded ? null : item.label) : handleNavCategory(item.label)}
                                      className="group flex items-center gap-2 text-left py-1 pl-2 hover:text-[#381932] dark:hover:text-[#FFF3E6] transition-colors duration-200"
                                    >
                                      {thumb ? (
                                        <img
                                          src={thumb}
                                          alt=""
                                          loading="lazy"
                                          className="h-6 w-6 shrink-0 rounded-md object-cover ring-1 ring-[#FFF3E6] dark:ring-[#381932]"
                                        />
                                      ) : item.icon ? (
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#FFF3E6] text-[#381932] dark:bg-[#381932] dark:text-[#381932]">
                                          <item.icon size={12} strokeWidth={1.75} />
                                        </span>
                                      ) : null}
                                      <span>{item.label}</span>
                                      {hasSubs && (
                                        <ChevronDown size={11} className={cn('shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')} />
                                      )}
                                    </button>
                                    {hasSubs && isExpanded && (
                                      <div className="flex flex-wrap gap-1 pl-9">
                                        <button
                                          type="button"
                                          onClick={() => handleNavCategory(item.label)}
                                          className="rounded-full bg-[#381932]/10 px-2 py-0.5 text-[10px] font-bold text-[#381932] dark:bg-[#FFF3E6]/15 dark:text-[#FFF3E6] hover:bg-[#381932]/20 dark:hover:bg-[#FFF3E6]/25 transition-colors"
                                        >
                                          All {item.label}
                                        </button>
                                        {item.subServices!.map((sub) => (
                                          <button
                                            key={sub}
                                            type="button"
                                            onClick={() => handleNavCategory(item.label, sub)}
                                            className="rounded-full bg-[#A78A9F]/12 px-2 py-0.5 text-[10px] font-medium text-[#381932]/70 dark:text-[#FFF3E6]/60 hover:bg-[#A78A9F]/25 hover:text-[#381932] dark:hover:text-[#FFF3E6] transition-colors"
                                          >
                                            {sub}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  );
                                })}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleNavAnchor('express')}
                              className="text-left py-1 font-bold uppercase tracking-wider text-[10px] text-[#381932] dark:text-[#FFF3E6]"
                            >
                              Express Delivery
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
                          "text-left py-2 px-1 hover:text-[#381932] transition-colors border-b border-[#381932]/50 dark:border-[#381932]/50",
                          location.pathname === '/packages' && "text-[#381932] font-bold"
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
                          "text-left py-2 px-1 hover:text-[#381932] transition-colors border-b border-[#381932]/50 dark:border-[#381932]/50",
                          location.pathname === '/gallery' && "text-[#381932] font-bold"
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
                          "text-left py-2 px-1 hover:text-[#381932] transition-colors border-b border-[#381932]/50 dark:border-[#381932]/50",
                          location.pathname === '/contact' && "text-[#381932] font-bold"
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
                          "text-left py-2 px-1 hover:text-[#381932] transition-colors border-b border-[#381932]/50 dark:border-[#381932]/50",
                          location.pathname === '/about' && "text-[#381932] font-bold"
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
                          className="flex items-center gap-2 text-left py-2 px-1 hover:text-[#381932] transition-colors border-b border-[#381932]/50 dark:border-[#381932]/50"
                        >
                          <LogIn size={14} className="text-[#381932]" />
                          <span>Login</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/profile');
                          }}
                          className="flex items-center gap-2 text-left py-2 px-1 hover:text-[#381932] transition-colors border-b border-[#381932]/50 dark:border-[#381932]/50"
                        >
                          <UserIcon size={14} className="text-[#381932]" />
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
                        className="flex items-center gap-2 text-left py-2 px-1 hover:text-[#381932] transition-colors border-b border-[#381932]/50 dark:border-[#381932]/50"
                      >
                        <Sparkles size={14} className="text-[#A78A9F]" />
                        <span>AI Celebration Planner</span>
                      </button>
                    </div>

                    {/* Action CTA */}
                    <div className="flex flex-col gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/explore');
                        }}
                        className="w-full rounded-lg bg-[#381932] dark:bg-[#381932] dark:text-[#381932] text-[#FFF3E6] py-3 text-xs sm:text-sm font-medium tracking-wide text-center cursor-pointer"
                      >
                        Book Now
                      </button>

                      <a
                        href="https://wa.me/917022058460"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-lg border border-[#381932]/30 dark:border-[#381932] py-2.5 text-xs sm:text-sm font-medium tracking-wide text-[#381932] dark:text-[#FFF3E6] text-center"
                      >
                        <Phone size={13} className="text-[#381932]" />
                        <span>WhatsApp Quick Assistance</span>
                      </a>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* ============================================================= */}
              {/* MOBILE SERVICES DRAWER -- Triggered by "Services" beside logo */}
              {/* ============================================================= */}
              <Sheet open={mobileServicesOpen} onOpenChange={setMobileServicesOpen}>
                <SheetContent
                  side="bottom"
                  className="max-h-[88vh] rounded-t-[28px] bg-[#FFF3E6] dark:bg-[#381932] p-5 pb-8 overflow-y-auto border-t border-[#381932]/20 dark:border-[#FFF3E6]/20 shadow-2xl"
                >
                  {/* Top handle bar */}
                  <div className="mx-auto w-12 h-1.5 rounded-full bg-[#381932]/20 dark:bg-[#FFF3E6]/20 mb-4" />

                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#381932]/20 dark:border-[#FFF3E6]/20">
                      <div>
                        <span className="font-serif text-[10px] font-bold tracking-[0.2em] uppercase text-[#A78A9F] dark:text-[#A78A9F] block">
                          The Decor Party
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#381932] dark:text-[#FFF3E6] tracking-tight">
                          Celebration Services
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileServicesOpen(false);
                          navigate('/explore');
                        }}
                        className="flex items-center gap-1 rounded-full bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932] px-3 py-1.5 text-xs font-medium shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span>All Services</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* Quick action buttons if on homepage */}
                    {isHome && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileServicesOpen(false);
                            handleNavAnchor('curated-decors');
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#381932]/20 dark:border-[#FFF3E6]/20 bg-[#381932]/5 dark:bg-[#FFF3E6]/10 py-2 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] transition-colors cursor-pointer"
                        >
                          <PartyPopper size={14} className="text-[#381932] dark:text-[#FFF3E6]" />
                          <span>Curated Décors</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileServicesOpen(false);
                            navigate('/packages');
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#381932]/20 dark:border-[#FFF3E6]/20 bg-[#381932]/5 dark:bg-[#FFF3E6]/10 py-2 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] transition-colors cursor-pointer"
                        >
                          <Gift size={14} className="text-[#381932] dark:text-[#FFF3E6]" />
                          <span>View Packages</span>
                        </button>
                      </div>
                    )}

                    {/* Service Columns list */}
                    <div className="flex flex-col gap-4">
                      {SERVICE_COLUMNS.map((column) => (
                        <div key={column.key} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 font-serif text-xs font-bold uppercase tracking-wider text-[#381932] dark:text-[#FFF3E6]">
                              <column.icon size={15} className="text-[#381932] dark:text-[#FFF3E6]" />
                              {column.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setMobileServicesOpen(false);
                                if (column.key === 'curated-decors') {
                                  handleNavAnchor('curated-decors');
                                } else {
                                  handleNavCategory(column.title);
                                }
                              }}
                              className="text-[11px] font-medium text-[#A78A9F] hover:text-[#381932] dark:hover:text-[#FFF3E6] transition-colors cursor-pointer"
                            >
                              View Category →
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {column.items.map((item) => {
                              const thumb = getServiceThumb(item.label);
                              const hasSubs = Boolean(item.subServices && item.subServices.length > 0);
                              const isExpanded = expandedService === item.label;

                              return (
                                <div
                                  key={item.label}
                                  className="flex flex-col rounded-xl border border-[#381932]/12 dark:border-[#FFF3E6]/12 bg-white/60 dark:bg-black/20 p-2 transition-all hover:bg-white dark:hover:bg-black/40"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (hasSubs) {
                                        setExpandedService(isExpanded ? null : item.label);
                                      } else {
                                        setMobileServicesOpen(false);
                                        handleNavCategory(item.label);
                                      }
                                    }}
                                    className="flex items-center gap-2 w-full text-left cursor-pointer"
                                  >
                                    {thumb ? (
                                      <img
                                        src={thumb}
                                        alt=""
                                        loading="lazy"
                                        className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-[#381932]/15 dark:ring-[#FFF3E6]/15"
                                      />
                                    ) : item.icon ? (
                                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#381932]/10 text-[#381932] dark:bg-[#FFF3E6]/15 dark:text-[#FFF3E6]">
                                        <item.icon size={15} strokeWidth={1.75} />
                                      </span>
                                    ) : null}
                                    <div className="min-w-0 flex-1">
                                      <span className="block truncate text-xs font-semibold text-[#381932] dark:text-[#FFF3E6]">
                                        {item.label}
                                      </span>
                                      {hasSubs && (
                                        <span className="flex items-center gap-0.5 text-[10px] text-[#A78A9F]">
                                          <span>{item.subServices!.length} types</span>
                                          <ChevronDown
                                            size={10}
                                            className={cn('transition-transform duration-200', isExpanded && 'rotate-180')}
                                          />
                                        </span>
                                      )}
                                    </div>
                                  </button>

                                  {hasSubs && isExpanded && (
                                    <div className="mt-2 flex flex-wrap gap-1 border-t border-[#381932]/10 dark:border-[#FFF3E6]/10 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMobileServicesOpen(false);
                                          handleNavCategory(item.label);
                                        }}
                                        className="rounded-full bg-[#381932]/10 px-2 py-0.5 text-[10px] font-bold text-[#381932] dark:bg-[#FFF3E6]/15 dark:text-[#FFF3E6] cursor-pointer"
                                      >
                                        All {item.label}
                                      </button>
                                      {item.subServices!.map((sub) => (
                                        <button
                                          key={sub}
                                          type="button"
                                          onClick={() => {
                                            setMobileServicesOpen(false);
                                            handleNavCategory(item.label, sub);
                                          }}
                                          className="rounded-full bg-[#A78A9F]/15 px-2 py-0.5 text-[10px] font-medium text-[#381932]/80 dark:text-[#FFF3E6]/80 hover:bg-[#A78A9F]/25 cursor-pointer"
                                        >
                                          {sub}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

          {/* ============================================================= */}
          {/* MOBILE ALWAYS-OPEN SEARCH BAR -- ONLY FOR MOBILE (xl:hidden)  */}
          {/* ============================================================= */}
          <div
            ref={mobileSearchRef}
            className={cn(
              'xl:hidden w-full pb-3 pt-0.5',
              navGlassy ? 'px-4 sm:px-6' : isHome ? 'px-4 sm:px-6' : 'px-3 sm:px-5'
            )}
          >
            <div className="relative mx-auto max-w-[480px]">
              <form
                onSubmit={submitSearch}
                className={cn(
                  'flex items-center gap-2 rounded-2xl border px-3.5 py-1.5 shadow-md transition-all duration-300 focus-within:shadow-lg',
                  isDark
                    ? 'border-[#FFF3E6]/25 bg-[#381932] text-[#FFF3E6] focus-within:border-[#FFF3E6]/40'
                    : 'border-[#381932]/25 bg-[#FFF3E6] text-[#381932] focus-within:border-[#381932]/50'
                )}
              >
                <div className="relative min-w-0 flex-1">
                  <input
                    type="text"
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    onFocus={() => setMobileSearchFocused(true)}
                    onKeyDown={onSearchKeyDown}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={mobileSearchFocused && suggestions.length > 0}
                    aria-controls="mobile-nav-search-suggestions"
                    className={cn(
                      'w-full bg-transparent text-xs sm:text-sm font-medium border-none outline-none px-1 py-1',
                      isDark ? 'text-[#FFF3E6]' : 'text-[#381932]'
                    )}
                  />
                  {!navSearchQuery && (
                    <div
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute inset-0 flex items-center overflow-hidden px-1 text-xs sm:text-sm font-medium',
                        isDark ? 'text-[#FFF3E6]/60' : 'text-[#381932]/70'
                      )}
                    >
                      <span className="truncate">{navSearchTypewriter}</span>
                      <span className={cn('ml-0.5 inline-block h-[1em] w-px shrink-0 animate-pulse', isDark ? 'bg-[#FFF3E6]/60' : 'bg-[#381932]/60')} />
                    </div>
                  )}
                </div>

                {navSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavSearchQuery('');
                      setActiveSuggestion(-1);
                    }}
                    className="p-1 text-[#381932]/50 hover:text-[#381932] dark:text-[#FFF3E6]/50 dark:hover:text-[#FFF3E6] cursor-pointer"
                    aria-label="Clear search query"
                  >
                    <X size={14} />
                  </button>
                )}

                <button
                  type="submit"
                  aria-label="Submit search"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#381932] text-[#FFF3E6] hover:opacity-90 transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <Search size={14} />
                </button>
              </form>

              {/* Mobile search suggestions dropdown */}
              {mobileSearchFocused && (
                <div
                  id="mobile-nav-search-suggestions"
                  className={cn(
                    'absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border p-2 shadow-2xl animate-scale-in max-h-72 overflow-y-auto',
                    isDark ? 'bg-[#381932] border-[#381932]' : 'bg-[#FFF3E6] border-[#381932]/30'
                  )}
                >
                  {renderSuggestions()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
