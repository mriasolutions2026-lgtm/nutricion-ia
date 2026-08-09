# 📱 NutricionLu — Guía de Setup Mobile (PWA + Android + iOS)

> **NutricionLu v3.0** — Tu asistente nutricional con IA  
> Esta guía cubre todo el proceso para publicar la app en Google Play Store y Apple App Store.

---

## 📋 Índice

1. [Prerequisitos del Sistema](#prerequisitos)
2. [Instalar Dependencias Node.js](#step-1-instalar-dependencias)
3. [Inicializar Capacitor](#step-2-inicializar-capacitor)
4. [Generar Iconos](#step-3-generar-iconos)
5. [Agregar Plataformas](#step-4-agregar-plataformas)
6. [Sincronizar y Build](#step-5-sincronizar-y-build)
7. [Android Studio — Generar APK/AAB](#step-6-android-studio)
8. [Xcode — Generar IPA (iOS)](#step-7-xcode-ios)
9. [Publicar en Google Play Store](#step-8-google-play-store)
10. [Publicar en Apple App Store](#step-9-apple-app-store)
11. [PWA — Instalar desde el navegador](#step-10-pwa-web)
12. [Solución de Problemas](#troubleshooting)

---

## 🔧 Prerequisitos

### Para Android
| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18 LTS o superior | https://nodejs.org |
| Java JDK | 17 o superior | https://adoptium.net |
| Android Studio | Ladybug 2024.1+ | https://developer.android.com/studio |
| Android SDK | API 24+ (Android 7.0+) | Via Android Studio |

### Para iOS (requiere Mac)
| Herramienta | Versión mínima | Notas |
|---|---|---|
| macOS | Ventura 13+ | Xcode solo funciona en Mac |
| Xcode | 15+ | Desde Mac App Store |
| CocoaPods | 1.12+ | `sudo gem install cocoapods` |
| Apple Developer Account | — | https://developer.apple.com ($99/año) |

### Python (para iconos)
```bash
pip install Pillow
```

---

## Step 1: Instalar Dependencias

Navegar al directorio del proyecto y ejecutar:

```bash
cd "c:/Users/marce/OneDrive/Documents/MR IA Nutricion/nutricion-ia"

# Instalar todas las dependencias de Capacitor
npm install
```

Esto instalará:
- `@capacitor/core` — Core de Capacitor
- `@capacitor/android` — Soporte Android
- `@capacitor/ios` — Soporte iOS
- `@capacitor/local-notifications` — Notificaciones locales
- `@capacitor/splash-screen` — Splash screen nativo
- `@capacitor/status-bar` — Control del status bar
- `@capacitor/camera` — Acceso a cámara nativa
- `@capacitor/cli` — CLI de Capacitor (dev)

**Tiempo estimado:** 2-5 minutos según conexión.

---

## Step 2: Inicializar Capacitor

El archivo `capacitor.config.json` ya está creado con la configuración correcta. Solo necesitás inicializar si es la primera vez:

```bash
# Verificar que la config es correcta
cat capacitor.config.json

# Si necesitás reinicializar (normalmente no es necesario):
npx cap init "NutricionLu" "com.nutricionlu.app" --web-dir "."
```

La configuración ya incluye:
- **App ID:** `com.nutricionlu.app`
- **Web Dir:** `.` (raíz del proyecto)
- **Scheme:** HTTPS para Android e iOS

---

## Step 3: Generar Iconos

```bash
cd icons

# Con Pillow instalado (alta calidad con gradientes):
pip install Pillow
python generate_icons.py

# El script genera automáticamente:
# icon-72.png, icon-96.png, icon-128.png, icon-144.png
# icon-152.png, icon-192.png, icon-384.png, icon-512.png
```

> **Nota:** Para producción en stores, se recomienda crear iconos profesionales en Figma o Adobe Illustrator basándose en `icon-512.svg` como referencia.

### Requisitos de iconos por plataforma:
- **Google Play:** 512×512px PNG (sin transparencia)
- **App Store:** 1024×1024px PNG (sin transparencia, sin bordes redondeados)
- **PWA:** Mínimo 192×192px y 512×512px

---

## Step 4: Agregar Plataformas

### Android:
```bash
cd "c:/Users/marce/OneDrive/Documents/MR IA Nutricion/nutricion-ia"

npx cap add android
```

Esto crea la carpeta `android/` con el proyecto nativo de Android Studio.

### iOS (solo en Mac):
```bash
npx cap add ios
```

Esto crea la carpeta `ios/` con el proyecto nativo de Xcode.

---

## Step 5: Sincronizar y Build

Cada vez que modifiques el código web, ejecutar:

```bash
# Copiar archivos web al proyecto nativo y sincronizar plugins
npx cap copy && npx cap sync

# O usando el script de npm:
npm run cap:sync
```

**¿Cuándo ejecutar cap sync?**
- Después de instalar nuevos plugins de Capacitor
- Después de modificar `capacitor.config.json`
- Antes de generar un nuevo APK/IPA

---

## Step 6: Android Studio

### Abrir el proyecto:
```bash
# Abrir en Android Studio automáticamente
npx cap open android

# O manualmente: Abrir Android Studio → Open → seleccionar /android
```

### Configurar firma (Signing):

1. En Android Studio: **Build → Generate Signed Bundle / APK**
2. Seleccionar **Android App Bundle (AAB)** para Play Store, o **APK** para distribución directa
3. Crear nuevo keystore (guardar seguro, lo necesitarás siempre):
   ```
   Key store path: nutricionlu-keystore.jks
   Password: [elige una contraseña segura]
   Key alias: nutricionlu
   Key password: [idem]
   First and Last Name: Tu nombre
   Organization: NutricionLu
   Country Code: AR
   ```
4. Seleccionar **Release** como build variant
5. Click **Finish**

### Actualizar versión:

Editar `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 1        // Incrementar en cada release
        versionName "3.0.0"  // Versión visible al usuario
    }
}
```

### Configurar permisos de Salud (Health Connect):

Para que la app lea datos del smartwatch (Google Fit, Samsung Health, etc.) en Android:
1. Abrir `android/app/src/main/AndroidManifest.xml`.
2. Agregar las siguientes declaraciones dentro de la etiqueta `<manifest>` (fuera de `<application>`):
   ```xml
   <!-- Permisos de Google Health Connect -->
   <uses-permission android:name="android.permission.health.READ_STEPS"/>
   <uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED"/>
   <uses-permission android:name="android.permission.health.READ_DISTANCE"/>
   <uses-permission android:name="android.permission.health.READ_HEART_RATE"/>
   <uses-permission android:name="android.permission.health.READ_SLEEP"/>
   ```
3. Requerido para publicar y para que el sistema reconozca la app de salud en Android 14+: Agregar el siguiente `intent-filter` dentro de la etiqueta `<activity>` de la clase principal (`MainActivity`) en `AndroidManifest.xml`:
   ```xml
   <intent-filter>
       <action android:name="androidx.health.platform.client.ACTION_SHOW_PERMISSIONS_RATIONALE" />
   </intent-filter>
   ```

### Outputs:
- **AAB** (`app-release.aab`): Para Google Play Store ✅
- **APK** (`app-release.apk`): Para instalación directa / testing

---

## Step 7: Xcode (iOS) — Solo Mac

### Abrir el proyecto:
```bash
npx cap open ios
```

### Configurar en Xcode:

1. Seleccionar el proyecto `App` en el navigator
2. En **Signing & Capabilities**:
   - Team: Seleccionar tu Apple Developer account
   - Bundle Identifier: `com.nutricionlu.app`
   - Signing Certificate: iOS Distribution

3. En **General**:
   - Version: `3.0.0`
   - Build: `1` (incrementar en cada release)

### Configurar iconos en Xcode:

1. Drag & drop el `icon-1024.png` en **Assets.xcassets → AppIcon**
2. Xcode generará automáticamente los tamaños necesarios, o usar un generador como [appicon.co](https://www.appicon.co)

### Generar Archive:

1. Seleccionar `Any iOS Device (arm64)` como destino
2. **Product → Archive**
3. Una vez completado: **Distribute App → App Store Connect**
4. Seguir el wizard de subida

### Configurar permisos de Salud (HealthKit):

Para que la app lea datos del Apple Watch en iOS:
1. En Xcode, seleccionar el proyecto **App** en el panel de navegación izquierdo.
2. Ir a la pestaña **Signing & Capabilities**.
3. Hacer clic en **+ Capability** (esquina superior izquierda) y añadir **HealthKit**.
4. Abrir `ios/App/App/Info.plist` y agregar las llaves de descripción de uso:
   ```xml
   <key>NSHealthShareUsageDescription</key>
   <string>NutricionLu necesita acceso a tus métricas de salud (pasos, calorías y sueño) para integrarlas en tu progreso y metas nutricionales.</string>
   <key>NSHealthUpdateUsageDescription</key>
   <string>NutricionLu puede guardar registros de hidratación o peso en tu app de Salud si así lo deseas.</string>
   ```

### TestFlight (Beta Testing):

1. Subir el archive a App Store Connect
2. En [App Store Connect](https://appstoreconnect.apple.com) → Tu app → TestFlight
3. Agregar testers internos o externos
4. Los testers instalan via la app TestFlight

---

## Step 8: Google Play Store

### Crear la app en Play Console:

1. Ir a [Google Play Console](https://play.google.com/console)
2. **Crear app** → completar:
   - Nombre: `NutricionLu`
   - Idioma predeterminado: Español
   - Tipo: App
   - Categoría: Salud y fitness

### Información requerida:
- **Ícono de alta resolución:** 512×512px PNG
- **Gráfico de funciones (Feature Graphic):** 1024×500px
- **Capturas de pantalla:** Mínimo 2 por tipo de dispositivo
  - Teléfono: 320-3840px (aspecto 9:16 o 16:9)
  - Tablet 7" (opcional)
  - Tablet 10" (opcional)

### Subir el AAB:

1. **Versiones → Producción → Crear nueva versión**
2. Subir el archivo `.aab` generado por Android Studio
3. Completar las novedades de la versión
4. Guardar y enviar a revisión

### Tiempo de revisión:
- Primera vez: 7-14 días
- Actualizaciones: 1-3 días

### Política de privacidad:
- **Requerida** para apps con IA y datos de salud
- Crear una página web con la política de privacidad
- Ejemplo base disponible en: https://www.privacypolicytemplate.net

---

## Step 9: Apple App Store

### Crear la app en App Store Connect:

1. Ir a [App Store Connect](https://appstoreconnect.apple.com)
2. **Mis Apps → (+) Nueva App**
3. Completar:
   - Plataformas: iOS
   - Nombre: `NutricionLu`
   - Idioma: Español
   - Bundle ID: `com.nutricionlu.app`
   - SKU: `nutricionlu-ios-001`

### Información requerida:
- **Ícono de app:** 1024×1024px PNG (sin transparencia)
- **Capturas de pantalla:**
  - iPhone 6.9" Display: 1320×2868px (requerido)
  - iPhone 6.5" Display: 1242×2688px (requerido)
  - iPad Pro 12.9" (si aplica)
- **Descripción:** Máx 4000 caracteres
- **Palabras clave:** Máx 100 caracteres
- **URL de soporte:** Requerida
- **URL de política de privacidad:** Requerida

### Subir la IPA:

El build se sube automáticamente via Xcode (paso 7) o con la herramienta `altool`:

```bash
xcrun altool --upload-app -f NutricionLu.ipa \
  -u "tu@email.com" \
  -p "app-specific-password"
```

### Tiempo de revisión:
- Primera revisión: 24-48 horas (puede ser más)
- Actualizaciones: 24 horas

### Tips para aprobación de apps de salud:
- La descripción debe ser clara sobre qué hace la IA
- Incluir disclaimer: "No reemplaza consejo médico profesional"
- Si usa datos de salud, justificar el uso en el formulario de revisión

---

## Step 10: PWA — Instalar desde el Navegador

La app ya es una PWA completa. Para instalarla sin stores:

### Android (Chrome):
1. Abrir la URL de la app en Chrome
2. Chrome muestra automáticamente "Agregar a pantalla de inicio"
3. O: Menú (⋮) → "Instalar aplicación"

### iOS (Safari):
1. Abrir la URL en Safari
2. Tocar el botón Compartir (⬜↑)
3. "Agregar a pantalla de inicio"

### Desktop (Chrome/Edge):
1. Icono de instalación en la barra de direcciones
2. Click → "Instalar"

### Verificar PWA con Chrome DevTools:
```
F12 → Application → Manifest  → verificar que cargue
     Application → Service Workers → verificar que esté activo
     Lighthouse → Generate Report → PWA score
```

---

## 🔧 Troubleshooting

### Error: "JAVA_HOME is not set"
```bash
# Windows: agregar a variables de entorno del sistema
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x"
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

### Error: "Android SDK not found"
```bash
# En Android Studio: File → Project Structure → SDK Location
# Copiar el path y agregar:
setx ANDROID_HOME "C:\Users\TuUsuario\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
```

### Error: "cap sync" falla con plugins
```bash
# Limpiar y reinstalar
rm -rf node_modules
npm install
npx cap sync
```

### La app no carga en Android Studio
```bash
# Verificar que webDir en capacitor.config.json coincide con los archivos
npx cap copy android
# Limpiar build en Android Studio: Build → Clean Project
```

### iOS: Perfil de provisioning no válido
- Verificar que el Bundle ID coincide exactamente en App Store Connect y Xcode
- Revocar y regenerar el certificado en [developer.apple.com](https://developer.apple.com)

### Service Worker no se activa
- La app debe servirse sobre HTTPS (o localhost)
- Chrome: `chrome://serviceworker-internals/` para debugging
- Forzar update: DevTools → Application → Service Workers → Update

---

## 📚 Recursos Adicionales

| Recurso | URL |
|---|---|
| Documentación Capacitor | https://capacitorjs.com/docs |
| Google Play Console Help | https://support.google.com/googleplay/android-developer |
| App Store Review Guidelines | https://developer.apple.com/app-store/review/guidelines |
| PWA Builder (herramienta Microsoft) | https://www.pwabuilder.com |
| Lighthouse PWA Audit | Chrome DevTools → Lighthouse |
| Android Keystore docs | https://developer.android.com/studio/publish/app-signing |

---

## 🚀 Checklist de Release

### Pre-release:
- [ ] Iconos generados en todos los tamaños
- [ ] `manifest.json` validado
- [ ] Service Worker funcionando (Lighthouse ≥ 90 PWA)
- [ ] `versionCode` y `versionName` actualizados
- [ ] Screenshots preparadas para las stores
- [ ] Política de privacidad publicada
- [ ] Keystore guardado en lugar seguro

### Android:
- [ ] AAB firmado generado con release keystore
- [ ] Probado en dispositivo real Android 7+
- [ ] Subido a Google Play Console
- [ ] Track interno → Alpha → Beta → Producción

### iOS:
- [ ] Archive creado en Xcode con Release scheme
- [ ] Subido a App Store Connect
- [ ] Probado en TestFlight con dispositivo real
- [ ] Enviado a revisión de Apple

---

*Documento generado el 2026-05-29 — NutricionLu v3.0*
