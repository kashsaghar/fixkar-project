const connect = require("../config/db");

// Create complaint
const createComplaint = async (bookingId, userId, title, description) => {
  const conn = await connect();
  try {
    await conn.execute(
      `INSERT INTO complaints (booking_id, user_id, title, description, status, created_at) 
       VALUES (:1, :2, :3, :4, :5, SYSDATE)`,
      [bookingId, userId, title, description, "pending"], // status set to pending
      { autoCommit: true }
    );
    return bookingId;
  } finally {
    await conn.close();
  }
};

// Get booking info for complaint validation
const getBookingForComplaint = async (bookingId) => {
  const conn = await connect();
  try {
    const result = await conn.execute(
      `SELECT b.user_id, s.provider_id
       FROM bookings b
       JOIN services s ON b.service_id = s.service_id
       WHERE b.booking_id = :1`,
      [bookingId]
    );
    return result.rows.length > 0 ? { user_id: result.rows[0][0], provider_id: result.rows[0][1] } : null;
  } finally {
    await conn.close();
  }
};

// Get complaints by user
const getComplaintsByUserId = async (userId) => {
  const conn = await connect();
  try {
    const result = await conn.execute(
      `SELECT c.complaint_id, c.booking_id, c.title, c.description, c.status, c.created_at,
              b.service_id, s.title AS service_title
       FROM complaints c
       JOIN bookings b ON c.booking_id = b.booking_id
       JOIN services s ON b.service_id = s.service_id
       WHERE c.user_id = :1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      complaint_id: row[0],
      booking_id: row[1],
      title: row[2],
      description: row[3],
      status: row[4],
      created_at: row[5],
      service_id: row[6],
      service_title: row[7],
    }));
  } finally {
    await conn.close();
  }
};

module.exports = {
  createComplaint,
  getBookingForComplaint,
  getComplaintsByUserId
};
