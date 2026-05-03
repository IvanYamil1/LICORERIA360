require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await Product.updateOne(
    { name: 'Cepillos Dentales Colgate' },
    { $set: { colsInRow: 3 } },
  );
  console.log('matched:', res.matchedCount, 'modified:', res.modifiedCount);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
