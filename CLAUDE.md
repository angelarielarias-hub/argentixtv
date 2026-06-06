# CLAUDE.md — ArgentixTV

Guía de referencia para asistentes de IA que trabajen en este repositorio.

---

## Descripción del proyecto

**ArgentixTV** es una aplicación PWA (Progressive Web App) de streaming de televisión argentina. Permite ver canales HLS en vivo, cargar listas IPTV (M3U / Xtream Codes) y gestionar usuarios. Está diseñada para desplegarse en Netlify con un servidor proxy opcional en un VPS con IP argentina para acceder a canales geo-restringidos.

**Versión actual:** 2.3.6  
**Credenciales por defecto:** usuario `argentixtv` / contraseña `Ariel2026`

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Vanilla JavaScript, HTML5, CSS3 (sin frameworks) |
| Video | HLS.js v1.4.12 (CDN) + `<video>` nativo |
| Hosting frontend | Netlify (directorio `public/`) |
| Funciones serverless | Netlify Functions (ESBuild) |
| Despliegue alternativo | Cloudflare Workers (wrangler) |
| Proxy VPS | Node.js 18 + Express 4, Docker, Nginx, systemd |
| Persistencia | `localStorage` del navegador (sin base de datos) |
| PWA | `manifest.json` + `sw.js` |

---

## Estructura de directorios

```
argentixtv/
├── index.html                    # App completa (SPA, ~61KB) — ARCHIVO PRINCIPAL
├── extracted_app.js              # Lógica JS extraída como referencia (no se carga en prod)
├── manifest.json                 # Configuración PWA
├── sw.js                         # Service Worker (limpia caché en actualizaciones)
├── package.json                  # Scripts de deploy y metadata
├── netlify.toml                  # Configuración de Netlify: cabeceras, funciones
├── wrangler.toml                 # Configuración de Cloudflare Workers
├── .gitignore
├── .wranglerignore
│
├── public/                       # Directorio de publicación de Netlify
│   ├── index.html                # Copia idéntica de /index.html
│   ├── manifest.json
│   └── sw.js
│
├── netlify/
│   └── functions/
│       └── proxy.js              # Función serverless: proxy HLS/M3U8
│
├── functions/                    # Copia de respaldo de netlify/functions/
│   └── proxy.js
│
└── proxy-server/                 # Servidor Express para VPS con IP argentina
    ├── package.json
    ├── server.js                 # Servidor proxy Express (puerto 3000)
    ├── Dockerfile
    ├── .env.example
    ├── argentixtv-proxy.service  # Unit systemd para auto-inicio
    └── nginx-argentixtv-proxy.conf
```

---

## Archivos clave

### `index.html` (y `public/index.html`)
Es el único archivo de la aplicación. Contiene CSS, JS y HTML embebidos en un solo documento. Toda la lógica de la app reside aquí:

- Sistema de login (usuarios en `localStorage`)
- Grilla de canales con filtros por categoría y búsqueda
- Reproductor HLS con HLS.js y controles personalizados
- Panel de administración: gestión de usuarios, carga de playlists, configuración del proxy
- ~30 canales argentinos incorporados (array `BUILTIN`)
- Soporte de teclado: flechas para navegar, Espacio para play/pause, `F` para pantalla completa
- OSD (display en pantalla) con info del canal

**Importante:** al modificar la app, siempre editar **ambos** archivos:
- `/index.html`
- `/public/index.html`

Ambos deben mantenerse sincronizados. El directorio `public/` es lo que Netlify publica.

### `netlify/functions/proxy.js`
Función serverless que actúa como proxy HTTP. Recibe `?url=<URL_codificada>` y reenvía la petición al upstream. Para manifiestos M3U8 reescribe las URLs internas para que también pasen por el proxy (función `rewriteManifest`). Bloquea IPs privadas (regex `PRIVATE_HOST_RE`).

**Endpoint:** `/.netlify/functions/proxy?url=<url>`

### `proxy-server/server.js`
Servidor Express equivalente para desplegarse en un VPS con IP argentina. Expone:
- `GET /proxy?url=<url>` — proxy HLS
- `GET /health` — estado del servicio

---

## Persistencia de datos (localStorage)

No hay base de datos. Todo se guarda en el navegador:

| Clave | Contenido |
|-------|-----------|
| `atv_db_v5` | Usuarios y playlists (esquema actual) |
| `atv_db_v4` | Esquema anterior (migración automática) |
| `atv_settings_v1` | URL del proxy personalizado |

Al actualizar el esquema de datos, incrementar el número de versión (`v5` → `v6`) e implementar migración automática desde la versión anterior.

