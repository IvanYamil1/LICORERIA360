require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const corona = await Category.findOne({ name: /^corona$/i });
  if (!corona) { console.error('No se encontró Corona'); process.exit(1); }
  const res = await Product.updateMany({ category: corona._id }, { $unset: { price: '' } });
  console.log(`Actualizados ${res.modifiedCount} productos de Corona (precio quitado)`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
