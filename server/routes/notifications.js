const router = require('express').Router();
const Device = require('../models/Device');
const authMiddleware = require('../middleware/auth');
const audit = require('../middleware/audit');
const { strField, enumField } = require('../middleware/validators');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100;

// Cualquier dispositivo registra su push token (sin auth)
router.post('/register', async (req, res, next) => {
  try {
    const token = strField(req.body?.token, 'token', { required: true, max: 200 });
    const platform = enumField(req.body?.platform, 'platform', ['ios', 'android', 'web']) || 'android';

    if (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken[')) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    await Device.findOneAndUpdate(
      { token },
      { token, platform, lastSeen: new Date() },
      { upsert: true, new: true },
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Solo admin puede listar y enviar
router.get('/devices', authMiddleware, async (req, res, next) => {
  try {
    const count = await Device.countDocuments();
    res.json({ count });
  } catch (e) { next(e); }
});

router.post('/send', authMiddleware, async (req, res, next) => {
  try {
    const title = strField(req.body?.title, 'title', { required: true, max: 80 });
    const body = strField(req.body?.body, 'body', { required: true, max: 200 });

    const devices = await Device.find({}, 'token');
    if (devices.length === 0) {
      return res.json({ ok: true, sent: 0, message: 'Sin dispositivos registrados' });
    }

    const messages = devices.map((d) => ({
      to: d.token,
      sound: 'default',
      title,
      body,
      priority: 'high',
    }));

    let sent = 0;
    const errors = [];
    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);
      try {
        const r = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        });
        const result = await r.json();
        sent += chunk.length;
        // Limpiar tokens inválidos reportados por Expo
        if (Array.isArray(result?.data)) {
          result.data.forEach((entry, idx) => {
            const t = chunk[idx]?.to;
            if (entry?.status === 'error' && entry?.details?.error === 'DeviceNotRegistered' && t) {
              Device.deleteOne({ token: t }).catch(() => {});
            }
          });
        }
      } catch (e) {
        errors.push(e.message);
      }
    }

    audit(req, 'send_push', 'notification', null, { title, devices: devices.length });
    res.json({ ok: true, sent, errors });
  } catch (e) { next(e); }
});

module.exports = router;
