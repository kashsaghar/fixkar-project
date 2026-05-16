const connect = require("../config/db")
const oracledb = require("oracledb")

// Get reviews for a service
const getServiceReviews = async (serviceId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT r.review_id, r.rating, r.comments, r.review_date,
             u.name as user_name
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.booking_id
      JOIN users u ON b.user_id = u.user_id
      WHERE b.service_id = :1
      ORDER BY r.review_date DESC
    `,
      [serviceId],
    )
    return result.rows
  } finally {
    await conn.close()
  }
}

// Check if review exists
const reviewExists = async (bookingId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(`SELECT review_id FROM reviews WHERE booking_id = :1`, [bookingId])
    return result.rows.length > 0
  } finally {
    await conn.close()
  }
}

// Get booking info for review validation
const getBookingForReview = async (bookingId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT status, user_id FROM bookings WHERE booking_id = :1
    `,
      [bookingId],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } finally {
    await conn.close()
  }
}

const createReview = async (bookingId, rating, comments) => {
  const conn = await connect()
  try {
    await conn.execute(
      `INSERT INTO reviews (booking_id, rating, comments) 
       VALUES (:1, :2, :3)`,
      [bookingId, rating, comments],
      { autoCommit: true },
    )
    // Return booking_id to confirm creation (review_id will be auto-generated)
    return bookingId
  } finally {
    await conn.close()
  }
}

module.exports = {
  getServiceReviews,
  reviewExists,
  getBookingForReview,
  createReview,
}
