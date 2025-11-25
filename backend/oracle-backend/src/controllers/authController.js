const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const authModel = require("../models/authModel")

// Register a user
const register = async (req, res) => {
  const { name, email, password, phone, role } = req.body

  try {
    // Check if user exists
    const existingUser = await authModel.getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const userId = await authModel.createUser(name, email, hashedPassword, phone, role)

    // Create JWT payload
    const payload = {
      user: {
        id: userId,
        role: role,
      },
    }

    // Sign token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" }, (err, token) => {
      if (err) throw err
      res.json({ token, user: { id: userId, name, email, role } })
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error" })
  }
}

// Authenticate user & get token
const login = async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if user exists
    const user = await authModel.getUserByEmail(email)
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const userData = {
      id: user[0],
      name: user[1],
      email: user[2],
      password: user[3],
      phone: user[4],
      role: user[5],
    }

    // Check password
    const isMatch = await bcrypt.compare(password, userData.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create JWT payload
    const payload = {
      user: {
        id: userData.id,
        role: userData.role,
      },
    }

    // Sign token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        },
      })
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error" })
  }
}

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const userRow = await authModel.getUserById(req.user.id)

    if (!userRow) {
      return res.status(404).json({ message: "User not found" })
    }

    const user = {
      id: userRow[0],
      name: userRow[1],
      email: userRow[2],
      phone: userRow[3],
      role: userRow[4],
    }

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
}
