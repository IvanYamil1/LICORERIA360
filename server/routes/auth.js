const router = require('express').Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/auth');
const audit = require('../middleware/audit');
const { strField, objectIdParam } = require('../middleware/validators');

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 64;
const MIN_USERNAME = 3;
const MAX_USERNAME = 30;

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

// === Cambio de contraseña del admin actualmente logueado ===
router.post('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const currentPassword = strField(req.body?.currentPassword, 'currentPassword', { required: true });
    const newPassword = strField(req.body?.newPassword, 'newPassword',
      { required: true, min: MIN_PASSWORD, max: MAX_PASSWORD });

    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    const ok = await admin.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    admin.password = newPassword;
    await admin.save();
    audit(req, 'change_password', 'admin', admin._id, {});
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// === CRUD de admins (requiere estar logueado) ===

router.get('/admins', authMiddleware, async (req, res, next) => {
  try {
    const admins = await Admin.find({}, '-password').sort({ createdAt: 1 });
    res.json(admins);
  } catch (e) { next(e); }
});

router.post('/admins', authMiddleware, async (req, res, next) => {
  try {
    const username = strField(req.body?.username, 'username',
      { required: true, min: MIN_USERNAME, max: MAX_USERNAME });
    const password = strField(req.body?.password, 'password',
      { required: true, min: MIN_PASSWORD, max: MAX_PASSWORD });

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return res.status(400).json({ error: 'Usuario solo permite letras, números, _ . -' });
    }

    const exists = await Admin.findOne({ username });
    if (exists) return res.status(409).json({ error: 'Ese usuario ya existe' });

    const created = await Admin.create({ username, password });
    audit(req, 'create', 'admin', created._id, { username });
    res.status(201).json({ _id: created._id, username: created.username });
  } catch (e) { next(e); }
});

router.delete('/admins/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    if (String(id) === String(req.admin.id)) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    const total = await Admin.countDocuments();
    if (total <= 1) {
      return res.status(400).json({ error: 'Debe quedar al menos un admin' });
    }
    const removed = await Admin.findByIdAndDelete(id);
    if (removed) audit(req, 'delete', 'admin', id, { username: removed.username });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Eliminar mi propia cuenta admin (cumple requisito de Apple/Google de account deletion)
// Requiere contraseña actual y que existan al menos 2 admins.
router.post('/me/delete', authMiddleware, async (req, res, next) => {
  try {
    const password = strField(req.body?.password, 'password', { required: true });
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    const ok = await admin.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const total = await Admin.countDocuments();
    if (total <= 1) {
      return res.status(400).json({
        error: 'Eres el único admin. Crea otro admin antes de eliminar tu cuenta.',
      });
    }

    await Admin.findByIdAndDelete(admin._id);
    audit(req, 'delete_self', 'admin', admin._id, { username: admin.username });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
