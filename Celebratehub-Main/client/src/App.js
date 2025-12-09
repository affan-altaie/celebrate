import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/access/Login';
import Register from './components/access/Register';
import ForgotPassword from './components/access/ForgotPassword';
import About from './components/About';
import Contact from './components/Contact';
import Terms from './components/Terms';
import CustomerDashboard from './components/dashboards/CustomerDashboard';
import CustomerProfile from './components/dashboards/CustomerProfile';
import BookingHistory from './components/dashboards/BookingHistory';
import NewBooking from './components/dashboards/NewBooking';
import ProviderDashboard from './components/dashboards/ProviderDashboard';
import ProviderProfile from './components/dashboards/ProviderProfile';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ManageServices from './components/dashboards/admin/ManageServices';
import UserManagement from './components/dashboards/admin/UserManagement';
import ProviderApprovals from './components/dashboards/admin/ProviderApprovals';
import ReportsAndFeedback from './components/dashboards/admin/ReportsAndFeedback';
import ManageListings from './components/dashboards/ManageListings';
import EditProviderProfile from './components/dashboards/EditProviderProfile';
import EditListing from './components/dashboards/EditListing';
import CustomerReviews from './components/dashboards/CustomerReviews';
import ServiceDetails from './components/dashboards/ServiceDetails';
import AddService from './components/dashboards/AddService';
import LeaveReview from './components/dashboards/LeaveReview';
import ReportService from './components/dashboards/ReportService';
import BookingPage from './components/dashboards/BookingPage';
import BookingConfirmation from './components/dashboards/BookingConfirmation';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const userData = JSON.parse(user);
    if (!allowedRoles.includes(userData.role)) {
      // Redirect based on their actual role
      switch(userData.role) {
        case 'admin':
          return <Navigate to="/admin-dashboard" replace />;
        case 'provider':
          return <Navigate to="/provider-dashboard" replace />;
        case 'customer':
        default:
          return <Navigate to="/customer-dashboard" replace />;
      }
    }
  }
  
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const showNavbar = !['/login', '/register'].includes(location.pathname);

  return (
    <div className="App">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer-profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />
        <Route path="/booking-history" element={<ProtectedRoute allowedRoles={['customer']}><BookingHistory /></ProtectedRoute>} />
        <Route path="/leave-review/:bookingId" element={<ProtectedRoute allowedRoles={['customer']}><LeaveReview /></ProtectedRoute>} />
        <Route path="/report-service/:serviceId" element={<ProtectedRoute allowedRoles={['customer']}><ReportService /></ProtectedRoute>} />
        <Route path="/new-booking" element={<ProtectedRoute allowedRoles={['customer']}><NewBooking /></ProtectedRoute>} />
        <Route path="/service/:id" element={<ProtectedRoute allowedRoles={['customer']}><ServiceDetails /></ProtectedRoute>} />
        <Route path="/booking/:id" element={<ProtectedRoute allowedRoles={['customer']}><BookingPage /></ProtectedRoute>} />
        <Route path="/booking-confirmation" element={<ProtectedRoute allowedRoles={['customer']}><BookingConfirmation /></ProtectedRoute>} />
        <Route path="/provider-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/manage-listings" element={<ProtectedRoute allowedRoles={['provider']}><ManageListings /></ProtectedRoute>} />
        <Route path="/add-service" element={<ProtectedRoute allowedRoles={['provider']}><AddService /></ProtectedRoute>} />
        <Route path="/edit-listing/:id" element={<ProtectedRoute allowedRoles={['provider']}><EditListing /></ProtectedRoute>} />
        <Route path="/edit-provider-profile" element={<ProtectedRoute allowedRoles={['provider']}><EditProviderProfile /></ProtectedRoute>} />
        <Route path="/customer-reviews" element={<ProtectedRoute allowedRoles={['provider']}><CustomerReviews /></ProtectedRoute>} />
        <Route path="/provider-profile/:providerId" element={<ProtectedRoute allowedRoles={['provider', 'customer']}><ProviderProfile /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/manage-services" element={<ProtectedRoute allowedRoles={['admin']}><ManageServices /></ProtectedRoute>} />
        <Route path="/admin/user-management" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/provider-approvals" element={<ProtectedRoute allowedRoles={['admin']}><ProviderApprovals /></ProtectedRoute>} />
        <Route path="/admin/reports-and-feedback" element={<ProtectedRoute allowedRoles={['admin']}><ReportsAndFeedback /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
