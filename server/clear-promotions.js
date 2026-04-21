require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Promotion = require('./models/Promotion');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await Promotion.deleteMany({});
  console.log(`Eliminadas ${res.deletedCount} promociones`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
