const express = require("express")
const router = express.Router()
const bookingController = require("../controllers/bookingController")
const auth = require("../middleware/auth")

// GET all bookings for current user
router.get("/me", auth, bookingController.getUserBookings)

// GET booking by ID
router.get("/:id", auth, bookingController.getBooking)

// POST new booking
router.post("/", auth, bookingController.createBooking)

// PUT update booking status
router.put("/:id/status", auth, bookingController.updateBookingStatus)

module.exports = router
