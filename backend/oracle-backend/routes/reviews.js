const express = require('express');
const router = express.Router();
const connect = require('../db');
const auth = require('../middleware/auth');
const oracledb = require('oracledb');


// GET reviews for a service
router.get('/service/:serviceId', async (req, res) => {
  try {
    const conn = await connect();
    
    const result = await conn.execute(`
      SELECT r.review_id, r.rating, r.comment, r.review_date,
             u.name as user_name
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.booking_id
      JOIN users u ON b.user_id = u.user_id
      WHERE b.service_id = :1
      ORDER BY r.review_date DESC
    `, [req.params.serviceId]);
    
    // Format the results
    const reviews = result.rows.map(row => ({
      review_id: row[0],
      rating: row[1],
      comment: row[2],
      review_date: row[3],
      user_name: row[4]
    }));
    
    res.json(reviews);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST new review
router.post('/', auth, async (req, res) => {
  // Check if user is a seeker
  if (req.user.role !== 'seeker') {
    return res.status(403).json({ message: 'Only customers can leave reviews' });
  }
  
  const { booking_id, rating, comment } = req.body;
  
  try {
    const conn = await connect();
    
    // Check if booking exists and belongs to the user
    const bookingCheck = await conn.execute(`
      SELECT status, user_id FROM bookings WHERE booking_id = :1
    `, [booking_id]);
    
    if (bookingCheck.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const bookingStatus = bookingCheck.rows[0][0];
    const bookingUserId = bookingCheck.rows[0][1];
    
    // Check if user is the booking owner
    if (req.user.id !== bookingUserId) {
      await conn.close();
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }
    
    // Check if booking is completed
    if (bookingStatus !== 'completed') {
      await conn.close();
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }
    
    // Check if review already exists
    const reviewCheck = await conn.execute(
      `SELECT review_id FROM reviews WHERE booking_id = :1`,
      [booking_id]
    );
    
    if (reviewCheck.rows.length > 0) {
      await conn.close();
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }
    
    // Insert review
    const result = await conn.execute(
      `INSERT INTO reviews (booking_id, rating, comment, review_date) 
       VALUES (:1, :2, :3, :4)
       RETURNING review_id INTO :5`,
      [booking_id, rating, comment, new Date(), 
       { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
      { autoCommit: true }
    );
    
    const reviewId = result.outBinds[0][0];
    
    res.status(201).json({ 
      message: 'Review submitted successfully',
      review_id: reviewId
    });
    
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;