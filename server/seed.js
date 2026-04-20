require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Category = require('./models/Category');
const Product = require('./models/Product');
const Promotion = require('./models/Promotion');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(url, folder = 'licoreria369') {
  try {
    const result = await cloudinary.uploader.upload(url, { folder, transformation: [{ width: 900, crop: 'limit', quality: 'auto' }] });
    return result.secure_url;
  } catch (e) {
    console.warn('  ⚠ No se pudo subir imagen:', url.slice(0, 60), '-', e.message);
    return '';
  }
}

const data = {
  categories: [
    { name: 'Whisky',    img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800' },
    { name: 'Tequila',   img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800' },
    { name: 'Ron',       img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800' },
    { name: 'Vodka',     img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800' },
    { name: 'Vino',      img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800' },
    { name: 'Cerveza',   img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800' },
    { name: 'Brandy',    img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800' },
    { name: 'Mezcal',    img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800' },
  ],

  products: [
    // Whisky
    { name: 'Jack Daniel\'s',       category: 'Whisky',  capacity: '750ml', price: 420, img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
    { name: 'Jack Daniel\'s',       category: 'Whisky',  capacity: '1L',    price: 560, img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
    { name: 'Johnnie Walker Red',   category: 'Whisky',  capacity: '750ml', price: 380, img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },
    { name: 'Johnnie Walker Black', category: 'Whisky',  capacity: '750ml', price: 650, img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },
    { name: 'Chivas Regal 12',      category: 'Whisky',  capacity: '750ml', price: 590, img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },
    { name: 'Buchanan\'s 12',       category: 'Whisky',  capacity: '750ml', price: 480, img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },
    { name: 'Jim Beam',             category: 'Whisky',  capacity: '750ml', price: 290, img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
    // Tequila
    { name: 'Jose Cuervo Plata',    category: 'Tequila', capacity: '750ml', price: 260, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    { name: 'Jose Cuervo Gold',     category: 'Tequila', capacity: '750ml', price: 280, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    { name: 'Olmeca Blanco',        category: 'Tequila', capacity: '750ml', price: 240, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    { name: 'Don Julio Blanco',     category: 'Tequila', capacity: '750ml', price: 720, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    { name: 'Patron Silver',        category: 'Tequila', capacity: '750ml', price: 850, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    // Ron
    { name: 'Bacardi Blanco',       category: 'Ron',     capacity: '750ml', price: 210, img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Bacardi Añejo',        category: 'Ron',     capacity: '750ml', price: 250, img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Havana Club 3 años',   category: 'Ron',     capacity: '750ml', price: 230, img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Havana Club 7 años',   category: 'Ron',     capacity: '750ml', price: 340, img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Captain Morgan',       category: 'Ron',     capacity: '750ml', price: 280, img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    // Vodka
    { name: 'Smirnoff',             category: 'Vodka',   capacity: '750ml', price: 190, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600' },
    { name: 'Smirnoff',             category: 'Vodka',   capacity: '1L',    price: 260, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600' },
    { name: 'Absolut Original',     category: 'Vodka',   capacity: '750ml', price: 320, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600' },
    { name: 'Absolut Lime',         category: 'Vodka',   capacity: '750ml', price: 330, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600' },
    { name: 'Grey Goose',           category: 'Vodka',   capacity: '750ml', price: 650, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600' },
    { name: 'Ciroc',                category: 'Vodka',   capacity: '750ml', price: 580, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600' },
    // Vino
    { name: 'Casillero del Diablo Cab.',   category: 'Vino', capacity: '750ml', price: 180, img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
    { name: 'Casillero del Diablo Merlot', category: 'Vino', capacity: '750ml', price: 180, img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
    { name: 'Santa Carolina Reserva',      category: 'Vino', capacity: '750ml', price: 150, img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
    { name: 'Concha y Toro Rosé',          category: 'Vino', capacity: '750ml', price: 160, img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
    { name: 'Gato Negro Chardonnay',       category: 'Vino', capacity: '750ml', price: 120, img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
    // Cerveza
    { name: 'Corona 355ml',         category: 'Cerveza', capacity: '355ml', price: 35,  img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Corona Caguama',       category: 'Cerveza', capacity: '940ml', price: 75,  img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Modelo Especial',      category: 'Cerveza', capacity: '355ml', price: 35,  img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Heineken',             category: 'Cerveza', capacity: '355ml', price: 40,  img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Victoria',             category: 'Cerveza', capacity: '355ml', price: 30,  img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Tecate',               category: 'Cerveza', capacity: '355ml', price: 28,  img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    { name: 'Indio',                category: 'Cerveza', capacity: '355ml', price: 32,  img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
    // Brandy
    { name: 'Presidente',           category: 'Brandy',  capacity: '750ml', price: 200, img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
    { name: 'Domecq Brandy',        category: 'Brandy',  capacity: '750ml', price: 220, img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
    { name: 'Torres 10',            category: 'Brandy',  capacity: '750ml', price: 290, img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
    // Mezcal
    { name: 'Monte Alban',          category: 'Mezcal',  capacity: '750ml', price: 280, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    { name: 'Del Maguey',           category: 'Mezcal',  capacity: '750ml', price: 520, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    { name: 'Alipús San Andres',    category: 'Mezcal',  capacity: '750ml', price: 310, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
  ],

  promotions: [
    { title: '2x1 en Cervezas',           description: 'Todos los viernes · Cervezas nacionales 2x1',         img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=900' },
    { title: 'Promo Fin de Semana',        description: '20% de descuento en toda la línea de Whisky',          img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=900' },
    { title: 'Tequila Night',              description: 'Tequilas con precio especial los sábados',             img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900' },
    { title: 'Combo Vino + Botana',        description: 'Lleva una botella de vino y te regalamos la botana',   img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=900' },
    { title: 'Descuento de Temporada',     description: 'Hasta 30% en rones seleccionados',                     img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=900' },
  ],
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado\n');

  // Limpiar datos previos
  await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Promotion.deleteMany({})]);
  console.log('Datos anteriores eliminados\n');

  // Categorías
  console.log('Subiendo categorías...');
  const catMap = {};
  for (const c of data.categories) {
    process.stdout.write(`  ${c.name}... `);
    const image = await uploadImage(c.img);
    const cat = await Category.create({ name: c.name, image });
    catMap[c.name] = cat._id;
    console.log('✓');
  }

  // Productos
  console.log('\nSubiendo productos...');
  for (const p of data.products) {
    process.stdout.write(`  ${p.name} (${p.capacity})... `);
    const image = await uploadImage(p.img);
    await Product.create({
      name: p.name,
      capacity: p.capacity,
      price: p.price,
      category: catMap[p.category],
      image,
    });
    console.log('✓');
  }

  // Promociones
  console.log('\nSubiendo promociones...');
  for (const pr of data.promotions) {
    process.stdout.write(`  ${pr.title}... `);
    const image = await uploadImage(pr.img);
    await Promotion.create({ title: pr.title, description: pr.description, image });
    console.log('✓');
  }

  console.log('\n✅ Seed completado:');
  console.log(`   ${data.categories.length} categorías`);
  console.log(`   ${data.products.length} productos`);
  console.log(`   ${data.promotions.length} promociones`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
