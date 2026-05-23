ARGENTIXTV v2.3.0 - DEPLOY NETLIFY + PROXY ARGENTINA

IMPORTANTE
Netlify puede alojar la web y funcionar como proxy de respaldo, pero para canales argentinos bloqueados por IP extranjera se debe instalar proxy-server/ en un VPS con IP argentina.

FRONTEND EN NETLIFY
Opcion recomendada: GitHub + Netlify.
1) Descomprimir este ZIP.
2) Subir la carpeta completa a un repositorio GitHub.
3) En Netlify: Add new project > Import an existing project.
4) Configuracion:
   - Build command: dejar vacio
   - Publish directory: public
   - Functions directory: netlify/functions
5) Deploy.

PROBAR FUNCION NETLIFY DE RESPALDO
https://TU-SITIO.netlify.app/.netlify/functions/proxy?url=https%3A%2F%2Fexample.com
Debe responder algo distinto a 404.

PROXY ARGENTINA
1) Contratar VPS con IP argentina.
2) Instalar proxy-server/ siguiendo README_VPS_ARGENTINA_PROXY.txt.
3) En ArgentixTV: Admin > Info > Proxy Argentina.
4) Pegar: https://proxy.tudominio.com/proxy?url=
5) Guardar proxy > Probar proxy.

IPTV LEGAL/AUTORIZADO
Admin > Playlists permite:
- URL M3U directa.
- Datos Xtream Codes: servidor + usuario + contraseña.

CREDENCIAL INICIAL
Usuario: argentixtv
Clave: Ariel2026
