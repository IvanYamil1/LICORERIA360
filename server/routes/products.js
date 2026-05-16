const router = require('express').Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');
const audit = require('../middleware/audit');
const { strField, numField, objectIdParam } = require('../middleware/validators');
const mongoose = require('mongoose');

function sanitizeBody(body) {
  return {
    ...(body.name      !== undefined && { name:      strField(body.name, 'name', { required: true, max: 80 }) }),
    ...(body.capacity  !== undefined && { capacity:  strField(body.capacity, 'capacity', { max: 40 }) }),
    ...(body.category  !== undefined && (() => {
      const cat = String(body.category).trim();
      if (cat && !mongoose.isValidObjectId(cat)) {
        const e = new Error('category inválido'); e.status = 400; throw e;
      }
      return { category: cat || undefined };
    })()),
    ...(body.price     !== undefined && { price:     numField(body.price, 'price', { min: 0, max: 9999999 }) }),
    ...(body.colsInRow !== undefined && { colsInRow: numField(body.colsInRow, 'colsInRow', { min: 1, max: 6, integer: true }) }),
    ...(body.order     !== undefined && { order:     numField(body.order, 'order', { min: 0, integer: true }) }),
  };
}

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      if (!mongoose.isValidObjectId(req.query.category)) {
        return res.status(400).json({ error: 'category inválido' });
      }
      filter.category = req.query.category;
    }
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ order: 1, createdAt: 1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    const product = await Product.findById(id).populate('category', 'name');
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (e) { next(e); }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const data = sanitizeBody(req.body);
    if (req.file?.path) data.image = req.file.path;
    const product = new Product(data);
    await product.save();
    const populated = await product.populate('category', 'name');
    audit(req, 'create', 'product', product._id, { name: product.name });
    res.status(201).json(populated);
  } catch (e) { next(e); }
});

router.put('/:id', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    const data = sanitizeBody(req.body);
    if (req.file?.path) data.image = req.file.path;
    const product = await Product.findByIdAndUpdate(id, data, { new: true })
      .populate('category', 'name');
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    audit(req, 'update', 'product', product._id, { changes: Object.keys(data) });
    res.json(product);
  } catch (e) { next(e); }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    const removed = await Product.findByIdAndDelete(id);
    if (removed) audit(req, 'delete', 'product', id, { name: removed.name });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
