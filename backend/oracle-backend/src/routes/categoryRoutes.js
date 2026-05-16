const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/categoryController")

// GET all categories
router.get("/", categoryController.getAllCategories)

router.get("/:id", categoryController.getCategoryById)


module.exports = router
