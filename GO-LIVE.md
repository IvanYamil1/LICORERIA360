# Pasos exactos para subir Licorería 369 a producción

Sigue esto en orden. Cada paso tiene "qué hacer" y "cómo verificar que quedó".

---

## Paso 1 — Hospedar Privacy / Terms (5 min)

### Opción A — Vercel (recomendado, gratis y rápido)
1. Crea cuenta en https://vercel.com con tu GitHub.
2. En tu PC:
   ```bash
   cd public-legal
   npx --yes vercel
   ```
3. Sigue las preguntas (acepta los defaults). Al final te dará una URL como:
   ```
   https://public-legal-xxxxx.vercel.app
   ```
4. **Guarda estas dos URLs** (las pondrás en las stores):
   - `https://tu-deploy.vercel.app/privacy.html`
   - `https://tu-deploy.vercel.app/terms.html`

### Opción B — Notion (más simple aún)
1. Crea dos páginas en Notion: una con el contenido de `public-legal/privacy.html` y otra con `terms.html` (copia el texto plano).
2. En cada página: **Share → Publish to web**.
3. Copia las URLs públicas.

✅ **Verifica**: abre las URLs desde un navegador en modo incógnito. Si las ves sin login, está bien.

---

## Paso 2 — Desplegar el backend en Render (10 min)

1. Sube el repo a GitHub si aún no:
   ```bash
   git add .
   git commit -m "Listo para deploy"
   git push origin main
   ```

2. En https://render.com:
   - **New > Blueprint**
   - Conecta tu repo de GitHub
   - Render leerá `server/render.yaml` automáticamente

3. Render te pedirá rellenar las **secrets**:

   | Variable | De dónde sale |
   |---|---|
   | `MONGODB_URI` | tu URI de Mongo Atlas (la que tienes en `server/.env`) |
   | `JWT_SECRET` | **Genera uno nuevo** — no reutilices el de dev. Corre: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `CLOUDINARY_CLOUD_NAME`, `_API_KEY`, `_API_SECRET` | de `server/.env` |
   | `ALLOWED_ORIGINS` | déjalo vacío (apps nativas no lo requieren) |

4. Render despliega solo. Tendrás una URL como:
   ```
   https://licoreria369-api.onrender.com
   ```

5. **Crea el admin de producción** (desde tu PC):
   - Edita temporalmente `server/.env` y pon el `MONGODB_URI` de producción.
   - Corre: `cd server && node set-admin.js admin 'TuClaveSegura'`
   - Devuelve `server/.env` a tus valores locales.

✅ **Verifica**: abre `https://tu-backend.onrender.com/api/health` → debe devolver `{"ok":true}`.

---

## Paso 3 — Apuntar la app al backend de producción (2 min)

1. Edita `eas.json` líneas 17 y 25 — reemplaza `https://licoreria369-api.onrender.com/api` por tu URL real de Render.

   *Si tu nombre de servicio en Render fue `licoreria369-api`, no necesitas cambiar nada.*

✅ **Verifica**: abre `eas.json` y confirma que el `EXPO_PUBLIC_API_URL` apunta al dominio correcto.

---

## Paso 4 — Configurar Sentry (opcional pero recomendado, 5 min)

1. Crea cuenta en https://sentry.io
2. New Project → React Native → asígnale un nombre
3. Sentry te dará una **DSN** que se ve así: `https://abc123@oXXX.ingest.sentry.io/YYY`
4. Crea archivo `.env` en la **raíz** del proyecto (no en `server/`):
   ```
   EXPO_PUBLIC_SENTRY_DSN=https://abc123@oXXX.ingest.sentry.io/YYY
   ```

✅ **Verifica**: en `app/_layout.tsx` la DSN se inyecta en build. No reporta nada en dev.

---

## Paso 5 — Crear cuentas de developer

| Plataforma | Costo | Tiempo de activación |
|---|---|---|
| Apple Developer Program | $99 USD/año | 24-48h |
| Google Play Console | $25 USD una vez | inmediato |

- Apple: https://developer.apple.com/programs/
- Google: https://play.google.com/console/signup

> Empieza por Google. Apple tarda más.

---

## Paso 6 — Build con EAS (15 min build + 5 min config)

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login con tu cuenta de Expo (crea una si no tienes)
eas login

# Vincular el proyecto (crea projectId y lo pega en app.json)
eas init

