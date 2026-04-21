const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['normal', 'featured', 'hero', 'footer'],
    default: 'normal',
  },
  title:       { type: String },
  subtitle:    { type: String },
  price:       { type: String },
  priceSuffix: { type: String },
  image:       { type: String },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
