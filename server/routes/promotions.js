const router = require('express').Router();
const Promotion = require('../models/Promotion');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');

const VALID_TYPES = ['normal', 'featured', 'hero', 'footer'];

function sanitizeBody(body) {
  const out = {};
  ['title', 'subtitle', 'price', 'priceSuffix'].forEach((k) => {
    if (body[k] !== undefined) out[k] = String(body[k]).trim();
  });
  if (body.type !== undefined) {
    out.type = VALID_TYPES.includes(body.type) ? body.type : 'normal';
  }
  if (body.order !== undefined) {
    const n = Number(body.order);
    out.order = Number.isFinite(n) ? n : 0;
  }
  return out;
}

router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ order: 1, createdAt: -1 });
    res.json(promotions);
  } catch {
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

const SINGLETON_TYPES = ['hero', 'footer'];

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    if (req.file?.path) data.image = req.file.path;
    if (SINGLETON_TYPES.includes(data.type)) {
      await Promotion.deleteMany({ type: data.type });
    }
    const promotion = new Promotion(data);
    await promotion.save();
    res.status(201).json(promotion);
  } catch {
    res.status(500).json({ error: 'Error al crear promoción' });
  }
});

router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    if (req.file?.path) data.image = req.file.path;
    if (SINGLETON_TYPES.includes(data.type)) {
      await Promotion.deleteMany({ type: data.type, _id: { $ne: req.params.id } });
    }
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!promotion) return res.status(404).json({ error: 'Promoción no encontrada' });
    res.json(promotion);
  } catch {
    res.status(500).json({ error: 'Error al actualizar promoción' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;
