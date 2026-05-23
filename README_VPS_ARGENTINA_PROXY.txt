INSTALACION DEL PROXY ARGENTINA EN VPS UBUNTU 22.04/24.04

REQUISITOS DEL VPS
- IP ubicada/geolocalizada en Argentina.
- Ubuntu 22.04 o 24.04.
- Acceso SSH root o sudo.
- 1 vCPU / 1 GB RAM mínimo para pruebas. Mejor 2 GB RAM.
- Tráfico mensual suficiente. HLS consume ancho de banda.

PASOS
1) Entrar por SSH:
   ssh root@IP_DEL_VPS

2) Instalar Node.js, Nginx y Certbot:
   apt update && apt upgrade -y
   apt install -y curl nginx certbot python3-certbot-nginx
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs

3) Subir la carpeta proxy-server a /opt/argentixtv-proxy
   mkdir -p /opt/argentixtv-proxy
   copiar server.js package.json .env.example
   cd /opt/argentixtv-proxy
   npm install --omit=dev

4) Probar manualmente:
   PORT=3000 node server.js
   abrir: http://IP_DEL_VPS:3000/health

5) Activar servicio systemd:
   cp argentixtv-proxy.service /etc/systemd/system/argentixtv-proxy.service
   systemctl daemon-reload
   systemctl enable --now argentixtv-proxy
   systemctl status argentixtv-proxy

6) Configurar Nginx:
   copiar nginx-argentixtv-proxy.conf a /etc/nginx/sites-available/argentixtv-proxy
   editar server_name proxy.tudominio.com;
   ln -s /etc/nginx/sites-available/argentixtv-proxy /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx

7) Activar HTTPS:
   certbot --nginx -d proxy.tudominio.com

8) En ArgentixTV:
   Admin > Info > Proxy Argentina
   pegar: https://proxy.tudominio.com/proxy?url=
   Guardar proxy > Probar proxy.
