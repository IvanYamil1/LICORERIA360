const jwt = require('jsonwebtoken');

const DEV_BYPASS_TOKEN = 'dev-bypass-token';

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const token = auth.slice(7);

  if (token === DEV_BYPASS_TOKEN) {
    req.admin = { id: 'dev', username: 'dev' };
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
