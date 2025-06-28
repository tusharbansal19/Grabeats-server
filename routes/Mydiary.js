const express = require("express");
const DiaryEntry = require("../models/DiaryEntry");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

// Middleware for basic authentication
const verifyKey = (req, res, next) => {
  const { accessKey } = req.headers;
  const validKey = "12345"; // Replace with a secure method for real apps
  if (accessKey === validKey) {
      console.log("middleware")
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
    res.status(201).json({ 
      success: true,
      message: "Diary entry saved successfully!",
      data: newEntry
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: "Failed to save the diary entry",
      details: err.message
    });
  }
});

// Get all diary entries for a user
router.get("/getDiaryEntries/:userId", verifyKey, async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await DiaryEntry.find({ userId })
      .sort({ date: -1 })
      .select('-__v');
    
    res.status(200).json({
      success: true,
      message: "Diary entries retrieved successfully",
      data: entries,
      count: entries.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve diary entries",
      details: err.message
    });
  }
});

// Get diary entry by ID
router.get("/getDiaryEntry/:id", verifyKey, async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Diary entry not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Diary entry retrieved successfully",
      data: entry
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve diary entry",
      details: err.message
    });
  }
});

// Update diary entry
router.put("/updateDiaryEntry/:id", verifyKey, async (req, res) => {
  try {
    const { entry } = req.body;
    if (!entry) {
      return res.status(400).json({
        success: false,
        error: "Entry content is required"
      });
    }

    const updatedEntry = await DiaryEntry.findByIdAndUpdate(
      req.params.id,
      { entry },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({
        success: false,
        error: "Diary entry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Diary entry updated successfully",
      data: updatedEntry
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to update diary entry",
      details: err.message
    });
  }
});

// Delete diary entry
router.delete("/deleteDiaryEntry/:id", verifyKey, async (req, res) => {
  try {
    const deletedEntry = await DiaryEntry.findByIdAndDelete(req.params.id);
    
    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        error: "Diary entry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Diary entry deleted successfully",
      data: deletedEntry
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to delete diary entry",
      details: err.message
    });
  }
});

// Get diary statistics
router.get("/diaryStats/:userId", verifyKey, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = await DiaryEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          firstEntry: { $min: '$date' },
          lastEntry: { $max: '$date' },
          avgEntryLength: { $avg: { $strLenCP: '$entry' } }
        }
      },
      {
        $project: {
          _id: 0,
          totalEntries: 1,
          firstEntry: 1,
          lastEntry: 1,
          avgEntryLength: { $round: ['$avgEntryLength', 2] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Diary statistics retrieved successfully",
      data: stats[0] || {
        totalEntries: 0,
        firstEntry: null,
        lastEntry: null,
        avgEntryLength: 0
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve diary statistics",
      details: err.message
    });
  }
});

// Export the router
module.exports = router;
