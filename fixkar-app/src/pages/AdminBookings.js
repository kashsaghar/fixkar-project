"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { adminAPI } from "../utils/api"
import "../App.css"

function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [statusModal, setStatusModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user")) || {}

    if (!token || user.role !== "admin") {
      navigate("/unauthorized")
      return
    }

    fetchBookings()
  }, [navigate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getAllBookings()
      setBookings(Array.isArray(data) ? data : data.bookings || [])
      setError(null)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus)
      fetchBookings()
      setStatusModal(false)
      alert("Booking status updated successfully")
    } catch (err) {
      console.error("Error:", err)
      alert(`Error: ${err.message}`)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      completed: "status-completed",
      cancelled: "status-cancelled",
    }
    return colors[status] || "status-pending"
  }

  const BookingRow = ({ booking }) => (
    <tr key={booking.booking_id}>
      <td>{booking.booking_id}</td>
      <td>{booking.title}</td>
      <td>${booking.price}</td>
      <td>{booking.customer_name}</td>
      <td>{booking.provider_name}</td>
      <td>
        <span className={`status-badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
      </td>
      <td>
        <button
          className="action-btn-small"
          onClick={() => {
            setSelectedStatus(booking)
            setStatusModal(true)
          }}
        >
          Change Status
        </button>
      </td>
    </tr>
  )

  if (loading) return <div className="admin-loading">Loading bookings...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-bookings">
      <div className="admin-header">
        <h1>Booking Management</h1>
        <p>Total Bookings: {bookings.length}</p>
      </div>

      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Service</th>
              <th>Price</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Current Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <BookingRow key={booking.booking_id} booking={booking} />
            ))}
          </tbody>
        </table>
      </div>

      {statusModal && selectedStatus && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Booking Status</h3>
            <p>Booking ID: {selectedStatus.booking_id}</p>
            <div className="status-options">
              {["pending", "confirmed", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  className="status-option-btn"
                  onClick={() => handleStatusChange(selectedStatus.booking_id, status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn-cancel" onClick={() => setStatusModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBookings
