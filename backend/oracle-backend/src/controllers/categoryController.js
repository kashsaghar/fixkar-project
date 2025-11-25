const categoryModel = require("../models/categoryModel")

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categoryRows = await categoryModel.getAllCategories()

    const categories = categoryRows.map((row) => ({
      category_id: row.CATEGORY_ID,
      name: row.NAME,
      description: row.DESCRIPTION,
    }))

    res.json(categories)
  } catch (err) {
    console.error("Error fetching categories:", err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getAllCategories,
}
