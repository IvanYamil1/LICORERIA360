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

const ASSETS = path.join(__dirname, '..', 'assets', 'heineken');
const HEADER_FILE = 'header.png';
const FOOTER_FILE = 'footer.png';

const PRODUCTS = [
  // Fila 1 — 3 cols (caguamones)
  { name: 'Indio Agave',                capacity: '940 ml',  file: '01-indio-agave-940.png',         colsInRow: 3, order: 1 },
  { name: 'Tecate original Caguamon',    capacity: '1.2 L',   file: '02-tecate-caguamon-12.png',      colsInRow: 3, order: 2 },
  { name: 'Indio Caguamon',             capacity: '1.18 L',  file: '03-indio-caguamon-118.png',      colsInRow: 3, order: 3 },

  // Fila 2 — 3 cols (caguamones)
  { name: 'XX Laguer Caguamon',         capacity: '1.18 L',  file: '04-xx-laguer-caguamon.png',      colsInRow: 3, order: 4 },
  { name: 'Carta Blanca Caguamon',       capacity: '1.2 L',   file: '05-carta-blanca-caguamon.png',   colsInRow: 3, order: 5 },
  { name: 'Grand Heineken Caguama',    capacity: '1000 ml', file: '06-grand-heineken-1000.png',     colsInRow: 3, order: 6 },

  // Fila 3 — 2 cols
  { name: 'Miller High Life Caguamon',  capacity: '940 ml',  file: '07-miller-high-life-940.png',    colsInRow: 2, order: 7 },
  { name: 'Noche Buena',                capacity: '355 ml',  file: '08-noche-buena-355.png',         colsInRow: 2, order: 8 },

  // Fila 4 — 3 cols (latas)
  { name: 'XX Laguer',                  capacity: '473 ml',  file: '09-xx-laguer-473.png',           colsInRow: 3, order: 9 },
  { name: 'Indio',                      capacity: '473 ml',  file: '10-indio-473.png',               colsInRow: 3, order: 10 },
  { name: 'XX Ambar',                   capacity: '473 ml',  file: '11-xx-ambar-473.png',            colsInRow: 3, order: 11 },

  // Fila 5 — 3 cols
  { name: 'Heineken 0.0',               capacity: '355 ml',  file: '12-heineken-00-355.png',         colsInRow: 3, order: 12 },
  { name: 'Bohemia Cristal',            capacity: '473 ml',  file: '13-bohemia-cristal-473.png',     colsInRow: 3, order: 13 },
  { name: 'Heineken',                   capacity: '473 ml',  file: '14-heineken-473.png',            colsInRow: 3, order: 14 },

  // Fila 6 — 3 cols
  { name: 'Ultra',                      capacity: '473 ml',  file: '15-ultra-473.png',               colsInRow: 3, order: 15 },
  { name: 'Tecate Original',            capacity: '473 ml',  file: '16-tecate-original-473.png',     colsInRow: 3, order: 16 },
  { name: 'Carta Blanca',               capacity: '473 ml',  file: '17-carta-blanca-473.png',        colsInRow: 3, order: 17 },

  // Fila 7 — 3 cols (SOL Mezclas)
  { name: 'SOL Chelada',                capacity: '473 ml',  file: '18-sol-chelada-473.png',         colsInRow: 3, order: 18 },
  { name: 'SOL Mangoyada',              capacity: '473 ml',  file: '19-sol-mangoyada-473.png',       colsInRow: 3, order: 19 },
  { name: 'SOL Clamato',                capacity: '473 ml',  file: '20-sol-clamato-473.png',         colsInRow: 3, order: 20 },
];

async function upload(filename) {
  const full = path.join(ASSETS, filename);
  const res = await cloudinary.uploader.upload(full, {
    folder: 'licoreria369/heineken',
    transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
  });
  return res.secure_url;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');

  const heineken = await Category.findOne({ name: /^heineken$/i });
  if (!heineken) {
    console.error('❌ Categoría "Heineken" no encontrada. Corre seed-categories.js primero.');
    process.exit(1);
  }
  console.log(`Categoría encontrada: ${heineken.name} (#${heineken._id})\n`);

  // Banners
  console.log('Subiendo banners...');
  const [header, footer] = await Promise.all([upload(HEADER_FILE), upload(FOOTER_FILE)]);
  heineken.headerImage = header;
  heineken.footerImage = footer;
  await heineken.save();
  console.log('  ✓ banners actualizados\n');

  // Productos
  const deleted = await Product.deleteMany({ category: heineken._id });
  console.log(`Eliminados ${deleted.deletedCount} productos previos de Heineken\n`);

  for (const p of PRODUCTS) {
    process.stdout.write(`  ${p.name.padEnd(40)} (${p.colsInRow}/fila)... `);
    const image = await upload(p.file);
    const { file, ...rest } = p;
    await Product.create({ ...rest, image, category: heineken._id });
    console.log('✓');
  }

  console.log(`\n✅ ${PRODUCTS.length} productos de Heineken creados + banners`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
