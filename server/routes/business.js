const router = require('express').Router();
const BusinessInfo = require('../models/BusinessInfo');
const authMiddleware = require('../middleware/auth');
const audit = require('../middleware/audit');
const { strField } = require('../middleware/validators');

// GET público — cualquiera puede leer la info del negocio
router.get('/', async (req, res) => {
  try {
    let info = await BusinessInfo.findOne();
    if (!info) info = await BusinessInfo.create({}); // crea doc vacío la primera vez
    res.json(info);
  } catch {
    res.status(500).json({ error: 'Error al obtener info' });
  }
});

// PUT requiere admin
router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const data = {
      ...(req.body.name      !== undefined && { name:        strField(req.body.name, 'name', { max: 80 }) }),
      ...(req.body.address   !== undefined && { address:     strField(req.body.address, 'address', { max: 200 }) }),
      ...(req.body.hours     !== undefined && { hours:       strField(req.body.hours, 'hours', { max: 200 }) }),
      ...(req.body.phone     !== undefined && { phone:       strField(req.body.phone, 'phone', { max: 30 }) }),
      ...(req.body.whatsapp  !== undefined && { whatsapp:    strField(req.body.whatsapp, 'whatsapp', { max: 30 }) }),
      ...(req.body.email     !== undefined && { email:       strField(req.body.email, 'email', { max: 80 }) }),
      ...(req.body.mapsUrl   !== undefined && { mapsUrl:     strField(req.body.mapsUrl, 'mapsUrl', { max: 500 }) }),
      ...(req.body.description !== undefined && { description: strField(req.body.description, 'description', { max: 1000 }) }),
    };

    let info = await BusinessInfo.findOne();
    if (!info) {
      info = await BusinessInfo.create(data);
    } else {
      Object.assign(info, data);
      await info.save();
    }
    audit(req, 'update', 'business_info', info._id, { fields: Object.keys(data) });
    res.json(info);
  } catch (e) { next(e); }
});

module.exports = router;
