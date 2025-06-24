const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

// Define Schema and Model
const DiaryEntrySchema = new mongoose.Schema({
 
  entry: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const DiaryEntry = mongoose.model("DiaryEntry", DiaryEntrySchema);

// Middleware for basic authentication
const verifyKey = (req, res, next) => {
  const { accessKey } = req.headers;
  const validKey = "12345"; // Replace with a secure method for real apps
  if (accessKey === validKey) {
      console.log("mddle wore")
    next();
  } else {
    res.status(401).json({ message: "Invalid access key" });
  }
};

// Routes

// Save a new diary entry
router.post("/saveDiaryEntry", verifyKey, async (req, res) => {
  try {
    const { userId, entry } = req.body;
    if (!entry || !userId) {
      return res.status(400).json({ error: "User ID and entry content are required" });
    }

    const newEntry = new DiaryEntry({ userId, entry });
    await newEntry.save();
    res.status(201).json({ message: "Diary entry saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save the diary entry" });
  }
});

// Export the router
module.exports = router;
