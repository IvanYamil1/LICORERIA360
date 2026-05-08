// Genera todos los íconos requeridos por Expo a partir de una imagen fuente.
// Uso:
//   1. npm install --no-save sharp
//   2. node tools/generate-app-icons.js <ruta-a-logo>
//   Ejemplo: node tools/generate-app-icons.js assets/logo-licoreria.png
//
// Crea:
//   assets/icon.png             (1024x1024, fondo negro, logo centrado)
//   assets/splash-icon.png      (1024x1024, igual que icon)
//   assets/adaptive-icon.png    (1024x1024 con safe area: logo escalado al 65% para Android)
//   assets/favicon.png          (48x48, para web)
//
// La imagen fuente puede ser de cualquier proporción. El script:
//   - Recorta a cuadrado (centra el contenido)
//   - Escala a las dimensiones de cada salida
//   - Pone fondo negro #000000 si la imagen tiene transparencia

const path = require('path');
const fs = require('fs');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('Falta sharp. Instálalo con:\n  npm install --no-save sharp');
  process.exit(1);
}

const src = process.argv[2];
if (!src) {
  console.error('Uso: node tools/generate-app-icons.js <ruta-a-logo>');
  process.exit(1);
}
if (!fs.existsSync(src)) {
  console.error('No existe:', src);
  process.exit(1);
}

const ASSETS = path.join(__dirname, '..', 'assets');
const BG = '#000000';

async function makeSquareWithBg(input, size, padding = 0) {
  // padding 0 = imagen ocupa todo el cuadrado; 0.35 = 35% safe area alrededor (para adaptive)
  const inner = Math.round(size * (1 - padding));
  const resized = await sharp(input)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size, height: size, channels: 4,
      background: BG,
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png();
}

(async () => {
  console.log('Generando íconos desde:', src);

  await (await makeSquareWithBg(src, 1024, 0.10)).toFile(path.join(ASSETS, 'icon.png'));
  console.log('  ✓ assets/icon.png (1024x1024)');

  await (await makeSquareWithBg(src, 1024, 0.20)).toFile(path.join(ASSETS, 'splash-icon.png'));
  console.log('  ✓ assets/splash-icon.png (1024x1024)');

  // Adaptive Android requiere ~33% safe area en los bordes
  await (await makeSquareWithBg(src, 1024, 0.33)).toFile(path.join(ASSETS, 'adaptive-icon.png'));
  console.log('  ✓ assets/adaptive-icon.png (1024x1024)');

  await (await makeSquareWithBg(src, 48, 0.10)).toFile(path.join(ASSETS, 'favicon.png'));
  console.log('  ✓ assets/favicon.png (48x48)');

  console.log('\nListo. Reinicia Expo con `npx expo start --clear` para que use los nuevos íconos.');
})().catch((e) => { console.error(e); process.exit(1); });
