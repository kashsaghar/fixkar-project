import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Filters from "./pages/Filters";
import Contact from "./pages/Contact";
import ServiceForm from "./pages/ServiceForm";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
// import BookingForm from './pages/BookingForm';
import MyBookings from "./pages/MyBookings";
import ReviewForm from "./pages/ReviewForm";
import ComplaintForm from "./pages/ComplaintForm";
import MyServices from "./pages/MyServices";
import ServiceDetails from "./pages/ServiceDetails";
import "./App.css";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard"
import AdminUsers from "./pages/AdminUsers"
import AdminServices from "./pages/AdminServices"
import AdminBookings from "./pages/AdminBookings"
import AdminComplaints from "./pages/AdminComplaints"
import AdminReviews from "./pages/AdminReviews"

// ScrollToTop component that uses the useLocation hook
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Wrapper component to include ScrollToTop
function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/filters" element={<Filters />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Service provider routes */}
          <Route
            path="/add-service"
            element={
              <ProtectedRoute requiredRole="provider">
                <ServiceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-services"
            element={
              <ProtectedRoute requiredRole="provider">
                <MyServices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-service/:serviceId"
            element={
              <ProtectedRoute requiredRole="provider">
                <ServiceForm />
              </ProtectedRoute>
            }
          />

          {/* Service seeker routes */}
          <Route path="/services" element={<Filters />} />

          <Route path="/services/:serviceId" element={<ServiceDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/review/:bookingId"
            element={
              <ProtectedRoute requiredRole="seeker">
                <ReviewForm />
              </ProtectedRoute>
            }
          />

          <Route path="/complaint/:bookingId" element={<ComplaintForm />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/services"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminServices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminComplaints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminReviews />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
