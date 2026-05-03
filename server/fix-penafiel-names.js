require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const FIXES = [
  // [matchRegex, newName, newCapacity]
  [/^twist\s+limon/i,                           'Twist Limon',                '2 L y 600 ml'],
  [/^peñafiel\s+fresa(\s+sin)?\s*y?\s*$/i,      'Peñafiel Fresa sin azucar',  '2 L'],
  [/^peñafiel\s+fresa\s+sin\s+azucar/i,         'Peñafiel Fresa sin azucar',  '2 L'],
  [/^peñafiel\s+toronja/i,                       'Peñafiel Toronja',           '2 L'],
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const cat = await Category.findOne({ name: /^peñafiel$/i });
  if (!cat) { console.error('Peñafiel no encontrada'); process.exit(1); }

  let total = 0;
  for (const [re, name, capacity] of FIXES) {
    const res = await Product.updateMany(
      { category: cat._id, name: re },
      { $set: { name, capacity } }
    );
    console.log(`  ${name.padEnd(34)} → ${res.modifiedCount} actualizados`);
    total += res.modifiedCount;
  }
  console.log(`\n✅ ${total} productos corregidos`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
