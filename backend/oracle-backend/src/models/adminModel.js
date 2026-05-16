const connect = require("../config/db")
const oracledb = require("oracledb")

const mapRowsToObjects = (rows, columns) => {
  if (!rows || rows.length === 0) return []
  return rows.map((row) => {
    const obj = {}
    columns.forEach((col, index) => {
      obj[col] = row[index]
    })
    return obj
  })
}

// Get all users (with pagination)
const getAllUsers = async (limit = 50, offset = 0) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT user_id, name, email, phone, role, created_at, is_active
      FROM users where user_id <> 63
      ORDER BY created_at DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `,
      { offset, limit },
    )
    const users = mapRowsToObjects(result.rows, [
      "user_id",
      "name",
      "email",
      "phone",
      "role",
      "created_at",
      "is_active",
    ])
    return users
  } finally {
    await conn.close()
  }
}

// Get user count by role
const getUserCountByRole = async () => {
  const conn = await connect()
  try {
    const result = await conn.execute(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `)
    return mapRowsToObjects(result.rows, ["role", "count"])
  } finally {
    await conn.close()
  }
}

// Get total users count
const getTotalUsersCount = async () => {
  const conn = await connect()
  try {
    const result = await conn.execute(`SELECT COUNT(*) as total FROM users`)
    return result.rows[0][0] || 0
  } finally {
    await conn.close()
  }
}

// Suspend user
const suspendUser = async (userId) => {
  const conn = await connect()
  try {
    await conn.execute(
      `
      UPDATE users
      SET is_active = 0
      WHERE user_id = :1
    `,
      [userId],
      { autoCommit: true }
    );
  } finally {
    await conn.close()
  }
}

// Activate user
const activateUser = async (userId) => {
  const conn = await connect()
  try {
    await conn.execute(
      `
      UPDATE users
      SET is_active = 1
      WHERE user_id = :1
    `,
      [userId],
      { autoCommit: true }
    )
  } finally {
    await conn.close()
  }
}

const deleteUser = async (userId) => {
  const conn = await connect()
  try {
    const id = Number(userId)

    // 1. Delete reviews made by this user's bookings
    await conn.execute(
      `DELETE FROM reviews WHERE booking_id IN (SELECT booking_id FROM bookings WHERE user_id = :id OR provider_id = :id)`,
      { id }
    )

    // 2. Delete complaints made by this user or related to their bookings
    await conn.execute(
      `DELETE FROM complaints WHERE user_id = :id OR booking_id IN (SELECT booking_id FROM bookings WHERE user_id = :id OR user_id = :id)`,
      { id }
    )

    // 3. Delete bookings made by or assigned to this user
    await conn.execute(
      `DELETE FROM bookings WHERE user_id = :id`,
      { id }
    )

    // 4. Delete services posted by this user
    await conn.execute(
      `DELETE FROM services WHERE provider_id = :id`,
      { id }
    )

    // 5. Finally delete the user
    await conn.execute(
      `DELETE FROM users WHERE user_id = :id`,
      { id }
    )

    await conn.commit()
  } finally {
    await conn.close()
  }
}


// Update user role
const updateUserRole = async (userId, newRole) => {
  const conn = await connect()
  try {
    await conn.execute(
      `
      UPDATE users
      SET role = :1
      WHERE user_id = :2
    `,
      [newRole, userId],
      { autoCommit: true }
    )
  } finally {
    await conn.close()
  }
}

// Get pending services for approval
const getPendingServices = async () => {
  const conn = await connect()
  try {
    const result = await conn.execute(`
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes,
             s.category_id, s.location, s.created_at, s.provider_id,
             u.name as provider_name, c.name as category_name
      FROM services s
      JOIN users u ON s.provider_id = u.user_id
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.is_available = 0
      ORDER BY s.created_at DESC
    `)
    return mapRowsToObjects(result.rows, [
      "service_id",
      "title",
      "description",
      "price",
      "duration_minutes",
      "category_id",
      "location",
      "created_at",
      "provider_id",
      "provider_name",
      "category_name",
    ])
  } finally {
    await conn.close()
  }
}

// Approve service
const approveService = async (serviceId) => {
  const conn = await connect()
  try {
    await conn.execute(
      `
      UPDATE services
      SET is_available = 1
      WHERE service_id = :1
    `,
      [serviceId],
      { autoCommit: true }
    )
  } finally {
    await conn.close()
  }
}

// Reject service
const rejectService = async (serviceId) => {
  const conn = await connect()
  try {
    await conn.execute(
      `
      DELETE FROM services
      WHERE service_id = :1
    `,
      [serviceId],
      { autoCommit: true }
    )
  } finally {
    await conn.close()
  }
}

// Get all services
const getAllServices = async (limit = 50, offset = 0) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT s.service_id, s.title, s.price, s.is_available, s.provider_id,
             u.name as provider_name, COUNT(b.booking_id) as booking_count
      FROM services s
      JOIN users u ON s.provider_id = u.user_id
      LEFT JOIN bookings b ON s.service_id = b.service_id
      GROUP BY s.service_id, s.title, s.price, s.is_available, s.provider_id, u.name
      ORDER BY s.service_id DESC
      OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY
    `,
      [offset, limit],
    )
    return mapRowsToObjects(result.rows, [
      "service_id",
      "title",
      "price",
      "is_available",
      "provider_id",
      "provider_name",
      "booking_count",
    ])
  } finally {
    await conn.close()
  }
}

// Get all bookings
const getAllBookings = async (limit = 50, offset = 0) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT b.booking_id, b.status, b.booking_date, b.notes,
             s.title, s.price, u1.name as customer_name, u2.name as provider_name
      FROM bookings b
      JOIN services s ON b.service_id = s.service_id
      JOIN users u1 ON b.user_id = u1.user_id
      JOIN users u2 ON s.provider_id = u2.user_id
      ORDER BY b.booking_date DESC
      OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY
    `,
      [offset, limit],
    )
    return mapRowsToObjects(result.rows, [
      "booking_id",
      "status",
      "booking_date",
      "notes",
      "title",
      "price",
      "customer_name",
      "provider_name",
    ])
  } finally {
    await conn.close()
  }
}

