import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthModal } from '../ui/AuthModal';
import { CartPage } from '../CartPage';
import { Footer } from './Footer';
import { Header } from './Header';
import { FloatingActionMenu } from './FloatingActionMenu';
import { ScrollProgressBar } from '../ui/ScrollProgressBar';
import { BackToTopButton } from '../ui/BackToTopButton';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import type { AdminCategory, AuthTab, AuthUser, CartItem, Translations } from '../../types';
import type { AuthRedirect } from '../../context/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  auth: {
    isLoggedIn: boolean;
    isAdmin: boolean;
    user: AuthUser | null;
    open: (tab?: AuthTab) => void;
    logout: () => void;
    close: () => void;
    setTab: (tab: AuthTab) => void;
    login: (user: AuthUser, token?: string) => void;
    isOpen: boolean;
    tab: AuthTab;
    isLoading: boolean;
    initialized: boolean;
    authRedirect: AuthRedirect | null;
    clearAuthRedirect: () => void;
    updateUser: (user: AuthUser) => void;
  };
  t?: Record<string, string> | Translations;
  onAssistantOpen?: () => void;
  onLogoClick?: () => void;
  showAssistantButton?: boolean;
  showMobileMenu?: boolean;
  categories?: AdminCategory[];
  onSelectCategory?: (catName: string, subName?: string) => void;
  assistantOpen?: boolean;
  assistantMessages?: any[];
  assistantInput?: string;
  assistantInputRef?: React.RefObject<HTMLInputElement>;
  onAssistantClose?: () => void;
  onAssistantInputChange?: (value: string) => void;
  onAssistantSubmit?: (e: React.FormEvent) => void;
  cartOpen?: boolean;
  cartItems?: CartItem[];
  cartTotal?: number;
  onCartRemove?: (id: string) => void;
  onCartUpdateQty?: (id: string, qty: number) => void;
  onCartClear?: () => void;
  onCartClose?: () => void;
  onCartLoginClick?: () => void;
  onTermsPageOpen?: (key: 'terms' | 'privacy' | 'refund' | 'about') => void;
  onLogin?: (user: AuthUser, token?: string) => void;
  onCloseAuth?: () => void;
  onSetAuthTab?: (tab: AuthTab) => void;
  authModalOpen?: boolean;
  authModalTab?: AuthTab;
  hideShell?: boolean;
}

export default function MainLayout({
  children,
  auth,
  t,
  onLogoClick,
  onAssistantOpen: _onAssistantOpen,
  showAssistantButton = false,
  showMobileMenu = true,
  categories = [],
  onSelectCategory,
  cartOpen = false,
  cartItems = [],
  cartTotal = 0,
  onCartRemove = () => {},
  onCartUpdateQty = () => {},
  onCartClear = () => {},
  onCartClose = () => {},
  onCartLoginClick = () => {},
  onTermsPageOpen = () => {},
  onLogin,
  onCloseAuth = () => {},
  onSetAuthTab = () => {},
  authModalOpen = false,
  authModalTab = 'login',
  hideShell = false,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const handledAuthRedirect = useRef(false);
  const handledAdminLanding = useRef(false);

  // Enable global smooth fluid scrolling
  useSmoothScroll();

  useEffect(() => {
    if (!auth.initialized || !auth.isLoggedIn || auth.tab !== 'success') {
      handledAuthRedirect.current = false;
      handledAdminLanding.current = false;
      return;
    }

    if (location.pathname.startsWith('/admin') || location.pathname === '/profile') return;

    if (auth.authRedirect) {
      const redirect = auth.authRedirect;
      const targetSearch = redirect.search || '';
      const targetHash = redirect.hash || '';
      const targetMatches =
        location.pathname === redirect.pathname &&
        location.search === targetSearch &&
        location.hash === targetHash;

      if (!targetMatches) {
        navigate(
          { pathname: redirect.pathname, search: redirect.search, hash: redirect.hash },
          { replace: true, state: redirect.state }
        );
        return;
      }

      handledAuthRedirect.current = true;
      auth.clearAuthRedirect();
      return;
    }

    if (auth.isAdmin && !handledAdminLanding.current && !location.pathname.startsWith('/admin')) {
      handledAdminLanding.current = true;
      navigate('/admin', { replace: true });
      return;
    }

    if (handledAuthRedirect.current) return;

    handledAuthRedirect.current = true;
  }, [auth.authRedirect, auth.clearAuthRedirect, auth.initialized, auth.isAdmin, auth.isLoggedIn, auth.tab, location.pathname, navigate]);

  const internalHandleLogin = (user: AuthUser, token?: string) => {
    try {
      auth.login(user, token);
    } catch {
      // fallback
    }
  };

  const handleTermsOpen = (pageKey: 'terms' | 'privacy' | 'refund' | 'about') => {
    if (onTermsPageOpen) {
      onTermsPageOpen(pageKey);
    } else {
      navigate(`/${pageKey}`);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      {hideShell ? (
        children
      ) : (
        <div className="min-h-screen flex flex-col bg-[#F9F6F2] dark:bg-[#1B101F] text-[#2F2930] dark:text-[#FAF8F5] transition-colors duration-200">
          <Header
            auth={auth}
            t={t}
            onLogoClick={onLogoClick}
            showAssistantButton={showAssistantButton}
            showMobileMenu={showMobileMenu}
            categories={categories}
            onSelectCategory={onSelectCategory}
          />
          <main className="flex-1 w-full">{children}</main>
          <Footer
            t={t}
            onPageOpen={handleTermsOpen}
            categories={categories}
            onSelectCategory={onSelectCategory ? (cat) => onSelectCategory(cat) : undefined}
          />
          {cartOpen && (
            <CartPage
              items={cartItems}
              total={cartTotal}
              onRemove={onCartRemove}
              onUpdateQty={onCartUpdateQty}
              onClear={onCartClear}
              onClose={onCartClose}
              isLoggedIn={auth.isLoggedIn}
              onLoginClick={onCartLoginClick}
            />
          )}
          <AuthModal
            isOpen={authModalOpen}
            tab={authModalTab}
            onClose={onCloseAuth}
            onSetTab={onSetAuthTab}
            onLogin={onLogin || internalHandleLogin}
          />
        </div>
      )}
      {!hideShell && (
        <>
          <ScrollProgressBar />
          <FloatingActionMenu />
          <BackToTopButton />
        </>
      )}
    </>
  );
}
