const router = require('express').Router();
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');

const filesAccepted = upload.fields([
  { name: 'image',       maxCount: 1 },
  { name: 'headerImage', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 },
]);

function sanitizeBody(body) {
  const out = {};
  if (body.name !== undefined) out.name = String(body.name).trim();
  if (body.order !== undefined) {
    const n = Number(body.order);
    out.order = Number.isFinite(n) ? n : 0;
  }
  return out;
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

router.get('/:id', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'No encontrada' });
    res.json(cat);
  } catch {
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
});

router.post('/', authMiddleware, filesAccepted, async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    applyFiles(data, req.files);
    const category = new Category(data);
    await category.save();
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

router.put('/:id', authMiddleware, filesAccepted, async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    applyFiles(data, req.files);
    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;
