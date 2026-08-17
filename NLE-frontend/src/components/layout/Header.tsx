import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Heart,
  LogIn,
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
  Gift,
  PartyPopper,
  Flame,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AdminCategory, AuthTab, AuthUser, Translations } from '../../types';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils/utils';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../hooks/useWishlist';
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

interface AuthSlice {
  isLoggedIn: boolean;
  user: AuthUser | null;
  isAdmin?: boolean;
  open: (tab?: AuthTab) => void;
  logout: () => void;
}

export interface HeaderProps {
  auth: AuthSlice;
  t?: Translations | Record<string, string>;
  onLogoClick?: () => void;
  showAssistantButton?: boolean;
  showMobileMenu?: boolean;
  onAssistantOpen?: () => void;
  categories?: AdminCategory[];
  onSelectCategory?: (catName: string, subName?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  auth,
  onLogoClick,
  categories = [],
  onSelectCategory,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [navTheme, setNavTheme] = useState<'dark' | 'light'>('dark');
  const accountRef = useRef<HTMLDivElement>(null);
  const headerPillRef = useRef<HTMLDivElement>(null);

  // Dynamic continuous detection of the background theme behind the floating navbar pill
  const updateNavTheme = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);

    if (document.documentElement.classList.contains('dark')) {
      setNavTheme('dark');
      return;
    }

    // Determine the vertical target line where the floating navbar pill sits
    const navY = headerPillRef.current
      ? headerPillRef.current.getBoundingClientRect().top + headerPillRef.current.offsetHeight / 2
      : 44;

    // 1. Check elements directly behind the navbar using elementsFromPoint
    let detectedTheme: 'dark' | 'light' | null = null;

    if (typeof document.elementsFromPoint === 'function') {
      const elementsAtPoint = document.elementsFromPoint(window.innerWidth / 2, navY);
      for (const el of elementsAtPoint) {
        if (el.closest('header')) continue; // Skip navbar itself
        const themedContainer = el.closest<HTMLElement>('[data-nav-theme]');
        if (themedContainer) {
          const theme = themedContainer.getAttribute('data-nav-theme');
          if (theme === 'dark' || theme === 'light') {
            detectedTheme = theme;
            break;
          }
        }
      }
    }

