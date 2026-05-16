const adminModel = require("../models/adminModel")

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." })
  }
  next()
}

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    console.log("[v0] Getting dashboard stats")
    const stats = await adminModel.getDashboardStats()

    const formattedStats = {
      totalUsers: stats.total_users,
      totalBookings: stats.total_bookings,
      completedBookings: stats.completed_bookings || 0,
      pendingComplaints: stats.pending_complaints || 0,
      totalProviders: stats.total_providers || 0,
      totalSeekers: stats.total_seekers || 0,
    }

    console.log("[v0] Dashboard stats:", formattedStats)
    res.json(formattedStats)
  } catch (error) {
    console.error("[v0] Dashboard error:", error)
    res.status(500).json({ message: "Failed to fetch dashboard stats" })
  }
}

// Get all users
const getUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const users = await adminModel.getAllUsers(Number.parseInt(limit), Number.parseInt(offset))
    const total = await adminModel.getTotalUsersCount()
    res.json({ users, total })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" })
  }
}

// Suspend user
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params
    await adminModel.suspendUser(userId)
    res.json({ message: "User suspended successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to suspend user" })
  }
}

// Activate user
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params
    await adminModel.activateUser(userId)
    res.json({ message: "User activated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to activate user" })
  }
}

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId)
    await adminModel.deleteUser(userId)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error) // <-- log full Oracle error
    res.status(500).json({ message: error.message || "Failed to delete user" })
  }
}

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body
    await adminModel.updateUserRole(userId, role)
    res.json({ message: "User role updated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role" })
  }
}

// Get pending services
const getPendingServices = async (req, res) => {
  try {
    const services = await adminModel.getPendingServices()
    res.json(services)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending services" })
  }
}

// Get all services
const getAllServices = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const services = await adminModel.getAllServices(Number.parseInt(limit), Number.parseInt(offset))
    res.json(services)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch services" })
  }
}

// Approve service
const approveService = async (req, res) => {
  try {
    const { serviceId } = req.params
    await adminModel.approveService(serviceId)
    res.json({ message: "Service approved successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to approve service" })
  }
}

// Reject service
const rejectService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    await adminModel.rejectService(serviceId)
    res.json({ message: "Service rejected successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to reject service" })
  }
}

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const bookings = await adminModel.getAllBookings(Number.parseInt(limit), Number.parseInt(offset))
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" })
  }
}

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { status } = req.body
    await adminModel.updateBookingStatus(bookingId, status)
    res.json({ message: "Booking status updated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking status" })
  }
}

// Get all complaints
const getAllComplaints = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const complaints = await adminModel.getAllComplaints(Number.parseInt(limit), Number.parseInt(offset))
    res.json(complaints)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints" })
  }
}

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params
    const { status } = req.body
    await adminModel.updateComplaintStatus(complaintId, status)
    res.json({ message: "Complaint status updated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to update complaint status" })
  }
}

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const reviews = await adminModel.getAllReviews(Number.parseInt(limit), Number.parseInt(offset))
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" })
  }
}

// Delete review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    await adminModel.deleteReview(reviewId)
    res.json({ message: "Review deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" })
  }
}

module.exports = {
  isAdmin,
  getDashboardStats,
  getUsers,
  suspendUser,
  activateUser,
  deleteUser,
  updateUserRole,
  getPendingServices,
  getAllServices,
  approveService,
  rejectService,
  getAllBookings,
  updateBookingStatus,
  getAllComplaints,
  updateComplaintStatus,
  getAllReviews,
  deleteReview,
}
