ARGENTIXTV v2.3.0 - NETLIFY + PROXY ARGENTINA + IPTV M3U/XTREAM

QUE TRAE ESTE PAQUETE
1) public/index.html: app web para Netlify.
2) netlify/functions/proxy.js: proxy Netlify de respaldo.
3) proxy-server/: proxy Node.js para instalar en VPS con IP argentina.
4) Panel Admin actualizado:
   - Info > Proxy Argentina: pegar URL https://tu-dominio.com/proxy?url=
   - Playlists > cargar M3U o Xtream Codes.

DEPLOY FRONTEND EN NETLIFY
Opcion recomendada: subir esta carpeta completa a GitHub y conectar Netlify.
Configuracion:
- Publish directory: public
- Functions directory: netlify/functions
- Build command: vacio

CREDENCIAL INICIAL
Usuario: argentixtv
Clave: Ariel2026

USO OPCION 2 - PROXY ARGENTINA
1) Contratar un VPS con IP argentina real.
2) Instalar el contenido de proxy-server/ en el VPS.
3) Activar HTTPS con dominio propio, por ejemplo https://proxy.tudominio.com
4) En ArgentixTV: Admin > Info > Proxy Argentina.
5) Pegar: https://proxy.tudominio.com/proxy?url=
6) Guardar y Probar proxy.

USO OPCION 1 - IPTV LEGAL/AUTORIZADO
1) Obtener URL M3U o datos Xtream de un proveedor autorizado.
2) En ArgentixTV: Admin > Playlists.
3) Pegar URL M3U o completar Xtream.
4) La app parsea canales, logos y grupos automáticamente.

NOTA IMPORTANTE
Los canales gratuitos embebidos son experimentales. Si bloquean IP extranjera, usar proxy Argentina. Si bloquean hotlinking, tokens o requieren navegador específico, puede seguir fallando. Para estabilidad real, usar listas autorizadas diseñadas para IPTV.
