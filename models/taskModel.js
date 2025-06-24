// models/taskModel.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'incomplete', 'pending'],
    default: 'pending',
  },
  hours: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('DailyTask', taskSchema);
