// Función helper para registrar acciones de admin.
// Fire-and-forget: nunca bloquea la respuesta al cliente, ni la rompe si falla.
const AuditLog = require('../models/AuditLog');

function audit(req, action, resource, resourceId, meta = {}) {
  const admin = req.admin || {};
  AuditLog.create({
    adminId:   admin.id,
    username:  admin.username,
    action,
    resource,
    resourceId: resourceId ? String(resourceId) : undefined,
    meta,
    ip:        req.ip,
    userAgent: req.headers['user-agent'],
  }).catch((err) => {
    // No queremos que un fallo de log rompa la operación
    console.error('[audit] error guardando log:', err.message);
  });
}

module.exports = audit;
