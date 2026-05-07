const router = require('express').Router();
const Promotion = require('../models/Promotion');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');
const audit = require('../middleware/audit');
const { strField, numField, enumField, objectIdParam } = require('../middleware/validators');

const VALID_TYPES = ['normal', 'featured', 'hero', 'footer', 'offer-badge', 'categories-banner'];
const SINGLETON_TYPES = ['hero', 'footer', 'offer-badge', 'categories-banner'];

function sanitizeBody(body) {
  return {
    ...(body.title       !== undefined && { title:       strField(body.title, 'title', { max: 80 }) }),
    ...(body.subtitle    !== undefined && { subtitle:    strField(body.subtitle, 'subtitle', { max: 120 }) }),
    ...(body.price       !== undefined && { price:       strField(body.price, 'price', { max: 30 }) }),
    ...(body.priceSuffix !== undefined && { priceSuffix: strField(body.priceSuffix, 'priceSuffix', { max: 20 }) }),
    ...(body.type        !== undefined && { type:        enumField(body.type, 'type', VALID_TYPES) }),
    ...(body.order       !== undefined && { order:       numField(body.order, 'order', { min: 0, integer: true }) }),
  };
}

router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ order: 1, createdAt: -1 });
    res.json(promotions);
  } catch {
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const data = sanitizeBody(req.body);
    if (req.file?.path) data.image = req.file.path;
    if (SINGLETON_TYPES.includes(data.type)) {
      await Promotion.deleteMany({ type: data.type });
    }
    const promotion = new Promotion(data);
    await promotion.save();
    audit(req, 'create', 'promotion', promotion._id, { type: promotion.type, title: promotion.title });
    res.status(201).json(promotion);
  } catch (e) { next(e); }
});

router.put('/:id', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    const data = sanitizeBody(req.body);
    if (req.file?.path) data.image = req.file.path;
    if (SINGLETON_TYPES.includes(data.type)) {
      await Promotion.deleteMany({ type: data.type, _id: { $ne: id } });
    }
    const promotion = await Promotion.findByIdAndUpdate(id, data, { new: true });
    if (!promotion) return res.status(404).json({ error: 'Promoción no encontrada' });
    audit(req, 'update', 'promotion', promotion._id, { changes: Object.keys(data) });
    res.json(promotion);
  } catch (e) { next(e); }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    const removed = await Promotion.findByIdAndDelete(id);
    if (removed) audit(req, 'delete', 'promotion', id, { type: removed.type });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
