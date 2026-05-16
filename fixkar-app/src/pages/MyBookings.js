"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { bookingsAPI } from "../utils/api";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [newBookingId, setNewBookingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        // Try to get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
        if (userInfo && userInfo.id) {
          setUser(userInfo);
        } else {
          // If no user info in localStorage, try to fetch it
          try {
            const userResponse = await api.get("/auth/user");
            if (userResponse.data) {
              setUser(userResponse.data);
            } else {
              throw new Error("No user data returned");
            }
          } catch (userErr) {
            console.error("Error fetching user:", userErr);
            setUser({ name: "User", role: "seeker" });
          }
        }

        // Check for new booking ID in localStorage
        const storedNewBookingId = localStorage.getItem("newBookingId");
        if (storedNewBookingId) {
          setNewBookingId(storedNewBookingId);
          localStorage.removeItem("newBookingId");
        }

        // Fetch bookings from API using correct endpoints
        const userRole = userInfo?.role || user?.role || "seeker";
        const endpoint =
          userRole === "provider"
            ? "/bookings/provider-bookings"
            : "/bookings/my-bookings";

        try {
          const bookingsData = await bookingsAPI.getUserBookings(endpoint);
          setBookings(bookingsData);
        } catch (apiErr) {
          console.error("Error fetching bookings from API:", apiErr);
          setError("Failed to load bookings. Please check your connection.");
          setBookings([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error in MyBookings:", err);
        setError("Failed to load bookings. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });

      // Update the booking in the state
      setBookings(
        bookings.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      alert(`Booking status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating booking status:", err);
      alert(
        "Failed to update booking status: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "confirmed":
        return "badge-info";
      case "in_progress":
        return "badge-primary";
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <section className="bookings-page">
        <h1>My Bookings</h1>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bookings-page">
        <h1>My Bookings</h1>
        <div className="error-alert">{error}</div>
      </section>
    );
  }

  return (
    <section className="bookings-page">
      <h1>{user?.role === "provider" ? "Service Requests" : "My Bookings"}</h1>
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found.</p>
          <Link to="/filters" className="btn-primary">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div
              key={booking.booking_id}
              className={`booking-card ${
                newBookingId === booking.booking_id
                  ? "highlight-new-booking"
                  : ""
              }`}
            >
              <div className="booking-header">
                <h3>{booking.service_title}</h3>
                <span
                  className={`status-badge ${getStatusBadgeClass(
                    booking.status
                  )}`}
                >
                  {booking.status.replace("_", " ")}
                </span>
                {newBookingId === booking.booking_id && (
                  <span className="new-booking-badge">New Booking</span>
                )}
              </div>
              <div className="booking-details">
                <p>
                  <strong>Scheduled:</strong>{" "}
                  {formatDateTime(booking.booking_date)}
                </p>
                <p>
                  <strong>Amount:</strong> pkr {booking.service_price}
                </p>
                {user?.role === "seeker" ? (
                  <p>
                    <strong>Provider:</strong> {booking.provider_name}
                  </p>
                ) : (
                  <p>
                    <strong>Customer:</strong> {booking.customer_name}
                  </p>
                )}
                {booking.notes && (
                  <p>
                    <strong>Notes:</strong> {booking.notes}
                  </p>
                )}
              </div>
              <div className="booking-actions">
                {user?.role === "provider" && booking.status === "pending" && (
                  <>
                    <button
                      className="btn-success"
                      onClick={() =>
                        handleStatusChange(booking.booking_id, "confirmed")
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() =>
                        handleStatusChange(booking.booking_id, "cancelled")
                      }
                    >
                      Decline
                    </button>
                  </>
                )}
                {user?.role === "provider" &&
                  booking.status === "confirmed" && (
                    <button
                      className="btn-primary"
                      onClick={() =>
                        handleStatusChange(booking.booking_id, "in_progress")
                      }
                    >
                      Start Service
                    </button>
                  )}
                {user?.role === "provider" &&
                  booking.status === "in_progress" && (
                    <button
                      className="btn-success"
                      onClick={() =>
                        handleStatusChange(booking.booking_id, "completed")
                      }
                    >
                      Complete Service
                    </button>
                  )}
                {user?.role === "seeker" && booking.status === "pending" && (
                  <button
                    className="btn-danger"
                    onClick={() =>
                      handleStatusChange(booking.booking_id, "cancelled")
                    }
                  >
                    Cancel Booking
                  </button>
                )}

                {/* status is completed */}
                {user?.role === "seeker" &&
                  booking.status === "completed" &&
                  !booking.has_review && (
                    <Link
                      to={`/review/${booking.booking_id}`}
                      className="btn-primary"
                    >
                      Leave Review
                    </Link>
                  )}

                {user?.role === "seeker" &&
                  (booking.status === "completed" ||
                    booking.status === "cancelled") && (
                    <Link
                      to={`/complaint/${booking.booking_id}`}
                      className="btn-warning"
                    >
                      File a Complaint
                    </Link>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBookings;
