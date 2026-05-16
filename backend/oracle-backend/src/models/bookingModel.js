const connect = require("../config/db")
const oracledb = require("oracledb")

// Get bookings by user (seeker)
const getBookingsByUserId = async (userId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT b.booking_id, b.booking_date, b.status, b.notes,
             s.service_id, s.title, s.price, s.duration_minutes,
             u.name as provider_name
      FROM bookings b
      JOIN services s ON b.service_id = s.service_id
      JOIN users u ON s.provider_id = u.user_id
      WHERE b.user_id = :1
      ORDER BY b.booking_date DESC
    `,
      [userId],
    )
    return result.rows
  } finally {
    await conn.close()
  }
}

// Get bookings by provider
const getBookingsByProviderId = async (providerId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT b.booking_id, b.booking_date, b.status, b.notes,
             s.service_id, s.title, s.price, s.duration_minutes,
             u.name as customer_name
      FROM bookings b
      JOIN services s ON b.service_id = s.service_id
      JOIN users u ON b.user_id = u.user_id
      WHERE s.provider_id = :1
      ORDER BY b.booking_date DESC
    `,
      [providerId],
    )
    return result.rows
  } finally {
    await conn.close()
  }
}

// Get booking by ID
const getBookingById = async (bookingId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT b.booking_id, b.booking_date, b.status, b.notes, b.user_id,
             s.service_id, s.title, s.price, s.duration_minutes, s.provider_id,
             u1.name as customer_name, u2.name as provider_name
      FROM bookings b
      JOIN services s ON b.service_id = s.service_id
      JOIN users u1 ON b.user_id = u1.user_id
      JOIN users u2 ON s.provider_id = u2.user_id
      WHERE b.booking_id = :1
    `,
      [bookingId],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } finally {
    await conn.close()
  }
}

// Create booking
const createBooking = async (userId, serviceId, bookingDate, notes) => {
  const conn = await connect()
  try {
    const binds = {
      user_id: userId,
      service_id: serviceId,
      booking_date: new Date(bookingDate),
      status: "pending",
      notes: notes || null,
      booking_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }

    const result = await conn.execute(
      `INSERT INTO bookings (user_id, service_id, booking_date, status, notes)
       VALUES (:user_id, :service_id, :booking_date, :status, :notes)
       RETURNING booking_id INTO :booking_id`,
      binds,
      { autoCommit: true },
    )

    return result.outBinds.booking_id[0]
  } finally {
    await conn.close()
  }
}

// Check if service exists and is available
const checkServiceAvailability = async (serviceId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(`SELECT is_available FROM services WHERE service_id = :1`, [serviceId])
    return result.rows.length > 0 && result.rows[0][0] === 1
  } finally {
    await conn.close()
  }
}

// Get booking authorization info
const getBookingAuthInfo = async (bookingId) => {
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

// Update booking status
const updateBookingStatus = async (bookingId, status) => {
  const conn = await connect()
  try {
    await conn.execute(`UPDATE bookings SET status = :1 WHERE booking_id = :2`, [status, bookingId], {
      autoCommit: true,
    })
  } finally {
    await conn.close()
  }
}

module.exports = {
  getBookingsByUserId,
  getBookingsByProviderId,
  getBookingById,
  createBooking,
  checkServiceAvailability,
  getBookingAuthInfo,
  updateBookingStatus,
}
