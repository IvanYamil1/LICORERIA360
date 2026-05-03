const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  capacity:  { type: String },
  price:     { type: Number },
  category:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image:     { type: String },
  colsInRow: { type: Number, default: 3, min: 1, max: 6 },
  order:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
