const connect = require("../config/db")
const oracledb = require("oracledb")

// Check if user exists by email
const getUserByEmail = async (email) => {
  const conn = await connect()
  try {
    const result = await conn.execute(`SELECT * FROM users WHERE email = :1`, [email])
    return result.rows.length > 0 ? result.rows[0] : null
  } finally {
    await conn.close()
  }
}

// Create new user
const createUser = async (name, email, hashedPassword, phone, role) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES (:1, :2, :3, :4, :5) 
       RETURNING user_id INTO :6`,
      [name, email, hashedPassword, phone, role, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
      { autoCommit: true },
    )
    return result.outBinds[0][0]
  } finally {
    await conn.close()
  }
}

// Get user by ID
const getUserById = async (userId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(`SELECT user_id, name, email, phone, role FROM users WHERE user_id = :1`, [
      userId,
    ])
    return result.rows.length > 0 ? result.rows[0] : null
  } finally {
    await conn.close()
  }
}

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
}
