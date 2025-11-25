const connect = require("../config/db")
const oracledb = require("oracledb")

// Get all categories
const getAllCategories = async () => {
  const conn = await connect()
  try {
    const result = await conn.execute(`SELECT category_id, name, description FROM categories ORDER BY name`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    })
    return result.rows
  } finally {
    await conn.close()
  }
}

module.exports = {
  getAllCategories,
}
