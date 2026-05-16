const bookingModel = require("../models/bookingModel")

// Get all bookings for current user
const getUserBookings = async (req, res) => {
  try {
    let bookings

    if (req.user.role === "seeker") {
      bookings = await bookingModel.getBookingsByUserId(req.user.id)
    } else if (req.user.role === "provider") {
      bookings = await bookingModel.getBookingsByProviderId(req.user.id)
    } else {
      return res.status(403).json({ message: "Unauthorized role" })
    }

    // Format results
    const formattedBookings = bookings.map((row) => {
      const booking = {
        booking_id: row[0],
        booking_date: row[1],
        status: row[2],
        notes: row[3],
        service_id: row[4],
        service_title: row[5],
        service_price: row[6],
        service_duration: row[7],
      }

      if (req.user.role === "seeker") {
        booking.provider_name = row[8]
      } else {
        booking.customer_name = row[8]
      }

      return booking
    })

    res.json(formattedBookings)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Get booking by ID
const getBooking = async (req, res) => {
  try {
    const bookingRow = await bookingModel.getBookingById(req.params.id)

    if (!bookingRow) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const booking = {
      booking_id: bookingRow[0],
      booking_date: bookingRow[1],
      status: bookingRow[2],
      notes: bookingRow[3],
      user_id: bookingRow[4],
      service_id: bookingRow[5],
      service_title: bookingRow[6],
      service_price: bookingRow[7],
      service_duration: bookingRow[8],
      provider_id: bookingRow[9],
      customer_name: bookingRow[10],
      provider_name: bookingRow[11],
    }

    // Check authorization
    if (req.user.id !== booking.user_id && req.user.id !== booking.provider_id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this booking" })
    }

    res.json(booking)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Create booking
const createBooking = async (req, res) => {
  if (req.user.role !== "seeker") {
    return res.status(403).json({ message: "Only customers can book services" })
  }

  const { service_id, booking_date, notes } = req.body

  if (!service_id || !booking_date) {
    return res.status(400).json({ message: "service_id and booking_date are required" })
  }

  try {
    // Check service availability
    const isAvailable = await bookingModel.checkServiceAvailability(service_id)
    if (!isAvailable) {
      return res.status(400).json({ message: "Service is not available for booking" })
    }

    // Create booking
    const bookingId = await bookingModel.createBooking(req.user.id, service_id, booking_date, notes)

    res.status(201).json({
      message: "Booking created successfully",
      booking_id: bookingId,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Update booking status
const updateBookingStatus = async (req, res) => {
  const { status } = req.body

  const validStatuses = ["pending", "confirmed", "completed", "cancelled", "accepted", "in_progress"]
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" })
  }


  try {
    // Get authorization info
    const authInfo = await bookingModel.getBookingAuthInfo(req.params.id)
    if (!authInfo) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const userId = authInfo[0]
    const providerId = authInfo[1]

    // Check authorization
    const isCustomer = req.user.id === userId
    const isProvider = req.user.id === providerId
    const isAdmin = req.user.role === "admin"

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this booking" })
    }

    // Customers can only cancel bookings
    if (isCustomer && status !== "cancelled") {
      return res.status(403).json({ message: "Customers can only cancel bookings" })
    }

    // Update status
    await bookingModel.updateBookingStatus(req.params.id, status)

    res.json({ message: "Booking status updated successfully" })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getUserBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
}
