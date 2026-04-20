const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