---

## Arquitectura del proxy

Los canales geo-bloqueados requieren una IP argentina. La app soporta tres modos:

1. **Proxy Netlify** (fallback): `/.netlify/functions/proxy?url=`
2. **Proxy VPS Argentina** (recomendado): URL configurable en el panel admin, ej. `https://proxy.midominio.com/proxy?url=`
3. **Sin proxy**: URL directa del canal

La función `proxify()` en ambos archivos proxy reescribe las URLs de los manifiestos M3U8 para encadenar los segmentos HLS a través del mismo proxy.

---

## Flujos de desarrollo

### Requisitos previos
- Node.js >= 18
- Netlify CLI (`npm install -g netlify-cli`)

### Editar la aplicación
La app entera está en `index.html`. No hay proceso de compilación para el frontend.

1. Editar `/index.html` directamente
2. Copiar los cambios a `/public/index.html` (o usar `cp index.html public/index.html`)
3. Probar abriendo `public/index.html` en el navegador

### Scripts de despliegue
```bash
# Preview en URL temporal de Netlify
npm run deploy:preview

# Producción
npm run deploy:prod
```

Ambos scripts usan `--dir=public --functions=netlify/functions`.

### Proxy server (VPS)
```bash
cd proxy-server
npm install
npm start          # Levanta en puerto 3000
```

Variables de entorno (ver `.env.example`):
- `PORT` — puerto (por defecto 3000)
- `UPSTREAM_TIMEOUT_MS` — timeout para fetch upstream (por defecto 25000ms)

---

## Despliegue

### Netlify (producción)
- El directorio publicado es `public/` (configurado en `netlify.toml`)
- Las funciones están en `netlify/functions/`
- Cabeceras de seguridad definidas en `netlify.toml` (X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- El HTML se sirve con `Cache-Control: no-store` para evitar cacheo del cliente

### Cloudflare Workers (alternativo)
- Configurado en `wrangler.toml`
- Los assets se sirven desde `public/`

### VPS Argentina
Ver `README_VPS_ARGENTINA_PROXY.txt` para instrucciones completas de Ubuntu 22.04/24.04 con Node, Nginx, Certbot y systemd.

---

## Convenciones importantes

### Versionado
El número de versión aparece en varios lugares y debe actualizarse de forma consistente:
- `package.json` → campo `version`
- Mensajes de commit (convención: `v2.3.X - descripción corta`)
- `proxy-server/server.js` → respuesta del endpoint `/health`
- Comentarios o títulos dentro de `index.html`

### Seguridad
- La función proxy bloquea hosts privados (`PRIVATE_HOST_RE`) — no eliminar esta validación
- El proxy solo acepta `http:` y `https:` — no relajar esta restricción
- Las contraseñas de usuarios se almacenan ofuscadas (base64 invertido) en localStorage — no es cifrado real, es solo ofuscación
- El HTML usa escape de entidades para prevenir XSS al renderizar nombres de canales

### Mantenimiento de canales
Los canales incorporados están en el array `BUILTIN` dentro de `index.html`. Cada canal tiene:
- `id`: identificador único
- `name`: nombre visible
- `url`: URL del stream (HLS `.m3u8` o URL de YouTube)
- `logo`: URL del logo del canal
- `category`: categoría para filtrado
- `type`: `hls` o `youtube`

Al agregar canales, verificar que los streams HLS estén activos y que no requieran autenticación.

### Sin framework, sin transpilación
El JS usa características nativas del navegador moderno (async/await, fetch, URLSearchParams, etc.). No hay webpack, babel, ni TypeScript. No agregar dependencias de build sin discutirlo primero.

### Sin tests
No hay suite de tests. Al realizar cambios funcionales, probar manualmente en el navegador con las funcionalidades principales: login, reproducción de canal, filtros, panel admin.

---

## Notas para asistentes de IA

- **No crear archivos de build** — este proyecto no tiene pipeline de compilación para el frontend
- **Sincronizar siempre `index.html` y `public/index.html`** — son idénticos y Netlify usa el de `public/`
- **No introducir dependencias npm en el frontend** — la app carga HLS.js desde CDN por diseño
- **El proxy es stateless** — no almacena estado entre peticiones, no agregar persistencia
- **Respetar la restricción de IPs privadas** en la función proxy — es una medida de seguridad crítica
- **Al modificar el esquema de localStorage**, siempre implementar migración desde la versión anterior para no romper sesiones existentes
- **No hay CI/CD activo** — los deploys son manuales vía Netlify CLI o integración directa con GitHub
