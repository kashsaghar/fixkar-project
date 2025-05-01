const express = require("express")
const router = express.Router()
const connect = require("../db")
const oracledb = require("oracledb")

// GET all categories
router.get("/", async (req, res) => {
  let conn
  try {
    conn = await connect()
    
    const result = await conn.execute(
      `SELECT category_id, name, description FROM categories ORDER BY name`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const categories = result.rows.map(row => ({
      category_id: row.CATEGORY_ID,
      name: row.NAME,
      description: row.DESCRIPTION
    }))

    res.json(categories)
  } catch (err) {
    console.error("Error fetching categories:", err)
    res.status(500).json({ error: err.message })
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (err) {
        console.error("Error closing connection:", err)
      }
    }
  }
})

module.exports = router