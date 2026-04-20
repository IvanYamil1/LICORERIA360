const router = require('express').Router();
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      image: req.file?.path || '',
    });
    await category.save();
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: 'Error al crear categoría' });
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
