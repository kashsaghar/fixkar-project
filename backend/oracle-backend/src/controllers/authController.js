// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Prevent admin registration from frontend
    if (role && role.toLowerCase() === 'admin') {
      return res.status(403).json({ message: 'Cannot register admin accounts' });
    }

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await authModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await authModel.createUser(name || null, email, hashedPassword, phone || null, role || 'seeker');

    const payload = { user: { id: userId, role: role || 'seeker' } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      token,
      user: { id: userId, name, email, role: role || 'seeker' }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await authModel.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.is_active !== undefined && Number(user.is_active) === 0) {
      return res.status(403).json({ message: 'Account suspended' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userRow = await authModel.getUserById(req.user.id);
    if (!userRow) return res.status(404).json({ message: 'User not found' });

    // Do not return password
    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role,
      is_active: userRow.is_active
    };

    return res.json(user);
  } catch (err) {
    console.error('Get current user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
