"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { complaintsAPI } from "../utils/api"

function ComplaintForm() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get current user info
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
        if (userInfo && userInfo.id) setUser(userInfo)

        const bookingData = await complaintsAPI.getBookingDetails(bookingId)
        if (!bookingData) {
          setError("Booking not found")
          return
        }
        setBooking(bookingData)
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError(err.message || "Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [bookingId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      setError("User information not found. Please log in again.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const complaintData = {
        booking_id: Number.parseInt(bookingId),
        title: formData.title.trim(),
        description: formData.description.trim(),
      }

      // Submit complaint
      await complaintsAPI.createComplaint(complaintData)

      alert("Complaint submitted successfully!")
      navigate("/my-bookings")
    } catch (err) {
      console.error("Error submitting complaint:", err)
      // Oracle check constraint error ORA-02290
      if (err?.error?.includes("ORA-02290")) {
        setError("Invalid value for status. Please contact support.")
      } else {
        setError(err.message || "Failed to submit complaint")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="formsFormat">
        <h1>File a Complaint</h1>
        <div className="loading">Loading...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="formsFormat">
        <h1>File a Complaint</h1>
        <div className="error">{error}</div>
      </section>
    )
  }

  return (
    <section className="formsFormat">
      <h1>File a Complaint</h1>

      <div className="booking-details">
        <h2>Booking Details</h2>
        <p><strong>Service:</strong> {booking?.service_title}</p>
        <p><strong>Provider:</strong> {booking?.provider_name}</p>
        <p><strong>Date:</strong> {booking?.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "N/A"}</p>
        <p><strong>Status:</strong> {booking?.status}</p>
      </div>

      <form className="complaint-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Complaint Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Brief title for your complaint"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Complaint Details:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="form-control"
            rows="6"
            placeholder="Please provide detailed information about your complaint..."
          ></textarea>
        </div>

        <button type="submit" className="complaint-submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </section>
  )
}

export default ComplaintForm
