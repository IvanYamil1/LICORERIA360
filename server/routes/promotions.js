const router = require('express').Router();
const Promotion = require('../models/Promotion');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');

router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch {
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const promotion = new Promotion({
      title: req.body.title,
      description: req.body.description,
      image: req.file?.path || '',
    });
    await promotion.save();
    res.status(201).json(promotion);
  } catch {
    res.status(500).json({ error: 'Error al crear promoción' });
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
