const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const connect = require('../db');
const oracledb = require('oracledb');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    const conn = await connect();
    
    // Check if user exists
    const userCheck = await conn.execute(
      `SELECT * FROM users WHERE email = :1`,
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      await conn.close();
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    const result = await conn.execute(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES (:1, :2, :3, :4, :5) 
       RETURNING user_id INTO :6`,
      [name, email, hashedPassword, phone, role, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
      { autoCommit: true }
    );
    
    const userId = result.outBinds[0][0];
    
    // Create JWT payload
    const payload = {
      user: {
        id: userId,
        role: role
      }
    };
    
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: userId, name, email, role } });
      }
    );
    
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const conn = await connect();
    
    // Check if user exists
    const result = await conn.execute(
      `SELECT user_id, name, email, password, role FROM users WHERE email = :1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      await conn.close();
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = {
      id: result.rows[0][0],
      name: result.rows[0][1],
      email: result.rows[0][2],
      password: result.rows[0][3],
      role: result.rows[0][4]
    };
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      await conn.close();
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          } 
        });
      }
    );
    
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const conn = await connect();
    
    const result = await conn.execute(
      `SELECT user_id, name, email, phone, role FROM users WHERE user_id = :1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = {
      id: result.rows[0][0],
      name: result.rows[0][1],
      email: result.rows[0][2],
      phone: result.rows[0][3],
      role: result.rows[0][4]
    };
    
    res.json(user);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;