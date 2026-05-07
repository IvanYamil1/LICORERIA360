const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  username:   { type: String },
  action:     { type: String, required: true }, // 'create' | 'update' | 'delete' | 'login'
  resource:   { type: String, required: true }, // 'product' | 'category' | 'promotion' | 'auth'
  resourceId: { type: String },
  meta:       { type: mongoose.Schema.Types.Mixed }, // payload chico con detalles
  ip:         { type: String },
  userAgent:  { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

// TTL: borra logs después de 180 días
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
