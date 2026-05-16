import { Linking } from 'react-native';

// Número configurable vía EXPO_PUBLIC_WHATSAPP_NUMBER en .env o eas.json
// Formato: solo dígitos con código de país, ej. "525555555555" (México 52 + 10 dígitos)
const WHATSAPP_NUMBER = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '525555555555';

type Product = {
  name: string;
  capacity?: string;
  price?: number;
};

function formatPrice(price?: number) {
  if (price == null) return '';
  return `$${price.toLocaleString('es-MX')} MXN`;
}

// Manda mensaje sobre 1 producto
export async function orderSingleProduct(p: Product) {
  const parts = [
    'Hola, me interesa este producto:',
    `🍷 ${p.name}`,
    p.capacity ? `Presentación: ${p.capacity}` : '',
    p.price != null ? `Precio: ${formatPrice(p.price)}` : '',
    '',
    '¿Está disponible?',
  ].filter(Boolean);
  return openWhatsApp(parts.join('\n'));
}

// Manda mensaje con varios productos (carrito/favoritos)
export async function orderMultipleProducts(products: Product[]) {
  if (products.length === 0) return false;
  const lines = ['Hola, me interesa pedir los siguientes productos:', ''];
  products.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.name}${p.capacity ? ` (${p.capacity})` : ''}${
      p.price != null ? ` — ${formatPrice(p.price)}` : ''
    }`);
  });
  lines.push('', '¿Pueden confirmarme disponibilidad y total?');
  return openWhatsApp(lines.join('\n'));
}

async function openWhatsApp(message: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
