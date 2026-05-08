const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  token:    { type: String, required: true, unique: true }, // ExpoPushToken
  platform: { type: String, enum: ['ios', 'android', 'web'], default: 'android' },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
