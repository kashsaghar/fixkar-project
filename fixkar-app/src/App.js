import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/footer';
import Home from './pages/Home';
import About from './pages/About';
import Filters from './pages/Filters';
import Contact from './pages/Contact';
import ServiceForm from './pages/ServiceForm';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
// import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import ReviewForm from './pages/ReviewForm';
import ComplaintForm from './pages/ComplaintForm';
import MyServices from './pages/MyServices';
import ServiceDetails from './pages/ServiceDetails';
import './App.css';
import Unauthorized from './pages/Unauthorized';

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
          <Route path="/add-service" element={<ServiceForm />} />
          <Route path="/my-services" element={<MyServices />} />
          <Route path="/edit-service/:serviceId" element={<ServiceForm />} />
          
          {/* Service seeker routes */}
          <Route path="/services" element={<Filters />} />
          <Route path="/services/:serviceId" element={<ServiceDetails />} />
          {/* <Route path="/book-service" element={<BookingForm />} /> */}
          {/* <Route path="/book/:serviceId" element={<BookingForm />} /> */}
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/review/:bookingId" element={<ReviewForm />} />
          <Route path="/complaint/:bookingId" element={<ComplaintForm />} />
          
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