import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { HomePage } from '../pages/Home/HomePage';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { CRM_URL } from '../config/crm';

// Code-split secondary pages for optimal bundle sizes and performance
const ExplorePage = lazy(() => import('../pages/Explore/ExplorePage').then(m => ({ default: m.ExplorePage })));
const OccasionPage = lazy(() => import('../pages/Occasion/OccasionPage').then(m => ({ default: m.OccasionPage })));
const ProductPage = lazy(() => import('../pages/Product/ProductPage').then(m => ({ default: m.ProductPage })));
const BookingPage = lazy(() => import('../pages/Booking/BookingPage').then(m => ({ default: m.BookingPage })));
const OrderDetailsPage = lazy(() => import('../pages/Bookings/OrderDetailsPage').then(m => ({ default: m.OrderDetailsPage })));
const BookingsPage = lazy(() => import('../pages/Bookings/BookingsPage').then(m => ({ default: m.BookingsPage })));
const WishlistPage = lazy(() => import('../pages/Wishlist/WishlistPage').then(m => ({ default: m.WishlistPage })));
const AIPlannerPage = lazy(() => import('../pages/AIPlanner/AIPlannerPage').then(m => ({ default: m.AIPlannerPage })));
const PackagesPage = lazy(() => import('../pages/Static/PackagesPage').then(m => ({ default: m.PackagesPage })));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPasswordPage'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPasswordPage'));
const TermsPage = lazy(() => import('../pages/Static/TermsPage'));
const AboutPage = lazy(() => import('../pages/Static/AboutPage'));
const ContactPage = lazy(() => import('../pages/Static/ContactPage'));
const GalleryPage = lazy(() => import('../pages/Static/GalleryPage'));

const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin" />
  </div>
);

/** Bounces the old in-app /admin* routes to the standalone CRM app. */
function RedirectToCRM() {
  useEffect(() => {
    window.location.replace(CRM_URL);
  }, []);
  return null;
}

import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import { useProducts } from '../hooks/useProducts';
import { trackPageView, trackSearch, trackViewItemList } from '../utils/analytics';
import type { AdminProduct } from '../types';

function RouteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    trackPageView(path);

    const categoryMatch = location.pathname.match(/^\/(?:category|occasion)\/([^/]+)(?:\/([^/]+))?$/);
    if (categoryMatch) {
      const [, categorySegment, subcategorySegment] = categoryMatch;
      const category = decodeURIComponent(categorySegment);
      const subcategory = subcategorySegment ? decodeURIComponent(subcategorySegment) : null;
      const listName = subcategory ? `${category} - ${subcategory}` : category;
      trackViewItemList(listName);
    }

    const search = new URLSearchParams(location.search).get('q') || new URLSearchParams(location.search).get('search');
    if (search?.trim()) {
      trackSearch(search.trim());
    }
  }, [location.pathname, location.search]);

  return null;
}

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const cart = useCart();
  const { t } = useLanguage();
  const { categories } = useProducts();

  const cartOpen = location.pathname === '/cart';

  const handleSelectCategory = (catName: string, subName?: string) => {
    if (catName.toUpperCase() === 'ALL' || catName.toLowerCase() === 'explore') {
      navigate('/explore');
      return;
    }
    if (subName && subName !== '__all__') {
      navigate(`/category/${encodeURIComponent(catName)}/${encodeURIComponent(subName)}`);
    } else {
      navigate(`/category/${encodeURIComponent(catName)}`);
    }
  };

  const handleViewProduct = (p: AdminProduct) => {
    // Pass the full product in navigation state so synthetic / gallery
    // fallback cards (which have no server-side record) still open a
    // working detail page when "View Details" is clicked.
    navigate(`/product/${p._id}`, { state: { product: p } });
  };

  const handleBookProduct = (p: AdminProduct) => {
    navigate(`/booking/${p._id}`, { state: { product: p, preferredMethod: 'razorpay' } });
  };

  return (
    <>
      <RouteAnalytics />
      <ScrollToTop />
      <MainLayout
        auth={auth}
        t={t}
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onLogoClick={() => navigate('/')}
        cartOpen={cartOpen}
        cartItems={cart.items}
        cartTotal={cart.total}
        onCartRemove={cart.removeItem}
        onCartRemoveAddon={cart.removeCartAddon}
        onCartUpdateQty={cart.updateQty}
        onCartClear={cart.clearCart}
        onCartClose={() => navigate(-1)}
        onCartLoginClick={() => auth.open('login')}
        onTermsPageOpen={(key) => navigate(`/${key}`)}
        onCloseAuth={auth.close}
        onSetAuthTab={auth.setTab}
        authModalOpen={auth.isOpen}
        authModalTab={auth.tab}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Home Landing */}
          <Route
            path="/"
            element={
              <HomePage
                categories={categories}
                onSelectCategory={handleSelectCategory}
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />

          {/* Dedicated Packages Page */}
          <Route
            path="/packages"
            element={
              <PackagesPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />

          {/* Explore Catalog */}
          <Route
            path="/explore"
            element={
              <ExplorePage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />

          {/* Services, Activities, Occasion & Category Routes */}
          <Route
            path="/services/:categoryName"
            element={
              <OccasionPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />
          <Route
            path="/services/:categoryName/:subcategoryName"
            element={
              <OccasionPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />
          <Route
            path="/activities"
            element={
              <OccasionPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />
          <Route
            path="/activities/:subcategoryName"
            element={
              <OccasionPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />
          <Route
            path="/category/:categoryName"
            element={
              <OccasionPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />
          <Route
            path="/category/:categoryName/:subcategoryName"
            element={
              <OccasionPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />
          <Route
            path="/occasion/:categoryName"
            element={
              <OccasionPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />
          <Route
            path="/occasion/:categoryName/:subcategoryName"
            element={
              <OccasionPage
                onViewProduct={handleViewProduct}
                onBookProduct={handleBookProduct}
              />
            }
          />

          {/* Product Detail */}
          <Route
            path="/product/:id"
            element={<ProductPage />}
          />

          {/* Booking & Checkout -- require an authenticated customer. The
              route stays put while the login modal is shown, so the pending
              booking (passed via router state) is never lost. */}
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:id"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />

          {/* Order Details & Bookings */}
          <Route
            path="/orders/:id"
            element={<OrderDetailsPage />}
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Single Dedicated AI Event Planner Route */}
          <Route
            path="/ai-planner"
            element={<AIPlannerPage />}
          />

          {/* Wishlist */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Static Pages */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<TermsPage />} />
          <Route path="/refund" element={<TermsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/gallery" element={<GalleryPage />} />

          {/* Admin console now lives in its own app (CRM/) -- bounce any of
              its old in-app routes straight there. */}
          <Route path="/admin" element={<RedirectToCRM />} />
          <Route path="/admin/*" element={<RedirectToCRM />} />
          <Route path="/admin-login" element={<RedirectToCRM />} />

          {/* Fallback */}
          <Route path="*" element={<ExplorePage onViewProduct={handleViewProduct} onBookProduct={handleBookProduct} />} />
        </Routes>
      </Suspense>
    </MainLayout>
    </>
  );
};

export default AppRoutes;
