require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Captura capacidad EN CUALQUIER POSICIÓN del nombre.
// Acepta:
//   - "600 ml", "473ml", "2 L", "3L", "55 g", "8oz"
//   - Multi-capacidad: "2 L y 600 ml"
const CAP_RE = /\b(\d+(?:\.\d+)?\s*(?:ml|L|g|oz)\b(?:\s+y\s+\d+(?:\.\d+)?\s*(?:ml|L|g|oz)\b)*)/gi;

function extractCapacity(name) {
  const matches = [...name.matchAll(CAP_RE)].map((m) => m[1].trim());
  if (matches.length === 0) return { name: name.trim(), capacity: null };

  // Concatenar todas las capacidades (caso "2 L y 600 ml" sale en 1 sola)
  const capacity = matches.join(' / ');

  // Quitar todas del nombre, limpiar espacios duplicados / colgantes
  const cleanedName = name
    .replace(CAP_RE, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();

  return { name: cleanedName, capacity };
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({});
  let updated = 0;

  for (const p of products) {
    const { name: cleanedName, capacity: extracted } = extractCapacity(p.name);
    let changed = false;

    if (cleanedName && cleanedName !== p.name) {
      p.name = cleanedName;
      changed = true;
    }
    if (extracted && (!p.capacity || !p.capacity.trim())) {
      p.capacity = extracted;
      changed = true;
    }

    if (changed) {
      await p.save();
      updated++;
      console.log(`  "${cleanedName}" / "${p.capacity}"`);
    }
  }
  console.log(`\n✅ Actualizados ${updated} productos`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
