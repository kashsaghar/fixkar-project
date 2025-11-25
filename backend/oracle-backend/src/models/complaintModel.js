const connect = require("../config/db")
const oracledb = require("oracledb")

// Get booking info for complaint validation
const getBookingForComplaint = async (bookingId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT b.user_id, s.provider_id
      FROM bookings b
      JOIN services s ON b.service_id = s.service_id
      WHERE b.booking_id = :1
    `,
      [bookingId],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } finally {
    await conn.close()
  }
}

// Create complaint
const createComplaint = async (bookingId, userId, description) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `INSERT INTO complaints (booking_id, user_id, description, status, created_at) 
       VALUES (:1, :2, :3, :4, :5)
       RETURNING complaint_id INTO :6`,
      [bookingId, userId, description, "pending", new Date(), { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
      { autoCommit: true },
    )
    return result.outBinds[0][0]
  } finally {
    await conn.close()
  }
}

// Get complaints by user
const getComplaintsByUserId = async (userId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT c.complaint_id, c.booking_id, c.description, c.status, c.created_at,
             b.service_id, s.title as service_title
      FROM complaints c
      JOIN bookings b ON c.booking_id = b.booking_id
      JOIN services s ON b.service_id = s.service_id
      WHERE c.user_id = :1
      ORDER BY c.created_at DESC
    `,
      [userId],
    )
    return result.rows
  } finally {
    await conn.close()
  }
}

module.exports = {
  getBookingForComplaint,
  createComplaint,
  getComplaintsByUserId,
}
