const mongoose = require('mongoose');

const DiaryEntrySchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  entry: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for better query performance
DiaryEntrySchema.index({ userId: 1, date: -1 });

const DiaryEntry = mongoose.model('DiaryEntry', DiaryEntrySchema);

module.exports = DiaryEntry; 