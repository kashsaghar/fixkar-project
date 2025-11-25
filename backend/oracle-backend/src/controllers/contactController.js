const contactModel = require("../models/contactModel")

// Create message
const createMessage = async (req, res) => {
  const { name, email, message } = req.body

  try {
    await contactModel.createMessage(name, email, message)

    res.status(201).json({
      message: "Your message has been sent",
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createMessage,
}
