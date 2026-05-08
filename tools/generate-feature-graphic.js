// Genera el feature graphic 1024x500 requerido por Google Play.
// Usa el logo de la app sobre un fondo negro centrado.
// Uso: node tools/generate-feature-graphic.js

const path = require('path');
const fs = require('fs');

let sharp;
try { sharp = require('sharp'); } catch {
  console.error('Falta sharp. Instálalo con: npm install --no-save sharp');
  process.exit(1);
}

const LOGO = path.join(__dirname, '..', 'assets', 'logo-licoreria.png');
const OUT = path.join(__dirname, '..', 'assets', 'feature-graphic.png');

const W = 1024;
const H = 500;
const BG = '#000000';

(async () => {
  if (!fs.existsSync(LOGO)) {
    console.error('No existe', LOGO);
    process.exit(1);
  }

  // Logo escalado al ~70% del alto, manteniendo proporción
  const logoH = Math.round(H * 0.75);
  const resizedLogo = await sharp(LOGO)
    .resize({ height: logoH, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: W, height: H, channels: 4, background: BG },
  })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toFile(OUT);

  console.log('✓ Generado:', OUT, '(1024x500)');
})().catch((e) => { console.error(e); process.exit(1); });
