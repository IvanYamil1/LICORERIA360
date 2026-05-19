require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Necesario en producción detrás de proxy (Render, Railway, Heroku, nginx) para que
// req.ip y rate-limit usen el IP real del cliente (X-Forwarded-For)
app.set('trust proxy', 1);

// Forzar HTTPS en producción (cuando NODE_ENV === 'production')
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  });
}

// Headers de seguridad estándar (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// CORS restringido: solo orígenes permitidos en .env (separados por coma)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      // Permite requests sin origin (apps nativas, Postman, curl)
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Origen no permitido por CORS'));
    },
  }),
);

// Límite de tamaño de body JSON (las imágenes van por multer, no por aquí)
app.use(express.json({ limit: '100kb' }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/business', require('./routes/business'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Handler global para errores (multer, CORS, etc.) — siempre devuelve JSON
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.message?.includes('CORS') ? 403 : 400);
  res.status(status).json({ error: err.message || 'Error en la petición' });
});

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

start().catch(console.error);