    // 2. Fallback: Search all elements with data-nav-theme via bounding rectangle
    if (!detectedTheme) {
      const themedElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-nav-theme]')
      );

      for (const el of themedElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= navY && rect.bottom > navY) {
          const theme = el.getAttribute('data-nav-theme');
          if (theme === 'dark' || theme === 'light') {
            detectedTheme = theme;
            break;
          }
        }
      }
    }

    if (detectedTheme) {
      setNavTheme(detectedTheme);
    } else {
      // Top of home page is dark hero image
      if (currentScrollY < 180 && (location.pathname === '/' || location.pathname === '')) {
        setNavTheme('dark');
      } else {
        setNavTheme('light');
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    let animFrame: number;

    const onScrollOrResize = () => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(updateNavTheme);
    };

    updateNavTheme();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    const observer = new MutationObserver(updateNavTheme);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      observer.disconnect();
    };
  }, [updateNavTheme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavCategory = (catName: string, subName?: string) => {
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

  const isOverDark = isDark || navTheme === 'dark';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none transition-all duration-300 py-3 sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6">
        {/* Floating Pill Container */}
        <div
          ref={headerPillRef}
          className={cn(
            'pointer-events-auto flex h-14 sm:h-16 w-full max-w-5xl items-center justify-between gap-2 rounded-full border px-3 sm:px-4 shadow-xl backdrop-blur-2xl',
            'transition-all duration-300 ease-out',
            isOverDark
              ? 'border-white/20 bg-[#34203C]/85 text-[#F8F5EF] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)]'
              : 'border-[#DDD5C7]/90 bg-[#FAF8F5]/92 text-[#34203C] shadow-[0_12px_40px_-8px_rgba(52,32,60,0.12)]'
          )}
          style={{
            transitionProperty: 'color, background-color, border-color, box-shadow',
            transitionDuration: '300ms',
            transitionTimingFunction: 'ease',
            boxShadow: scrollY > 20
              ? isOverDark
                ? '0 12px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15)'
                : '0 12px 40px -8px rgba(52,32,60,0.18), 0 0 0 1px rgba(201,190,171,0.4)'
              : undefined,
          }}
        >
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-2 pr-2 sm:pr-4 pl-1 sm:pl-2">
            <button
              type="button"
              onClick={onLogoClick || (() => navigate('/'))}
              className="flex items-center text-left cursor-pointer focus:outline-none group"
              aria-label="TheDecorParty Home"
            >
              <div className="flex flex-col items-start leading-none">
                <span
                  className={cn(
                    'font-serif text-[9px] sm:text-[10px] font-bold tracking-[0.28em] uppercase transition-colors duration-300',
                    isOverDark ? 'text-[#C9BEAB]' : 'text-[#725D75]'
                  )}
                >
                  THE
                </span>
                <div className="flex items-baseline gap-1 -mt-0.5">
                  <span
                    className={cn(
                      'font-serif text-base sm:text-lg font-bold tracking-[0.08em] uppercase transition-colors duration-300',
                      isOverDark ? 'text-[#F8F5EF]' : 'text-[#34203C]'
                    )}
                  >
                    DECOR
                  </span>
                  <span className="font-['Great_Vibes'] text-[#A78A9F] lowercase text-[1.25rem] sm:text-[1.35rem] font-normal tracking-normal transition-colors duration-300">
                    Party
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* 2. Desktop Navigation Menu */}
          <div className="hidden lg:block">
            <NavigationMenu className={cn(isOverDark ? 'text-[#F8F5EF]' : 'text-[#34203C]')}>
              <NavigationMenuList className="gap-1 xl:gap-1.5">
                {/* Home */}
                <NavigationMenuItem>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer',
                      location.pathname === '/' && !location.hash
                        ? isOverDark
                          ? 'bg-[#A78A9F] text-[#34203C] shadow-xs font-bold'
                          : 'bg-[#34203C] text-[#FAF8F5] shadow-xs font-bold'
                        : isOverDark
                          ? 'text-[#F8F5EF] hover:text-white hover:bg-white/15'
                          : 'text-[#34203C]/90 hover:text-[#34203C] hover:bg-[#34203C]/08'
                    )}
                  >
                    Home
                  </button>
                </NavigationMenuItem>

                {/* Occasions Mega Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      'bg-transparent px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer',
                      isOverDark
                        ? 'text-[#F8F5EF] hover:text-white hover:bg-white/15 data-[state=open]:bg-white/20'
                        : 'text-[#34203C]/90 hover:text-[#34203C] hover:bg-[#34203C]/08 data-[state=open]:bg-[#34203C]/10'
                    )}
                  >
                    Occasions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-0">
                    <div className="w-[920px] max-w-[94vw] rounded-3xl border border-[#DDD5C7] dark:border-[#483250] bg-[#FAF8F5] dark:bg-[#201325] p-6 shadow-2xl">
                      <div className="grid grid-cols-12 gap-6">
                        {/* Col 1: Categories (span 4) */}
                        <div className="col-span-4 border-r border-[#DDD5C7]/70 dark:border-[#483250]/70 pr-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-[#DDD5C7]/60 dark:border-[#483250]/60 mb-3">
                            <PartyPopper size={16} className="text-[#A78A9F]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#34203C] dark:text-[#FAF8F5]">
                              Curated Decors
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
                            {categories.slice(0, 6).map((cat) => (
                              <NavigationMenuLink
                                key={cat._id || cat.name}
                                href={`/category/${encodeURIComponent(cat.name)}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleNavCategory(cat.name);
                                }}
                                className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[#34203C] hover:bg-[#A78A9F]/15 dark:text-[#FAF8F5] dark:hover:bg-[#38223E] transition-colors"
                              >
                                <span>{cat.name}</span>
                                <ArrowUpRight size={13} className="text-[#725D75] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>

                        {/* Col 2: Experiences (span 3) */}
                        <div className="col-span-3 border-r border-[#DDD5C7]/70 dark:border-[#483250]/70 pr-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-[#DDD5C7]/60 dark:border-[#483250]/60 mb-3">
                            <Flame size={16} className="text-[#C9BEAB]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#34203C] dark:text-[#FAF8F5]">
                              Experiences
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <a
                              href="/#signature-collections"
                              onClick={(e) => {
                                if (location.pathname !== '/') {
                                  e.preventDefault();
                                  navigate('/#signature-collections');
                                }
                              }}
                              className="rounded-xl px-3 py-2 text-xs font-medium text-[#34203C] hover:bg-[#A78A9F]/15 dark:text-[#FAF8F5] dark:hover:bg-[#38223E] transition-colors"
                            >
                              Cabana Setups
                            </a>
                            <a
                              href="/#signature-collections"
                              onClick={(e) => {
                                if (location.pathname !== '/') {
                                  e.preventDefault();
                                  navigate('/#signature-collections');
                                }
                              }}
                              className="rounded-xl px-3 py-2 text-xs font-medium text-[#34203C] hover:bg-[#A78A9F]/15 dark:text-[#FAF8F5] dark:hover:bg-[#38223E] transition-colors"
                            >
                              Terrace Proposals
                            </a>
                            <a
                              href="/#detailed-services"
                              onClick={(e) => {
                                if (location.pathname !== '/') {
                                  e.preventDefault();
                                  navigate('/#detailed-services');
                                }
                              }}
                              className="rounded-xl px-3 py-2 text-xs font-medium text-[#34203C] hover:bg-[#A78A9F]/15 dark:text-[#FAF8F5] dark:hover:bg-[#38223E] transition-colors"
                            >
                              Car Boot Surprises
                            </a>
                            <a
                              href="/#detailed-services"
                              onClick={(e) => {
                                if (location.pathname !== '/') {
                                  e.preventDefault();
                                  navigate('/#detailed-services');
                                }
                              }}
                              className="rounded-xl px-3 py-2 text-xs font-medium text-[#34203C] hover:bg-[#A78A9F]/15 dark:text-[#FAF8F5] dark:hover:bg-[#38223E] transition-colors"
                            >
                              Kids Themes
                            </a>
                          </div>
                        </div>

                        {/* Col 3: Quick Links (span 2) */}
                        <div className="col-span-2 flex flex-col gap-1">
                          <div className="pb-3 border-b border-[#DDD5C7]/60 dark:border-[#483250]/60 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#725D75] dark:text-[#A78A9F]">
                              Services
                            </span>
                          </div>
                          <a
                            href="/#gallery"
                            onClick={(e) => {
                              if (location.pathname !== '/') {
                                e.preventDefault();
                                navigate('/#gallery');
                              }
                            }}
                            className="rounded-xl px-2 py-1.5 text-xs text-[#725D75] hover:text-[#34203C] dark:text-[#C9BEAB] dark:hover:text-white transition-colors"
                          >
                            Live Gallery
                          </a>
                          <a
                            href="/#why-us"
                            onClick={(e) => {
                              if (location.pathname !== '/') {
                                e.preventDefault();
                                navigate('/#why-us');
                              }
                            }}
                            className="rounded-xl px-2 py-1.5 text-xs text-[#725D75] hover:text-[#34203C] dark:text-[#C9BEAB] dark:hover:text-white transition-colors"
                          >
                            Why Choose Us
                          </a>
                          <a
                            href="/#faq"
                            onClick={(e) => {
                              if (location.pathname !== '/') {
                                e.preventDefault();
                                navigate('/#faq');
                              }
                            }}
                            className="rounded-xl px-2 py-1.5 text-xs text-[#725D75] hover:text-[#34203C] dark:text-[#C9BEAB] dark:hover:text-white transition-colors"
                          >
                            Signal FAQ
                          </a>
                        </div>

                        {/* Col 4: Spotlight Banner Card (span 3) */}
                        <div className="col-span-3">
                          <div className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-[#34203C] to-[#483250] p-4 text-[#FAF8F5] shadow-lg">
                            <div>
                              <div className="flex items-center gap-1.5 text-[#C9BEAB] text-xs font-bold uppercase tracking-wider mb-2">
                                <Gift size={14} />
                                <span>Express 3hr</span>
                              </div>
                              <p className="font-serif text-sm font-semibold text-white leading-snug">
                                Same-Day Bengaluru Surprises
                              </p>
                              <p className="text-[11px] text-[#C9BEAB] mt-1 line-clamp-2">
                                Instant slots available for tonight across all areas.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate('/explore')}
                              className="mt-4 flex items-center justify-center gap-1 rounded-full bg-[#FAF8F5] py-2 text-xs font-bold text-[#34203C] shadow hover:bg-[#C9BEAB] transition-colors"
                            >
                              <span>Explore All</span>
                              <ArrowUpRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Collections */}
                <NavigationMenuItem>
                  <a
                    href="/#signature-collections"
                    onClick={(e) => {
                      if (location.pathname !== '/') {
                        e.preventDefault();
                        navigate('/#signature-collections');
                      }
                    }}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer',
                      isOverDark
                        ? 'text-[#F8F5EF] hover:text-white hover:bg-white/15'
                        : 'text-[#34203C]/90 hover:text-[#34203C] hover:bg-[#34203C]/08'
                    )}
                  >
                    Collections
                  </a>
                </NavigationMenuItem>

                {/* Packages */}
                <NavigationMenuItem>
                  <a
                    href="/#detailed-services"
                    onClick={(e) => {
                      if (location.pathname !== '/') {
                        e.preventDefault();
                        navigate('/#detailed-services');
                      }
                    }}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer',
                      isOverDark
                        ? 'text-[#F8F5EF] hover:text-white hover:bg-white/15'
                        : 'text-[#34203C]/90 hover:text-[#34203C] hover:bg-[#34203C]/08'
                    )}
                  >
                    Packages
                  </a>
                </NavigationMenuItem>

                {/* AI Planner */}
                <NavigationMenuItem>
                  <button
                    type="button"
                    onClick={() => navigate('/ai-planner')}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300 cursor-pointer',
                      isOverDark
                        ? 'border-white/30 bg-white/10 text-[#F8F5EF] hover:bg-white/20'
                        : 'border-[#34203C]/20 bg-[#34203C]/06 text-[#34203C] hover:bg-[#34203C]/12'
                    )}
                  >
                    <Sparkles size={12} className={isOverDark ? 'text-[#C9BEAB]' : 'text-[#725D75]'} />
                    <span>AI Planner</span>
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* 3. Right Action Items */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Explore CTA Button */}
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className={cn(
                'hidden md:inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:scale-103 active:scale-95 cursor-pointer',
                isOverDark
                  ? 'bg-[#A78A9F] hover:bg-[#C9BEAB] text-[#34203C]'
                  : 'bg-[#34203C] hover:bg-[#483250] text-[#FAF8F5]'
              )}
            >
              <span>Explore</span>
              <span className="text-[12px]">→</span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => navigate('/wishlist')}
              className={cn(
                'relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all duration-300 cursor-pointer',
                isOverDark
                  ? 'text-[#F8F5EF] hover:bg-white/15'
                  : 'text-[#34203C] hover:bg-[#34203C]/08'
              )}
              aria-label="Wishlist"
            >
              <Heart size={16} />
              {wishlistCount > 0 && (
                <span
                  className={cn(
                    'absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold transition-colors duration-300',
                    isOverDark ? 'bg-[#C9BEAB] text-[#34203C]' : 'bg-[#34203C] text-white'
                  )}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all duration-300 cursor-pointer',
                isOverDark
                  ? 'text-[#F8F5EF] hover:bg-white/15'
                  : 'text-[#34203C] hover:bg-[#34203C]/08'
              )}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User / Auth */}
            <div ref={accountRef} className="relative">
              {auth.isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border py-1 px-2 transition-all duration-300 cursor-pointer',
                    isOverDark
                      ? 'border-white/20 bg-white/10 hover:bg-white/20 text-[#F8F5EF]'
                      : 'border-[#34203C]/20 bg-[#34203C]/06 hover:bg-[#34203C]/12 text-[#34203C]'
                  )}
                >
                  <Avatar user={auth.user} className="h-5 w-5" />
                  <span className="hidden sm:inline text-xs font-semibold max-w-[80px] truncate">
                    {auth.user?.firstName || auth.user?.name || 'Account'}
                  </span>
                  <ChevronDown size={11} className={isOverDark ? 'text-[#C9BEAB]' : 'text-[#725D75]'} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => auth.open('login')}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300 cursor-pointer',
                    isOverDark
                      ? 'text-[#F8F5EF] bg-white/15 hover:bg-white/25 border-white/30'
                      : 'text-[#34203C] bg-[#34203C]/08 hover:bg-[#34203C]/15 border-[#34203C]/20'
                  )}
                >
                  <LogIn size={13} />
                  <span>Login</span>
                </button>
              )}

              {/* Account Dropdown */}
              {accountOpen && auth.isLoggedIn && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#DDD5C7]/80 bg-[#FAF8F5] p-1.5 shadow-2xl dark:bg-[#2D1C34] dark:border-[#483250] animate-scale-in z-50">
                  <div className="px-3 py-2 border-b border-[#DDD5C7] dark:border-[#483250]">
                    <p className="text-xs font-bold text-[#34203C] dark:text-[#FAF8F5] truncate">
                      {auth.user?.firstName} {auth.user?.lastName}
                    </p>
                    <p className="text-[11px] text-[#725D75] dark:text-[#A78A9F] truncate">
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
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#34203C] hover:bg-[#F5EFE6] dark:text-[#FAF8F5] dark:hover:bg-[#38223E] text-left cursor-pointer"
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
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#34203C] hover:bg-[#F5EFE6] dark:text-[#FAF8F5] dark:hover:bg-[#38223E] text-left cursor-pointer"
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
                  <div className="border-t border-[#DDD5C7] dark:border-[#483250] pt-1">
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

            {/* Mobile Sheet Trigger */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all duration-300 cursor-pointer',
                      isOverDark ? 'text-[#F8F5EF] hover:bg-white/15' : 'text-[#34203C] hover:bg-[#34203C]/08'
                    )}
                  >
                    <Menu size={18} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-[#FAF8F5] dark:bg-[#1B101F] p-6">
                  <div className="flex flex-col gap-6 pt-6">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-left text-sm font-semibold py-2 border-b border-[#DDD5C7] dark:border-[#483250]"
                      >
                        Home
                      </button>
                      <a
                        href="/#signature-collections"
                        className="text-left text-sm font-semibold py-2 border-b border-[#DDD5C7] dark:border-[#483250]"
                      >
                        Collections
                      </a>
                      <a
                        href="/#detailed-services"
                        className="text-left text-sm font-semibold py-2 border-b border-[#DDD5C7] dark:border-[#483250]"
                      >
                        Packages
                      </a>
                      <button
                        type="button"
                        onClick={() => navigate('/ai-planner')}
                        className="flex items-center gap-2 text-left text-sm font-semibold py-2 border-b border-[#DDD5C7] dark:border-[#483250]"
                      >
                        <Sparkles size={14} className="text-[#A78A9F]" />
                        <span>AI Planner</span>
                      </button>
                    </div>

                    {categories.length > 0 && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="categories">
                          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-[#725D75] dark:text-[#A78A9F]">
                            Curated Occasions
                          </AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-1 pt-2">
                            {categories.map((cat) => (
                              <button
                                key={cat._id || cat.name}
                                type="button"
                                onClick={() => handleNavCategory(cat.name)}
                                className="text-left text-xs py-1.5 px-2 rounded-md hover:bg-[#A78A9F]/10"
                              >
                                {cat.name}
                              </button>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate('/explore')}
                      className="w-full rounded-full bg-[#34203C] dark:bg-[#C9BEAB] dark:text-[#34203C] text-[#FAF8F5] py-3 text-xs font-bold uppercase tracking-wider"
                    >
                      Explore All Packages
                    </button>
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
