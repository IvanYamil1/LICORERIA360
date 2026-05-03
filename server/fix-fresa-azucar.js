require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const cat = await Category.findOne({ name: /^peñafiel$/i });
  if (!cat) { console.error('Peñafiel no encontrada'); process.exit(1); }

  // Order 6 = regular Peñafiel Fresa (con azucar)
  const a = await Product.updateOne(
    { category: cat._id, order: 6 },
    { $set: { name: 'Peñafiel Fresa', capacity: '2 L' } }
  );
  console.log('Order 6 (con azucar):', a.modifiedCount);

  // Order 12 = Peñafiel Fresa sin azucar
  const b = await Product.updateOne(
    { category: cat._id, order: 12 },
    { $set: { name: 'Peñafiel Fresa sin azucar', capacity: '2 L' } }
  );
  console.log('Order 12 (sin azucar):', b.modifiedCount);

  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
