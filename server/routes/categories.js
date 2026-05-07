const router = require('express').Router();
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');
const audit = require('../middleware/audit');
const { strField, numField, objectIdParam } = require('../middleware/validators');

const filesAccepted = upload.fields([
  { name: 'image',       maxCount: 1 },
  { name: 'headerImage', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 },
]);

function sanitizeBody(body) {
  return {
    ...(body.name  !== undefined && { name:  strField(body.name, 'name', { required: true, max: 60 }) }),
    ...(body.order !== undefined && { order: numField(body.order, 'order', { min: 0, integer: true }) }),
  };
}

function applyFiles(out, files) {
  if (files?.image?.[0]?.path)       out.image       = files.image[0].path;
  if (files?.headerImage?.[0]?.path) out.headerImage = files.headerImage[0].path;
  if (files?.footerImage?.[0]?.path) out.footerImage = files.footerImage[0].path;
}

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ error: 'No encontrada' });
    res.json(cat);
  } catch (e) { next(e); }
});

router.post('/', authMiddleware, filesAccepted, async (req, res, next) => {
  try {
    const data = sanitizeBody(req.body);
    applyFiles(data, req.files);
    const category = new Category(data);
    await category.save();
    audit(req, 'create', 'category', category._id, { name: category.name });
    res.status(201).json(category);
  } catch (e) { next(e); }
});

router.put('/:id', authMiddleware, filesAccepted, async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    const data = sanitizeBody(req.body);
    applyFiles(data, req.files);
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    audit(req, 'update', 'category', category._id, { changes: Object.keys(data) });
    res.json(category);
  } catch (e) { next(e); }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = objectIdParam(req);
    const removed = await Category.findByIdAndDelete(id);
    if (removed) audit(req, 'delete', 'category', id, { name: removed.name });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