// Get booking stats
const getBookingStats = async () => {
  const conn = await connect()
  try {
    const result = await conn.execute(`
      SELECT COUNT(*) as total_bookings, SUM(price) as total_revenue
      FROM bookings
    `)
    return mapRowsToObjects(result.rows, ["total_bookings", "total_revenue"])
  } finally {
    await conn.close()
  }
}

// Update booking status
const updateBookingStatus = async (bookingId, newStatus) => {
  const conn = await connect()
  try {
    await conn.execute(
      `
      UPDATE bookings
      SET status = :1
      WHERE booking_id = :2
    `,
      [newStatus, bookingId],
      { autoCommit: true }
    )
  } finally {
    await conn.close()
  }
}

// Get all complaints
const getAllComplaints = async (limit = 50, offset = 0) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT c.complaint_id, c.booking_id, c.description, c.status, c.created_at,
             s.title as service_title, u1.name as complainant_name, u2.name as provider_name
      FROM complaints c
      JOIN bookings b ON c.booking_id = b.booking_id
      JOIN services s ON b.service_id = s.service_id
      JOIN users u1 ON c.user_id = u1.user_id
      JOIN users u2 ON s.provider_id = u2.user_id
      ORDER BY c.created_at DESC
      OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY
    `,
      [offset, limit],
    )
    return mapRowsToObjects(result.rows, [
      "complaint_id",
      "booking_id",
      "description",
      "status",
      "created_at",
      "service_title",
      "complainant_name",
      "provider_name",
    ])
  } finally {
    await conn.close()
  }
}

// Update complaint status
const updateComplaintStatus = async (complaintId, newStatus) => {
  const conn = await connect()
  try {
    await conn.execute(
      `
      UPDATE complaints
      SET status = :1
      WHERE complaint_id = :2
    `,
      [newStatus, complaintId],
      { autoCommit: true }
    )
  } finally {
    await conn.close()
  }
}

// Get all reviews
const getAllReviews = async (limit = 50, offset = 0) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT r.review_id, r.rating, r.comments, r.review_date,
             s.title as service_title, u1.name as reviewer_name, u2.name as provider_name
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.booking_id
      JOIN services s ON b.service_id = s.service_id
      JOIN users u1 ON b.user_id = u1.user_id
      JOIN users u2 ON s.provider_id = u2.user_id
      ORDER BY r.review_date DESC
      OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY
    `,
      [offset, limit],
    )
    return mapRowsToObjects(result.rows, [
      "review_id",
      "rating",
      "comments",
      "review_date",
      "service_title",
      "reviewer_name",
      "provider_name",
    ])
  } finally {
    await conn.close()
  }
}

// Delete review
const deleteReview = async (reviewId) => {
  const conn = await connect()
  try {
    await conn.execute(
      `
      DELETE FROM reviews
      WHERE review_id = :1
    `,
      [reviewId],
      { autoCommit: true }
    )
  } finally {
    await conn.close()
  }
}

// Get dashboard stats
const getDashboardStats = async () => {
  const conn = await connect()
  try {
    const [
      totalUsersResult,
      totalProvidersResult,
      totalSeekersResult,
      totalBookingsResult,
      completedBookingsResult,
      pendingComplaintsResult,
    ] = await Promise.all([
      conn.execute(`SELECT COUNT(*) as total FROM users`),
      conn.execute(`SELECT COUNT(*) as total FROM users WHERE role = 'provider'`),
      conn.execute(`SELECT COUNT(*) as total FROM users WHERE role = 'seeker'`),
      conn.execute(`SELECT COUNT(*) as total FROM bookings`),
      conn.execute(`SELECT COUNT(*) as total FROM bookings WHERE status = 'completed'`),
      conn.execute(`SELECT COUNT(*) as total FROM complaints WHERE status = 'open'`),
    ])

    return {
      total_users: totalUsersResult.rows[0][0] || 0,
      total_providers: totalProvidersResult.rows[0][0] || 0,
      total_seekers: totalSeekersResult.rows[0][0] || 0,
      total_bookings: totalBookingsResult.rows[0][0] || 0,
      completed_bookings: completedBookingsResult.rows[0][0] || 0,
      pending_complaints: pendingComplaintsResult.rows[0][0] || 0,
    }
  } catch (error) {
    console.error("[v0] getDashboardStats error:", error)
    throw error
  } finally {
    await conn.close()
  }
}

module.exports = {
  getAllUsers,
  getUserCountByRole,
  getTotalUsersCount,
  suspendUser,
  activateUser,
  deleteUser,
  updateUserRole,
  getPendingServices,
  approveService,
  rejectService,
  getAllServices,
  getAllBookings,
  getBookingStats,
  updateBookingStatus,
  getAllComplaints,
  updateComplaintStatus,
  getAllReviews,
  deleteReview,
  getDashboardStats,
}