# Build de Android (Google Play)
eas build --platform android --profile production
```

Esto tarda 10-20 min en el servidor de EAS. Al terminar te da un link al `.aab` que descargas.

Para iOS lo mismo pero `--platform ios`.

✅ **Verifica**:
- Antes de build, abre `app.json` y confirma que `extra.eas.projectId` tiene el valor que `eas init` puso.
- Descarga el `.apk` (con perfil `preview`) o `.aab` (con `production`) y prueba en dispositivo real.

---

## Paso 7 — Probar el build real

**Importante**: Expo Go NO refleja el comportamiento real. Las push notifications y algunos detalles solo funcionan en build.

```bash
# Build de prueba (APK instalable directo en Android)
eas build --platform android --profile preview
```

Descarga el APK al teléfono e instala. Verifica:

- [ ] Age gate aparece la primera vez
- [ ] Carga el catálogo desde el backend de producción
- [ ] Push notifications: pide permisos al entrar a las tabs
- [ ] Admin login funciona con las credenciales de producción
- [ ] Long-press 5 veces en "369" del home abre admin
- [ ] Pull-to-refresh funciona
- [ ] Se ve el ícono que generamos (no el placeholder de Expo)

Si todo OK, sigue al paso 8.

---

## Paso 8 — Subir a las stores

### 8a. Google Play

1. https://play.google.com/console → **Crear app**
2. Llena:
   - Nombre: **Licorería 369**
   - Idioma: Español
   - Tipo: Aplicación, Gratis
3. **Acceso a la app** → "Mi app no requiere acceso especial" (o sí, si pones el admin como restringido — para esta app está bien dejar acceso libre)
4. **Anuncios** → "No, mi app no contiene anuncios"
5. **Clasificación de contenido** → llena el cuestionario. Marca:
   - Bebidas alcohólicas: Sí
   - Para personas mayores de 18 años: Sí
6. **Audiencia** → "18 años en adelante"
7. **Política de privacidad URL** → la URL del Paso 1
8. **Subir el AAB** desde Producción → Crear nueva versión
9. **Capturas de pantalla** (mínimo 4):
   - Tómalas desde el APK instalado: home, categorías, una categoría con productos, panel admin
   - Tamaño mínimo: 320px del lado corto
10. **Feature graphic** 1024×500 (créalo en Canva con el logo)
11. **Ícono** 512×512 (Play lo escala automáticamente desde el 1024 que ya generaste)
12. **Países**: México (o donde vendas)
13. **Enviar a revisión** (2-7 días)

### 8b. Apple App Store

1. https://appstoreconnect.apple.com → **My Apps → +**
2. Bundle ID: `com.licoreria369.app` (debe coincidir con `app.json`)
3. SKU: cualquier identificador único, ej. `licoreria369-app-001`
4. Llena metadata: nombre, descripción, keywords
5. **App Privacy** → marca que NO recopilas datos
6. **Privacy Policy URL** → del Paso 1
7. **Age Rating** → llena el cuestionario marcando:
   - Frecuente referencia a alcohol/tabaco/drogas
8. Sube el IPA con:
   ```bash
   eas submit --platform ios --latest
   ```
9. **Capturas** desde simulador o dispositivo real (5-8 imágenes)
10. **Enviar a revisión** (24-48h primera vez)

> **Si Apple rechaza** la primera vez (común con apps de alcohol):
> - Responde explicando que es un catálogo informativo (sin ventas dentro de la app)
> - Que tiene gate de verificación de edad
> - Que no se entrega contenido a menores
> Usualmente aceptan en el segundo intento.

---

## Checklist final pre-envío

- [ ] Privacy URL pública abre y muestra el contenido
- [ ] Terms URL pública abre y muestra el contenido
- [ ] `https://tu-backend.onrender.com/api/health` devuelve `{"ok":true}`
- [ ] `eas.json` apunta al backend de producción correcto
- [ ] Probaste el APK/IPA real en un dispositivo físico
- [ ] El age gate aparece y bloquea si dice "No"
- [ ] Login admin de producción funciona
- [ ] Push notifications piden permisos en el build real
- [ ] Íconos de la app se ven bien (no placeholders)
- [ ] Datos de contacto en `app/about.tsx` actualizados con info real del negocio
- [ ] Cuenta Google Play activa
- [ ] Cuenta Apple Developer activa (si vas a iOS)
- [ ] Screenshots tomados (4-8 por plataforma)
- [ ] Feature graphic Android creado (1024×500)

