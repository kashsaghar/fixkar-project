const express = require("express")
const adminController = require("../controllers/adminController")
const auth = require("../middleware/auth")
const router = express.Router()

router.use(auth)
// since it needs to check after auth sets req.user

// Dashboard
router.get("/dashboard", adminController.isAdmin, adminController.getDashboardStats)

// User Management
router.get("/users", adminController.isAdmin, adminController.getUsers)
router.put("/users/:userId/suspend", adminController.isAdmin, adminController.suspendUser)
router.put("/users/:userId/activate", adminController.isAdmin, adminController.activateUser)
router.delete("/users/:userId", adminController.isAdmin, adminController.deleteUser)
router.put("/users/:userId/role", adminController.isAdmin, adminController.updateUserRole)

// Service Management
router.get("/services/pending", adminController.isAdmin, adminController.getPendingServices)
router.get("/services", adminController.isAdmin, adminController.getAllServices)
router.put("/services/:serviceId/approve", adminController.isAdmin, adminController.approveService)
router.put("/services/:serviceId/reject", adminController.isAdmin, adminController.rejectService)


// Booking Management
router.get("/bookings", adminController.isAdmin, adminController.getAllBookings)
router.put("/bookings/:bookingId/status", adminController.isAdmin, adminController.updateBookingStatus)

// Complaint Management
router.get("/complaints", adminController.isAdmin, adminController.getAllComplaints)
router.put("/complaints/:complaintId/status", adminController.isAdmin, adminController.updateComplaintStatus)

// Review Management
router.get("/reviews", adminController.isAdmin, adminController.getAllReviews)
router.delete("/reviews/:reviewId", adminController.isAdmin, adminController.deleteReview)

module.exports = router
