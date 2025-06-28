const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "incomplete" },
    dueDate: { type: Date, required: true },
    day: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
}, {
    timestamps: true
});
  
module.exports = mongoose.model("Task", taskSchema);