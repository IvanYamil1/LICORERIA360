require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const cat = await Category.findOne({ name: /^jarritos$/i });
  if (!cat) { console.error('Jarritos no encontrada'); process.exit(1); }
  const res = await Product.updateOne(
    { category: cat._id, name: /^jarritos\s+de\s+lata/i },
    { $set: { name: 'Jarritos de Lata Sabor', capacity: 'Piña,Tamarindo,Mandarina, Tutifruti' } }
  );
  console.log('Lata actualizada:', res.modifiedCount);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
