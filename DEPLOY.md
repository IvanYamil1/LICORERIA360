# Licorería 369 — Guía de despliegue a producción

Esta guía cubre todo lo necesario para llevar la app a Play Store y App Store.

---

## 1. Backend en Render (gratis)

### 1.1 Crear cuenta y conectar repo
1. Ve a https://render.com y crea cuenta (puedes usar tu GitHub).
2. Sube este repositorio a GitHub si aún no está.
3. En Render: **New > Blueprint** y conecta el repo. Render detectará el `server/render.yaml` automáticamente.

### 1.2 Configurar las secrets
Render te pedirá los valores de las variables marcadas con `sync: false`. Llénalas con:

| Variable | Valor |
|---|---|
| `MONGODB_URI` | URI de Mongo Atlas (incluye user, password, cluster) |
| `JWT_SECRET` | Generar con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLOUDINARY_CLOUD_NAME` | Tu cloud name |
| `CLOUDINARY_API_KEY` | Tu api key |
| `CLOUDINARY_API_SECRET` | Tu api secret |
| `ALLOWED_ORIGINS` | Tus dominios web (puede dejarse vacío si solo usas la app nativa) |

> **Importante**: si vienes de desarrollo, usa **un JWT_SECRET nuevo** en producción (no reutilices el de dev).

### 1.3 Deploy
Render desplegará automáticamente. Tendrás una URL como:
```
https://licoreria369-api.onrender.com
```
Verifica que funciona: `https://licoreria369-api.onrender.com/api/health` debe devolver `{"ok":true}`.

### 1.4 Crear el admin en producción
La primera vez (desde tu máquina, apuntando a la DB de producción):
```bash
cd server
# Edita .env temporalmente con MONGODB_URI de producción
node set-admin.js admin 'TuContraseñaSegura'
```
Luego revierte el `.env` a tus valores locales.

---

## 2. App apuntando al backend de producción

Crea `.env` en la raíz del proyecto (no en `server/`):

```bash
EXPO_PUBLIC_API_URL=https://licoreria369-api.onrender.com/api
```

> Las variables `EXPO_PUBLIC_*` se inyectan en build time. Para que funcione, **debes hacer un nuevo build** después de definirlas (no basta recargar Expo Go).

---

## 3. Política de privacidad y términos públicos

Las stores requieren URLs **públicas** de los documentos legales. Tienes dos opciones:

### Opción simple — Notion (gratis)
1. Ve a notion.so y crea una página
2. Copia el contenido de `app/legal/privacy.tsx` y `app/legal/terms.tsx`
3. Publica ambas páginas en Notion (Share > Publish)
4. Guarda las URLs

### Opción profesional — Vercel (gratis)
Si tienes un dominio o sitio web, súbelas como `/privacy` y `/terms`.

Las URLs irán en:
- **App Store**: App Information > Privacy Policy URL
- **Play Store**: Policy > Privacy Policy

---

## 4. Cuentas de developer

### Apple
- Costo: **$99 USD/año**
- Registro: https://developer.apple.com/programs/
- Tarda 24-48h en activarse

### Google Play
- Costo: **$25 USD una sola vez**
- Registro: https://play.google.com/console/signup
- Activación inmediata

---

## 5. Build de la app con EAS

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login
eas login

# Configurar el proyecto (crea eas.json)
eas build:configure

# Build de Android (genera APK/AAB)
eas build --platform android --profile production

# Build de iOS (requiere cuenta Apple)
eas build --platform ios --profile production
```

Cuando EAS te dé el `projectId`, pégalo en `app.json` → `extra.eas.projectId`.

---

## 6. Subir a las stores

### Google Play
1. Play Console > Crear app
2. Llena: nombre, descripción corta y larga, idioma
3. Sube los assets:
   - Ícono 512x512
   - Feature graphic 1024x500
   - 4-8 screenshots (desde la app real)
4. **Política de privacidad URL** (la de Notion/Vercel)
5. **Clasificación de contenido**: marca "alcohol/bebidas alcohólicas"
6. **Países**: solo donde puedas vender (México por ejemplo)
7. **Restricción por edad**: 18+
8. Sube el AAB que generó EAS
9. Envía a revisión (2-7 días)

### Apple App Store
1. App Store Connect > My Apps > +
2. Bundle ID: `com.licoreria369.app` (igual que en `app.json`)
3. Llena toda la metadata
4. **Privacy Policy URL** obligatoria
5. **App Privacy** detalles: marca que NO recopilas datos personales
6. **Age Rating**: 17+ (alcohol)
7. Sube el IPA via `eas submit --platform ios`
8. Envía a revisión (24-48h primera vez)

> **Nota Apple**: la app puede ser rechazada al primer intento por ser de alcohol. Si pasa, responde explicando que es un catálogo informativo (no se realizan ventas dentro de la app) y que tiene gate de edad. Suelen aceptarla.

---

## 7. Después de publicar

### Cambiar la contraseña del admin
```bash
cd server
node set-admin.js admin 'NuevaContraseñaFuerte'
```

### Ver audit logs
Conéctate a Mongo Atlas y consulta la colección `auditlogs`:
```js
db.auditlogs.find().sort({ createdAt: -1 }).limit(50)
```

### Subir actualizaciones
1. Incrementa la versión en `app.json` (ej. `"version": "1.0.1"`)
2. Incrementa `ios.buildNumber` y `android.versionCode`
3. `eas build --platform all --profile production`
4. `eas submit --platform all`

---

## Checklist final antes del primer envío

- [ ] Backend desplegado y `/api/health` responde
- [ ] Admin creado en la DB de producción con contraseña fuerte
- [ ] `EXPO_PUBLIC_API_URL` apunta al backend de producción en `.env` raíz
- [ ] Política de privacidad URL pública creada
- [ ] Términos URL pública creada
- [ ] App.json tiene bundle ID, package name, versiones, descripción
- [ ] Datos de contacto en `app/about.tsx` actualizados (WhatsApp, dirección, horario)
- [ ] Assets generados: ícono 1024x1024, splash, adaptive icon Android
- [ ] Screenshots tomados (desde dispositivos reales o simulador)
- [ ] Cuenta de Apple Developer activa (si vas a iOS)
- [ ] Cuenta de Play Console activa
- [ ] EAS Build configurado (`eas build:configure` ejecutado)
- [ ] Probado el APK/IPA en dispositivo real, no solo Expo Go
- [ ] Gate de edad funciona: si dices "no" no entras
