const router = require('express').Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');

router.get('/', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter).populate('category', 'name').sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      capacity: req.body.capacity,
      category: req.body.category,
      image: req.file?.path || '',
      ...(req.body.price !== undefined && req.body.price !== '' && { price: Number(req.body.price) }),
    });
    await product.save();
    const populated = await product.populate('category', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const update = {
      name: req.body.name,
      capacity: req.body.capacity,
      category: req.body.category,
    };
    if (req.body.price !== undefined && req.body.price !== '') update.price = Number(req.body.price);
    if (req.file) update.image = req.file.path;
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('category', 'name');
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
