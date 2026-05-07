// Crea o actualiza un admin en la base de datos.
// Uso: node set-admin.js <usuario> <contraseña>
// Ejemplo: node set-admin.js admin "MiClaveSegura$2026"
//
// La contraseña se guarda hasheada con bcrypt.
// No se almacena en .env ni en ningún archivo del proyecto.

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Uso: node set-admin.js <usuario> <contraseña>');
  console.error('Ejemplo: node set-admin.js admin "MiClaveSegura$2026"');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');

  const existing = await Admin.findOne({ username });
  if (existing) {
    existing.password = password; // pre('save') hashea automáticamente
    await existing.save();
    console.log(`Contraseña actualizada para "${username}"`);
  } else {
    await Admin.create({ username, password });
    console.log(`Admin creado: "${username}"`);
  }

  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
