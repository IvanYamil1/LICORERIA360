const mongoose = require('mongoose');

// Solo hay UN documento de info del negocio. El admin lo edita.
const businessInfoSchema = new mongoose.Schema({
  name:      { type: String, default: 'Licorería 369' },
  address:   { type: String, default: '' },
  hours:     { type: String, default: '' },
  phone:     { type: String, default: '' },
  whatsapp:  { type: String, default: '' },
  email:     { type: String, default: '' },
  mapsUrl:   { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('BusinessInfo', businessInfoSchema);
