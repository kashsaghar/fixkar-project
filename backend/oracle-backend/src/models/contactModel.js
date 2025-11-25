const connect = require("../config/db")

// Create message
const createMessage = async (name, email, message) => {
  const conn = await connect()
  try {
    await conn.execute(
      `INSERT INTO messages (name, email, message) VALUES (:name, :email, :message)`,
      { name, email, message },
      { autoCommit: true },
    )
  } finally {
    await conn.close()
  }
}

module.exports = {
  createMessage,
}
