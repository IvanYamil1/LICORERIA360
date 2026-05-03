// Generic category seed: copies numbered images from /assets/<slug>/
// to cloudinary and creates products with provided name/capacity/cols.
// Usage: node seed-category.js <slug>
// Reads config from server/seed-configs/<slug>.json

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Category = require('./models/Category');
const Product = require('./models/Product');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const slug = process.argv[2];
if (!slug) {
  console.error('Uso: node seed-category.js <slug>\nEj: node seed-category.js limpieza');
  process.exit(1);
}

const cfgPath = path.join(__dirname, 'seed-configs', `${slug}.json`);
if (!fs.existsSync(cfgPath)) {
  console.error(`No se encontró config: ${cfgPath}`);
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const ASSETS = path.join(__dirname, '..', 'assets', slug);

async function upload(filename) {
  const full = path.join(ASSETS, filename);
  const res = await cloudinary.uploader.upload(full, {
    folder: `licoreria369/${slug}`,
    transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
  });
  return res.secure_url;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');

  const category = await Category.findOne({ name: new RegExp(`^${cfg.category}$`, 'i') });
  if (!category) {
    console.error(`❌ Categoría "${cfg.category}" no encontrada.`);
    process.exit(1);
  }
  console.log(`Categoría: ${category.name} (#${category._id})\n`);

  if (cfg.headerFile || cfg.footerFile) {
    console.log('Subiendo banners...');
    if (cfg.headerFile) category.headerImage = await upload(cfg.headerFile);
    if (cfg.footerFile) category.footerImage = await upload(cfg.footerFile);
    await category.save();
    console.log('  ✓ banners actualizados\n');
  }

  const deleted = await Product.deleteMany({ category: category._id });
  console.log(`Eliminados ${deleted.deletedCount} productos previos\n`);

  for (let i = 0; i < cfg.products.length; i++) {
    const p = cfg.products[i];
    process.stdout.write(`  [${String(i + 1).padStart(2, '0')}] ${(p.name || '').padEnd(42)} (${p.cols || 3}/fila)... `);
    const image = await upload(p.file);
    await Product.create({
      name: p.name,
      capacity: p.capacity || '',
      category: category._id,
      image,
      colsInRow: p.cols || 3,
      order: i + 1,
    });
    console.log('✓');
  }

  console.log(`\n✅ ${cfg.products.length} productos de ${category.name} creados`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
