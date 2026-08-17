import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { HomePage } from '../pages/Home/HomePage';
import { ExplorePage } from '../pages/Explore/ExplorePage';
import { OccasionPage } from '../pages/Occasion/OccasionPage';
import { ProductPage } from '../pages/Product/ProductPage';
import { BookingPage } from '../pages/Booking/BookingPage';
import { OrderDetailsPage } from '../pages/Bookings/OrderDetailsPage';
import { BookingsPage } from '../pages/Bookings/BookingsPage';
import { WishlistPage } from '../pages/Wishlist/WishlistPage';
import { AIPlannerPage } from '../pages/AIPlanner/AIPlannerPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ForgotPassword from '../pages/Auth/ForgotPasswordPage';
import ResetPassword from '../pages/Auth/ResetPasswordPage';
import TermsPage from '../pages/Static/TermsPage';
import AboutPage from '../pages/Static/AboutPage';
import ContactPage from '../pages/Static/ContactPage';
import GalleryPage from '../pages/Static/GalleryPage';
import AdminPage from '../pages/AdminPage';
import AdminAuthPage from '../pages/Auth/AdminAuthPage';

import ProtectedRoute from '../components/layout/ProtectedRoute';
import AdminRoute from '../components/layout/AdminRoute';
import { ScrollToTop } from '../components/layout/ScrollToTop';

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
    if (subName && subName !== '__all__') {
      navigate(`/category/${encodeURIComponent(catName)}/${encodeURIComponent(subName)}`);
    } else {
      navigate(`/category/${encodeURIComponent(catName)}`);
    }
  };

  const handleViewProduct = (p: AdminProduct) => {
    navigate(`/product/${p._id}`);
  };

  const handleBookProduct = (p: AdminProduct) => {
    navigate(`/booking/${p._id}`);
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

          {/* Occasion & Category Routes */}
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

          {/* Booking & Checkout */}
          <Route
            path="/booking/:id"
            element={<BookingPage />}
          />
          <Route
            path="/checkout"
            element={<BookingPage />}
          />
          <Route
            path="/checkout/:id"
            element={<BookingPage />}
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

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminAuthPage initialTab="admin-login" />} />
          <Route path="/admin/register" element={<AdminAuthPage initialTab="admin-register" />} />
          <Route path="/admin-login" element={<AdminAuthPage initialTab="admin-login" />} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/addons" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/activities" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/sliders" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/terms" element={<AdminRoute><AdminPage /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<ExplorePage onViewProduct={handleViewProduct} onBookProduct={handleBookProduct} />} />
        </Routes>
      </MainLayout>
    </>
  );
};

export default AppRoutes;
