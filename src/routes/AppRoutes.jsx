import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth & Onboarding
import { SplashScreen } from '../pages/auth/SplashScreen';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ProfileWizardPage } from '../pages/auth/ProfileWizardPage';

// Customer Pages
import { HomePage } from '../pages/customer/HomePage';
import { CategoriesPage } from '../pages/customer/CategoriesPage';
import { CategoryDetailPage } from '../pages/customer/CategoryDetailPage';
import { ProductListingPage } from '../pages/customer/ProductListingPage';
import { ProductDetailPage } from '../pages/customer/ProductDetailPage';
import { SearchPage } from '../pages/customer/SearchPage';
import { WishlistPage } from '../pages/customer/WishlistPage';
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrdersPage } from '../pages/customer/OrdersPage';
import { OrderDetailPage } from '../pages/customer/OrderDetailPage';
import { OrderTrackingPage } from '../pages/customer/OrderTrackingPage';
import { InvoicePage } from '../pages/customer/InvoicePage';
import { ProfilePage } from '../pages/customer/ProfilePage';
import { EditProfilePage } from '../pages/customer/EditProfilePage';
import { AddressesPage } from '../pages/customer/AddressesPage';
import { NotificationsPage } from '../pages/customer/NotificationsPage';
import { ReviewsPage } from '../pages/customer/ReviewsPage';
import { CouponsPage } from '../pages/customer/CouponsPage';
import { SettingsPage } from '../pages/customer/SettingsPage';
import { HelpPage } from '../pages/customer/HelpPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminProductEditorPage } from '../pages/admin/AdminProductEditorPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from '../pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '../pages/admin/AdminOrderDetailPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminCouponsPage } from '../pages/admin/AdminCouponsPage';
import { AdminBannersPage } from '../pages/admin/AdminBannersPage';
import { AdminReviewsPage } from '../pages/admin/AdminReviewsPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminHomepageManagerPage } from '../pages/admin/AdminHomepageManagerPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Onboarding & Splash */}
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Auth & Profile Wizard Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile-wizard" element={<ProfileWizardPage />} />
      <Route path="/onboarding/profile-wizard" element={<ProfileWizardPage />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

      {/* Customer Storefront Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:id" element={<CategoryDetailPage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/order/:id/tracking" element={<OrderDetailPage />} />
        <Route path="/order/:id/invoice" element={<InvoicePage />} />
        <Route path="/invoice/:id" element={<InvoicePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/addresses/add" element={<AddressesPage />} />
        <Route path="/addresses/edit" element={<AddressesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>

      {/* Admin Operations Console (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductEditorPage />} />
        <Route path="products/edit/:id" element={<AdminProductEditorPage />} />
        <Route path="products/:id" element={<AdminProductEditorPage />} />
        <Route path="homepage" element={<AdminHomepageManagerPage />} />
        <Route path="deals" element={<AdminHomepageManagerPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="payment-history" element={<AdminPaymentsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
