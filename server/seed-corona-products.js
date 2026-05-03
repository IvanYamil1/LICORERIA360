require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Category = require('./models/Category');
const Product = require('./models/Product');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ASSETS = path.join(__dirname, '..', 'assets', 'corona');

const HEADER_FILE = 'header.png';
const FOOTER_FILE = 'footer.png';

const PRODUCTS = [
  // Row 1 — 4 columnas (botellas mega)
  { name: 'Cerveza Victoria mega',        capacity: '1.2 L',  file: '01-victoria-mega.png',         colsInRow: 4, order: 1 },
  { name: 'Cerveza Corona mega',          capacity: '1.2 L',  file: '02-corona-mega.png',           colsInRow: 4, order: 2 },
  { name: 'Cerveza Modelo especial mega',   capacity: '1 L',    file: '03-modelo-especial-mega.png',  colsInRow: 4, order: 3 },
  { name: 'Cerveza Modelo Negra mega',      capacity: '1 L',    file: '04-modelo-negra-mega.png',     colsInRow: 4, order: 4 },

  // Row 2 — 3 columnas (latas 473 ml)
  { name: 'Corona Extra',                capacity: '473 ml', file: '05-corona-extra-473.png',      colsInRow: 3, order: 5 },
  { name: 'Victoria Lata',               capacity: '473 ml', file: '06-victoria-lata-473.png',     colsInRow: 3, order: 6 },
  { name: 'Modelo Especial',             capacity: '473 ml', file: '07-modelo-especial-473.png',   colsInRow: 3, order: 7 },

  // Row 3 — 3 columnas (Vicky)
  { name: 'Vicky mango',            capacity: '473 ml', file: '08-vicky-mango.png',           colsInRow: 3, order: 8 },
  { name: 'Vicky Piña',             capacity: '473 ml', file: '09-vicky-pina.png',            colsInRow: 3, order: 9 },
  { name: 'Vicky chamoy',           capacity: '473 ml', file: '10-vicky-chamoy.png',          colsInRow: 3, order: 10 },

  // Row 4 — 3 columnas (latas 710 ml)
  { name: 'Victoria Lata',               capacity: '710 ml', file: '11-victoria-lata-710.png',     colsInRow: 3, order: 11 },
  { name: 'Modelo Especial',             capacity: '710 ml', file: '12-modelo-especial-710.png',   colsInRow: 3, order: 12 },
  { name: 'Corona Extra',                capacity: '710 ml', file: '13-corona-extra-710.png',      colsInRow: 3, order: 13 },
];

async function upload(filename) {
  const full = path.join(ASSETS, filename);
  const res = await cloudinary.uploader.upload(full, {
    folder: 'licoreria369/corona',
    transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
  });
  return res.secure_url;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');

  const corona = await Category.findOne({ name: /^corona$/i });
  if (!corona) {
    console.error('❌ Categoría "Corona" no encontrada. Corre seed-categories.js primero.');
    process.exit(1);
  }
  console.log(`Categoría encontrada: ${corona.name} (#${corona._id})\n`);

  // Header + Footer
  console.log('Subiendo banners...');
  const [header, footer] = await Promise.all([upload(HEADER_FILE), upload(FOOTER_FILE)]);
  corona.headerImage = header;
  corona.footerImage = footer;
  await corona.save();
  console.log('  ✓ banners actualizados\n');

  // Productos
  const deleted = await Product.deleteMany({ category: corona._id });
  console.log(`Eliminados ${deleted.deletedCount} productos previos de Corona\n`);

  for (const p of PRODUCTS) {
    process.stdout.write(`  ${p.name.padEnd(36)} (${p.colsInRow}/fila)... `);
    const image = await upload(p.file);
    const { file, ...rest } = p;
    await Product.create({ ...rest, image, category: corona._id });
    console.log('✓');
  }

  console.log(`\n✅ ${PRODUCTS.length} productos de Corona creados + banners`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
