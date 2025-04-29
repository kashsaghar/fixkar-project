const express = require('express');
const router = express.Router();
const connect = require('../db');
const auth = require('../middleware/auth');
const oracledb = require('oracledb');


// POST new complaint
router.post('/', auth, async (req, res) => {
  const { booking_id, description } = req.body;
  
  try {
    const conn = await connect();
    
    // Check if booking exists
    const bookingCheck = await conn.execute(`
      SELECT b.user_id, s.provider_id
      FROM bookings b
      JOIN services s ON b.service_id = s.service_id
      WHERE b.booking_id = :1
    `, [booking_id]);
    
    if (bookingCheck.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const userId = bookingCheck.rows[0][0];
    const providerId = bookingCheck.rows[0][1];
    
    // Check if user is related to this booking
    if (req.user.id !== userId && req.user.id !== providerId) {
      await conn.close();
      return res.status(403).json({ message: 'Not authorized to file a complaint for this booking' });
    }
    
    // Insert complaint
    const result = await conn.execute(
      `INSERT INTO complaints (booking_id, user_id, description, status, created_at) 
       VALUES (:1, :2, :3, :4, :5)
       RETURNING complaint_id INTO :6`,
      [booking_id, req.user.id, description, 'pending', new Date(), 
       { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
      { autoCommit: true }
    );
    
    const complaintId = result.outBinds[0][0];
    
    res.status(201).json({ 
      message: 'Complaint filed successfully',
      complaint_id: complaintId
    });
    
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET complaints for current user
router.get('/me', auth, async (req, res) => {
  try {
    const conn = await connect();
    
    const result = await conn.execute(`
      SELECT c.complaint_id, c.booking_id, c.description, c.status, c.created_at,
             b.service_id, s.title as service_title
      FROM complaints c
      JOIN bookings b ON c.booking_id = b.booking_id
      JOIN services s ON b.service_id = s.service_id
      WHERE c.user_id = :1
      ORDER BY c.created_at DESC
    `, [req.user.id]);
    
    // Format the results
    const complaints = result.rows.map(row => ({
      complaint_id: row[0],
      booking_id: row[1],
      description: row[2],
      status: row[3],
      created_at: row[4],
      service_id: row[5],
      service_title: row[6]
    }));
    
    res.json(complaints);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;