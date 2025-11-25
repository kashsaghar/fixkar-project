const oracledb = require("oracledb")

let pool

// Initialize connection pool
const initializePool = async () => {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    })
    console.log("[v0] Oracle database pool created successfully")
  } catch (error) {
    console.error("[v0] Error creating database pool:", error.message)
    throw error
  }
}

// Get connection from pool
const getConnection = async () => {
  if (!pool) {
    await initializePool()
  }
  try {
    return await pool.getConnection()
  } catch (error) {
    console.error("[v0] Error getting connection from pool:", error.message)
    throw error
  }
}

module.exports = getConnection
