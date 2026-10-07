import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { ProviderLayout } from './layouts/ProviderLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { Services } from './pages/public/Services';
import { Providers } from './pages/public/Providers';
import { ProviderProfile } from './pages/public/ProviderProfile';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';

// Auth Pages
import { Login } from './pages/auth/Login';
import { CustomerRegister } from './pages/auth/CustomerRegister';
import { ProviderRegister } from './pages/auth/ProviderRegister';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerBookings } from './pages/customer/CustomerBookings';
import { NewBooking } from './pages/customer/NewBooking';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Provider Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderAvailability } from './pages/provider/ProviderAvailability';
import { ProviderBookings } from './pages/provider/ProviderBookings';
import { ProviderEditProfile } from './pages/provider/ProviderEditProfile';

// Common Pages
import { BookingDetails } from './pages/common/BookingDetails';
import { NotificationsPage } from './pages/common/NotificationsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ServiceManagement } from './pages/admin/ServiceManagement';
import { ProviderManagement } from './pages/admin/ProviderManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminComplaints } from './pages/admin/AdminComplaints';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

const RegisterRouteHandler = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  if (role === 'PROVIDER') return <ProviderRegister />;
  return <CustomerRegister />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* Public Layout Routes (Navbar + Footer) */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="providers" element={<Providers />} />
            <Route path="providers/:id" element={<ProviderProfile />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RegisterRouteHandler />} />
          </Route>

          {/* Customer Workspace Layout Routes (NO Public Navbar/Footer) */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="bookings/new" element={<NewBooking />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Provider Workspace Layout Routes (NO Public Navbar/Footer) */}
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="availability" element={<ProviderAvailability />} />
            <Route path="bookings" element={<ProviderBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="profile" element={<ProviderEditProfile />} />
          </Route>

          {/* Admin Workspace Layout Routes (NO Public Navbar/Footer) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="services" element={<ServiceManagement />} />
            <Route path="providers" element={<ProviderManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Common Authenticated Routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
