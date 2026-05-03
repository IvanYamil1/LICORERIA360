require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Category = require('./models/Category');
const Promotion = require('./models/Promotion');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ASSETS = path.join(__dirname, '..', 'assets');

const CATEGORIES = [
  { name: 'Peñafiel',   file: 'cat-penafiel.png',    order: 1 },
  { name: 'Corona',     file: 'cat-corona.png',      order: 2 },
  { name: 'Tequila',    file: 'cat-tequila.png',     order: 3 },
  { name: 'Heineken',   file: 'cat-heineken.png',    order: 4 },
  { name: 'Jarritos',   file: 'cat-jarritos.png',    order: 5 },
  { name: 'Coca Cola',  file: 'cat-coca-cola.png',   order: 6 },
  { name: 'Cognac',     file: 'cat-cognac.png',      order: 7 },
  { name: 'Ron',        file: 'cat-ron.png',         order: 8 },
  { name: 'BOTANAS',    file: 'cat-botanas.png',     order: 9 },
  { name: 'Dulces',     file: 'cat-dulces.png',      order: 10 },
  { name: 'whiskey',    file: 'cat-whiskey.png',     order: 11 },
  { name: 'Brandy',     file: 'cat-brandy.png',      order: 12 },
  { name: 'OTROS',      file: 'cat-otros.png',       order: 13 },
  { name: 'Limpieza',   file: 'cat-limpieza.png',    order: 14 },
  { name: 'vodka',      file: 'cat-vodka.png',       order: 15 },
  { name: 'MIX bebida', file: 'cat-mix-bebida.png',  order: 16 },
];

const OFFER_BADGE_FILE = 'oferta-badge.png';
const CATEGORIES_BANNER_FILE = 'categories-banner.png';

async function upload(filename) {
  const full = path.join(ASSETS, filename);
  const res = await cloudinary.uploader.upload(full, {
    folder: 'licoreria369',
    transformation: [{ width: 600, crop: 'limit', quality: 'auto' }],
  });
  return res.secure_url;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');

  // Categorías
  const deleted = await Category.deleteMany({});
  console.log(`Eliminadas ${deleted.deletedCount} categorías previas\n`);

  for (const c of CATEGORIES) {
    process.stdout.write(`  ${c.name.padEnd(14)} (#${c.order})... `);
    const image = await upload(c.file);
    await Category.create({ name: c.name, image, order: c.order });
    console.log('✓');
  }

  // Offer badge
  console.log('\nSubiendo offer-badge...');
  await Promotion.deleteMany({ type: 'offer-badge' });
  const badgeImage = await upload(OFFER_BADGE_FILE);
  await Promotion.create({ type: 'offer-badge', image: badgeImage, order: 0 });
  console.log('  ✓');

  // Categories banner
  console.log('\nSubiendo categories-banner...');
  await Promotion.deleteMany({ type: 'categories-banner' });
  const bannerImage = await upload(CATEGORIES_BANNER_FILE);
  await Promotion.create({ type: 'categories-banner', image: bannerImage, order: 0 });
  console.log('  ✓');

  console.log(`\n✅ ${CATEGORIES.length} categorías + badge OFERTA + banner productos creados`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
