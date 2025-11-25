const complaintModel = require("../models/complaintModel")

// Create complaint
const createComplaint = async (req, res) => {
  const { booking_id, description } = req.body

  try {
    // Check booking authorization
    const bookingInfo = await complaintModel.getBookingForComplaint(booking_id)
    if (!bookingInfo) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const userId = bookingInfo[0]
    const providerId = bookingInfo[1]

    // Check if user is related to this booking
    if (req.user.id !== userId && req.user.id !== providerId) {
      return res.status(403).json({ message: "Not authorized to file a complaint for this booking" })
    }

    // Create complaint
    const complaintId = await complaintModel.createComplaint(booking_id, req.user.id, description)

    res.status(201).json({
      message: "Complaint filed successfully",
      complaint_id: complaintId,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Get complaints for current user
const getUserComplaints = async (req, res) => {
  try {
    const complaintRows = await complaintModel.getComplaintsByUserId(req.user.id)

    const complaints = complaintRows.map((row) => ({
      complaint_id: row[0],
      booking_id: row[1],
      description: row[2],
      status: row[3],
      created_at: row[4],
      service_id: row[5],
      service_title: row[6],
    }))

    res.json(complaints)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createComplaint,
  getUserComplaints,
}
