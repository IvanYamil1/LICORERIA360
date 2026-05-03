const router = require('express').Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');

function sanitizeBody(body) {
  const out = {};
  ['name', 'capacity', 'category'].forEach((k) => {
    if (body[k] !== undefined) out[k] = String(body[k]).trim();
  });
  if (body.price !== undefined && body.price !== '') {
    const n = Number(body.price);
    if (Number.isFinite(n)) out.price = n;
  }
  if (body.colsInRow !== undefined && body.colsInRow !== '') {
    const n = Number(body.colsInRow);
    if (Number.isFinite(n)) out.colsInRow = Math.max(1, Math.min(6, n));
  }
  if (body.order !== undefined && body.order !== '') {
    const n = Number(body.order);
    if (Number.isFinite(n)) out.order = n;
  }
  return out;
}

router.get('/', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ order: 1, createdAt: 1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    if (req.file?.path) data.image = req.file.path;
    const product = new Product(data);
    await product.save();
    const populated = await product.populate('category', 'name');
    res.status(201).json(populated);
  } catch {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    if (req.file?.path) data.image = req.file.path;
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate('category', 'name');
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;
