const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String },
    description: { type: String, required: true },
    language: { type: String, enum: ['Marathi', 'English'], required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
