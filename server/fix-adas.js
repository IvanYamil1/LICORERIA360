require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const cat = await Category.findOne({ name: /^peñafiel$/i });
  if (!cat) { console.error('Peñafiel no encontrada'); process.exit(1); }
  const res = await Product.updateOne(
    { category: cat._id, name: /^adas/i },
    {
      $set: {
        name: 'Adas 600ml',
        capacity: 'Sabores: Toronja, Manzana, Piña, Naranja, Limon, Fresa, Mango',
      },
    }
  );
  console.log('Adas actualizado:', res.modifiedCount);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
