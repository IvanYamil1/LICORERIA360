const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
