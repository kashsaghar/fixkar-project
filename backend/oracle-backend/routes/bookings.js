const express = require('express');
const router = express.Router();
const connect = require('../db');
const auth = require('../middleware/auth');
const oracledb = require('oracledb');


// GET all bookings for current user
router.get('/me', auth, async (req, res) => {
  try {
    const conn = await connect();
    
    let query;
    let params;
    
    if (req.user.role === 'seeker') {
      // Get bookings made by this user
      query = `
        SELECT b.booking_id, b.booking_date, b.status, b.notes,
               s.service_id, s.title, s.price, s.duration_minutes,
               u.name as provider_name
        FROM bookings b
        JOIN services s ON b.service_id = s.service_id
        JOIN users u ON s.provider_id = u.user_id
        WHERE b.user_id = :1
        ORDER BY b.booking_date DESC
      `;
      params = [req.user.id];
    } else if (req.user.role === 'provider') {
      // Get bookings for services offered by this provider
      query = `
        SELECT b.booking_id, b.booking_date, b.status, b.notes,
               s.service_id, s.title, s.price, s.duration_minutes,
               u.name as customer_name
        FROM bookings b
        JOIN services s ON b.service_id = s.service_id
        JOIN users u ON b.user_id = u.user_id
        WHERE s.provider_id = :1
        ORDER BY b.booking_date DESC
      `;
      params = [req.user.id];
    } else {
      await conn.close();
      return res.status(403).json({ message: 'Unauthorized role' });
    }
    
    const result = await conn.execute(query, params);
    
    // Format the results
    const bookings = result.rows.map(row => {
      const booking = {
        booking_id: row[0],
        booking_date: row[1],
        status: row[2],
        notes: row[3],
        service_id: row[4],
        service_title: row[5],
        service_price: row[6],
        service_duration: row[7]
      };
      
      // Add the appropriate name based on user role
      if (req.user.role === 'seeker') {
        booking.provider_name = row[8];
      } else {
        booking.customer_name = row[8];
      }
      
      return booking;
    });
    
    res.json(bookings);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const conn = await connect();
    
    // Get booking details
    const result = await conn.execute(`
      SELECT b.booking_id, b.booking_date, b.status, b.notes, b.user_id,
             s.service_id, s.title, s.price, s.duration_minutes, s.provider_id,
             u1.name as customer_name, u2.name as provider_name
      FROM bookings b
      JOIN services s ON b.service_id = s.service_id
      JOIN users u1 ON b.user_id = u1.user_id
      JOIN users u2 ON s.provider_id = u2.user_id
      WHERE b.booking_id = :1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const row = result.rows[0];
    const booking = {
      booking_id: row[0],
      booking_date: row[1],
      status: row[2],
      notes: row[3],
      user_id: row[4],
      service_id: row[5],
      service_title: row[6],
      service_price: row[7],
      service_duration: row[8],
      provider_id: row[9],
      customer_name: row[10],
      provider_name: row[11]
    };
    
    // Check if user is authorized to view this booking
    if (req.user.id !== booking.user_id && 
        req.user.id !== booking.provider_id && 
        req.user.role !== 'admin') {
      await conn.close();
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.json(booking);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST new booking
router.post('/', auth, async (req, res) => {
  // Check if user is a seeker
  if (req.user.role !== 'seeker') {
    return res.status(403).json({ message: 'Only customers can book services' });
  }
  
  const { service_id, booking_date, notes } = req.body;
  
  try {
    const conn = await connect();
    
    // Check if service exists and is available
    const serviceCheck = await conn.execute(
      `SELECT is_available FROM services WHERE service_id = :1`,
      [service_id]
    );
    
    if (serviceCheck.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const isAvailable = serviceCheck.rows[0][0] === 1;
    
    if (!isAvailable) {
      await conn.close();
      return res.status(400).json({ message: 'Service is not available for booking' });
    }
    
    // Insert booking
    const result = await conn.execute(
      `INSERT INTO bookings (user_id, service_id, booking_date, status, notes) 
       VALUES (:1, :2, :3, :4, :5)
       RETURNING booking_id INTO :6`,
      [req.user.id, service_id, new Date(booking_date), 'pending', notes, 
       { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
      { autoCommit: true }
    );
    
    const bookingId = result.outBinds[0][0];
    
    res.status(201).json({ 
      message: 'Booking created successfully',
      booking_id: bookingId
    });
    
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update booking status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    const conn = await connect();
    
    // Check if booking exists
    const bookingCheck = await conn.execute(`
      SELECT b.user_id, s.provider_id
      FROM bookings b
      JOIN services s ON b.service_id = s.service_id
      WHERE b.booking_id = :1
    `, [req.params.id]);
    
    if (bookingCheck.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const userId = bookingCheck.rows[0][0];
    const providerId = bookingCheck.rows[0][1];
    
    // Check if user is authorized to update this booking
    const isCustomer = req.user.id === userId;
    const isProvider = req.user.id === providerId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isCustomer && !isProvider && !isAdmin) {
      await conn.close();
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Customers can only cancel bookings
    if (isCustomer && status !== 'cancelled') {
      await conn.close();
      return res.status(403).json({ message: 'Customers can only cancel bookings' });
    }
    
    // Update booking status
    await conn.execute(
      `UPDATE bookings SET status = :1 WHERE booking_id = :2`,
      [status, req.params.id],
      { autoCommit: true }
    );
    
    res.json({ message: 'Booking status updated successfully' });
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;