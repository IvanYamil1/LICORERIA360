const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:         { type: String, required: true },
  image:        { type: String },
  headerImage:  { type: String },
  footerImage:  { type: String },
  order:        { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
