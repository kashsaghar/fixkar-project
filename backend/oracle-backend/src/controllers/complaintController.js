const complaintModel = require("../models/complaintModel");

// Create complaint
const createComplaint = async (req, res) => {
  const { booking_id, title, description } = req.body;

  if (!booking_id || !title || !description) {
    return res.status(400).json({ message: "Missing required fields: booking_id, title, description" });
  }

  try {
    const bookingInfo = await complaintModel.getBookingForComplaint(booking_id);
    if (!bookingInfo) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const seekerId = bookingInfo.user_id;
    const providerId = bookingInfo.provider_id;

    if (req.user.id !== seekerId && req.user.id !== providerId) {
      return res.status(403).json({ message: "Not authorized to file a complaint for this booking" });
    }

    await complaintModel.createComplaint(booking_id, req.user.id, title, description);

    res.status(201).json({ message: "Complaint filed successfully" });
  } catch (err) {
    console.error("Complaint error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// Get complaints for current user
const getUserComplaints = async (req, res) => {
  try {
    const complaints = await complaintModel.getComplaintsByUserId(req.user.id);
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints
};
