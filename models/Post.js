const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Anonymous' },
  views: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },
  link:{type: String},
  comments: [
    {
      user: { type: String, required: true },
      comment: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
