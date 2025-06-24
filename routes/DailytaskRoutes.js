// routes/taskRoutes.js
const express = require('express');
const Task = require('../models/taskModel');
const router = express.Router();
const cron = require('node-cron'); // For scheduling tasks

// Schedule a task to delete all tasks at 3:00 AM every day
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('Deleting all tasks at 3:00 AM');
    await Task.deleteMany({});
    console.log('All tasks deleted');
  } catch (error) {
    console.error('Error deleting tasks:', error);
  }
});

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Add a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, status, hours } = req.body;
    const newTask = new Task({
      title,
      description,
      dueDate,
      status,
      hours,
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error adding task" });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, status, hours } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, status, hours },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

module.exports = router;
