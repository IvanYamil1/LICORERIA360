require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Admin = require('./models/Admin');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/promotions', require('./routes/promotions'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');

  // Crear admin por defecto si no existe
  const exists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (!exists) {
    await Admin.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });
    console.log(`Admin creado: ${process.env.ADMIN_USERNAME}`);
  }

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

start().catch(console.error);
