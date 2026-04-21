require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Promotion = require('./models/Promotion');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ASSETS = path.join(__dirname, '..', 'assets');

const PROMOS = [
  {
    type: 'hero',
    file: 'home-hero-cuervo.png',
    order: 0,
  },
  {
    type: 'featured',
    title: 'Tecate + Indio',
    subtitle: 'Caguamón 1.2L / 1.18L',
    price: '2 x $85',
    file: 'home-caguamones.png',
    order: 1,
  },
  {
    type: 'normal',
    title: 'XX Laguer',
    subtitle: 'Caguamon 1.18L',
    price: '2x $93',
    file: 'home-xx-lager.png',
    order: 2,
  },
  {
    type: 'normal',
    title: 'SOL Mezclas',
    price: '2 x $48',
    file: 'home-sol-mezclas.png',
    order: 3,
  },
  {
    type: 'normal',
    title: 'Tecate Lata',
    subtitle: '473 ml',
    price: '2x $42',
    file: 'home-tecate-indio-lata.png',
    order: 4,
  },
  {
    type: 'normal',
    title: 'Jimador New MIX',
    price: '$35',
    priceSuffix: 'C/U',
    file: 'home-jimador.png',
    order: 5,
  },
  {
    type: 'normal',
    title: 'Victoria Lata',
    subtitle: '710 ml',
    price: '$36',
    file: 'home-victoria.png',
    order: 6,
  },
  {
    type: 'footer',
    file: 'home-cuervo-mezcal.png',
    order: 99,
  },
];

async function upload(filename) {
  const full = path.join(ASSETS, filename);
  const res = await cloudinary.uploader.upload(full, {
    folder: 'licoreria369',
    transformation: [{ width: 900, crop: 'limit', quality: 'auto' }],
  });
  return res.secure_url;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');

  const deleted = await Promotion.deleteMany({});
  console.log(`Eliminadas ${deleted.deletedCount} promociones previas\n`);

  for (const p of PROMOS) {
    const label = (p.title || `[${p.type}]`).padEnd(20);
    process.stdout.write(`  ${label} (${p.type})... `);
    const image = await upload(p.file);
    const { file, ...rest } = p;
    await Promotion.create({ ...rest, image });
    console.log('✓');
  }

  console.log(`\n✅ ${PROMOS.length} promociones creadas`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
