const express = require("express");
const Task = require("../models/Task");
const {  } = require("./authRoutes");
const router = express.Router();

// Create a new task
router.post("/",  async (req, res) => {
  try {
    const { title, description, status, dueDate, day } = req.body;
    const task = new Task({ title, description, status, dueDate, day, userId: req.userId });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks for the d user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task
router.put("/:id",  async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await Task.findOneAndUpdate({ _id: id, userId: req.userId }, updates, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
