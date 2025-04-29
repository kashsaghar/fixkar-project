const express = require('express');
const router = express.Router();
const connect = require('../db');
const oracledb = require('oracledb');


// GET all categories
router.get('/', async (req, res) => {
  try {
    const conn = await connect();
    const result = await conn.execute(`SELECT * FROM categories ORDER BY name`);
    
    // Format the results
    const categories = result.rows.map(row => ({
      category_id: row[0],
      name: row[1],
      description: row[2]
    }));
    
    res.json(categories);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;