---

## ⚠️ LO QUE NO PUEDES OLVIDAR EN LAS STORES (causas comunes de rechazo)

### Apple App Store

1. **Sign-In Information (credenciales de prueba)** — Apple requiere que les des un usuario y contraseña de admin para que los reviewers puedan probar el panel. En la sección "App Review > Sign-In Information" pega:
   - Usuario: el admin que creaste con `set-admin.js`
   - Contraseña: la que pusiste
   - **Notas (importante)**: "Para acceder al panel de admin, mantenga presionado 5 veces sobre el '369' en el título 'LICORERIA 369' de la pantalla de inicio."
2. **Age Rating**: marca **17+** y declara contenido frecuente de alcohol/tabaco/drogas.
3. **App Privacy section**: declara estos datos:
   - **Identificadores → Identificador de dispositivo**: SÍ se recopila (push token), no vinculado a identidad, no usado para tracking
   - **Diagnóstico → Datos de bloqueo**: SÍ se recopila (Sentry), no vinculado a identidad
   - Todo lo demás: NO recopilado
4. **Privacy Policy URL** (la de Vercel del Paso 1).
5. **Trademark disclaimer en la descripción**: agrega al final algo como "Licorería 369 es un punto de venta autorizado. Todas las marcas mostradas pertenecen a sus respectivos titulares."
6. **App Description**: incluye explícitamente "**Esta aplicación es un catálogo informativo. No se realizan ventas dentro de la app.**" Esto reduce el riesgo de rechazo por venta de alcohol.
7. **Disponibilidad geográfica**: solo México (o donde puedas vender legalmente).

### Google Play Console

1. **Acceso a la app (App Access)**:
   - Marca "Mi app tiene partes restringidas con login"
   - Provee credenciales de prueba del admin
   - Instrucciones: "Mantener presionado 5 veces sobre '369' en el título de la pantalla de inicio"
2. **Clasificación de contenido**: llena el cuestionario marcando **bebidas alcohólicas: SÍ, frecuente**.
3. **Audiencia objetivo**: 18 años en adelante.
4. **Política de privacidad URL**: la URL pública de Vercel.
5. **Data Safety form** (lo más confuso, hazlo así):
   - **¿La app recopila datos?** SÍ
   - Datos recopilados:
     - **App activity / Other actions**: identificador de notificaciones push (no asociado a identidad, opcional, propósito = funcionalidad de la app)
     - **App info and performance / Crash logs**: SÍ (Sentry, no asociado a identidad, opcional, propósito = analytics)
     - **App info and performance / Diagnostics**: SÍ (Sentry)
   - **¿Se comparten con terceros?** Sí — Expo (push) y Sentry (crash). Marca "Service providers".
   - **¿Cumple con prácticas de seguridad?** SÍ (encriptado en tránsito, eliminación bajo solicitud).
6. **Anuncios**: NO contiene anuncios.
7. **Países**: México únicamente.

### Si te rechazan

- **Apple primer rechazo común**: "App is misleading / app rejected under 1.4.3 (alcohol)". Respuesta: "Esta app es un catálogo informativo. No se procesan compras dentro de la app. Cuenta con verificación de edad obligatoria al ingresar. Política de privacidad disponible en [URL]."
- **Google primer rechazo común**: "Restricted Content". Respuesta: ajusta el rating de contenido a 18+ y declara contenido alcohólico frecuente.

## Después de publicar

### Actualizaciones rápidas (sin pasar por revisión)
Si solo cambias contenido (productos, promos, banners) → no necesitas nuevo build, ya está manejado por el admin.

Si cambias código JS → puedes usar **OTA updates** con Expo:
```bash
eas update --branch production
```
Los usuarios reciben el cambio la próxima vez que abran la app.

### Cambios que SÍ requieren nuevo build
- Cambio de permisos en `app.json`
- Versión nueva (incrementa `version` y `versionCode`/`buildNumber`)
- Cambios en assets nativos (ícono, splash)

### Mantenimiento operativo
- Revisa **Sentry** semanal → arregla crashes
- Revisa **audit logs** en Mongo si sospechas algo
- Cambia la contraseña del admin cada 6 meses
- Actualiza `JWT_SECRET` si crees que se filtró (esto invalida todos los tokens activos)
