const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ id: admin._id, username }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
