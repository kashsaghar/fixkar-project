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

const getCategoryById = async (req, res) => {
  try {
    const category_id = req.params.id;

    const rows = await categoryModel.getCategoryById(category_id);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    const category = {
      category_id: rows[0].CATEGORY_ID,
      name: rows[0].NAME,
      description: rows[0].DESCRIPTION,
    };

    res.json(category); // return ONE object
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getAllCategories,
  getCategoryById,
}
