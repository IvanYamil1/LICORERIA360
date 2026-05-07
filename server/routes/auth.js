const router = require('express').Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

// Máx 10 intentos por IP cada 15 min para evitar fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos.' },
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      !username.trim() || !password) {
    return res.status(400).json({ error: 'Credenciales incorrectas' });
  }

  try {
    const admin = await Admin.findOne({ username: username.trim() });

    // Mensaje genérico para no revelar si el usuario existe
    const genericFail = () => res.status(401).json({ error: 'Credenciales incorrectas' });

    if (!admin) return genericFail();

    // Cuenta bloqueada temporalmente
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutes = Math.ceil((admin.lockedUntil - new Date()) / 60000);
      return res.status(423).json({
        error: `Cuenta bloqueada. Intenta de nuevo en ${minutes} min.`,
      });
    }

    const ok = await admin.comparePassword(password);
    if (!ok) {
      admin.failedLogins = (admin.failedLogins || 0) + 1;
      if (admin.failedLogins >= MAX_FAILED) {
        admin.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        admin.failedLogins = 0;
      }
      await admin.save();
      AuditLog.create({
        username: admin.username, action: 'login_failed', resource: 'auth',
        ip: req.ip, userAgent: req.headers['user-agent'],
      }).catch(() => {});
      return genericFail();
    }

    // Login exitoso: resetear contadores
    admin.failedLogins = 0;
    admin.lockedUntil = null;
    await admin.save();

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    AuditLog.create({
      adminId: admin._id, username: admin.username, action: 'login', resource: 'auth',
      ip: req.ip, userAgent: req.headers['user-agent'],
    }).catch(() => {});
    res.json({ token });
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
