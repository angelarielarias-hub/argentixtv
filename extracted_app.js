
// ════════════════════════════════════════
// CANALES
// ════════════════════════════════════════
// type: 'hls' (default) | 'yt' (YouTube embed)
const BUILTIN = [
  // NACIONALES — verificados Free-TV/IPTV + Lecofu Nov 2025
  {name:"El Trece",         province:"Nacional",            cat:"Nacional", url:"https://live-01-02-eltrece.vodgc.net/eltrecetv/index.m3u8"},
  {name:"El Nueve",         province:"Nacional",            cat:"Nacional", url:"https://octubre-live.cdn.vustreams.com/live/channel09/live.isml/live.m3u8"},
  {name:"TV Pública",       province:"Nacional",            cat:"Nacional", url:"https://live.tvpublica.ar/hls/live.m3u8"},
  {name:"C5N",              province:"Nacional",            cat:"Nacional", url:"https://live.c5n.com/hls/c5n/index.m3u8"},
  {name:"A24",              province:"Nacional",            cat:"Nacional", url:"https://streaming.a24.com/a24live/smil:a24live.smil/playlist.m3u8"},
  {name:"Crónica TV",       province:"Nacional",            cat:"Nacional", url:"https://hls.cdn.tv1.eu/livestream/cronica/index.m3u8"},
  {name:"Canal Encuentro",  province:"Nacional",            cat:"Nacional", url:"https://hls.encuentro.gob.ar/encuentro/index.m3u8"},
  {name:"Pakapaka",         province:"Nacional — Infantil", cat:"Nacional", url:"https://hls.pakapaka.gob.ar/pakapaka/index.m3u8"},
  {name:"Cinear",           province:"Nacional — Cine",     cat:"Cine",     url:"https://live.cinear.com.ar/hls/live.m3u8"},
  {name:"Pluto TV Cine",    province:"Online",              cat:"Cine",     url:"https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5183d3f5e0d2a44ee7001e0f/master.m3u8?deviceId=atv&deviceMake=web&deviceModel=web&deviceType=web&deviceVersion=1&appVersion=1"},
  // BUENOS AIRES
  {name:"Canal de la Ciudad",province:"Buenos Aires",       cat:"Buenos Aires", url:"https://unlimited1-us.dps.live/canaldelaciudad/canaldelaciudad.smil/playlist.m3u8"},
  {name:"Net TV",            province:"Buenos Aires",       cat:"Buenos Aires", url:"https://unlimited2-us.dps.live/nettv/nettv.smil/playlist.m3u8"},
  // SAN JUAN
  {name:"Telesol Canal 5",  province:"San Juan",            cat:"San Juan", url:"https://cnnsanjuan.com:9999/live/telesol/playlist.m3u8"},
  {name:"Canal 8 San Juan", province:"San Juan",            cat:"San Juan", url:"https://unlimited1-us.dps.live/canal8sj/canal8sj.smil/playlist.m3u8"},
  {name:"Canal 13 San Juan",province:"San Juan",            cat:"San Juan", url:"https://www.youtube.com/@CANAL13SANJUANTV/live", type:"yt-splash"},
  {name:"Canal 34 San Juan",province:"San Juan",            cat:"San Juan", url:"https://streamyes.alsolnet.com/canal34hd/live/playlist.m3u8"},
  {name:"Canal BLU",        province:"San Juan",            cat:"San Juan", url:"https://vivo.solumedia.com:19360/canalblu/canalblu.m3u8"},
  // INTERIOR
  {name:"El Doce",           province:"Córdoba",            cat:"Interior", url:"https://unlimited1-us.dps.live/eldoce/eldoce.smil/playlist.m3u8"},
  {name:"Canal 8 Córdoba",   province:"Córdoba",            cat:"Interior", url:"https://streaming.cbacanal8.com.ar/hls/canal8.m3u8"},
  {name:"Aire de Santa Fe",  province:"Santa Fe",           cat:"Interior", url:"https://unlimited1-us.dps.live/airesantafe/airesantafe.smil/playlist.m3u8"},
  {name:"Canal 5 Rosario",   province:"Santa Fe",           cat:"Interior", url:"https://unlimited2-us.dps.live/canal5rosario/canal5rosario.smil/playlist.m3u8"},
  {name:"Canal 9 Litoral",   province:"Entre Ríos",         cat:"Interior", url:"https://unlimited1-us.dps.live/canal9litoral/canal9litoral.smil/playlist.m3u8"},
  {name:"Canal 7 Mendoza",   province:"Mendoza",            cat:"Interior", url:"https://unlimited2-us.dps.live/canal7mendoza/canal7mendoza.smil/playlist.m3u8"},
  {name:"elochoTV",          province:"Tucumán",            cat:"Interior", url:"https://unlimited1-us.dps.live/elocho/elocho.smil/playlist.m3u8"},
  {name:"Canal 7 Jujuy",     province:"Jujuy",              cat:"Interior", url:"https://unlimited2-us.dps.live/canal7jujuy/canal7jujuy.smil/playlist.m3u8"},
  {name:"Canal 11 Salta",    province:"Salta",              cat:"Interior", url:"https://unlimited1-us.dps.live/canal11salta/canal11salta.smil/playlist.m3u8"},
  {name:"Canal 10 Río Negro", province:"Río Negro",         cat:"Interior", url:"https://unlimited1-us.dps.live/canal10rn/canal10rn.smil/playlist.m3u8"},
  {name:"Canal 7 Neuquén",   province:"Neuquén",            cat:"Interior", url:"https://unlimited2-us.dps.live/canal7neuquen/canal7neuquen.smil/playlist.m3u8"},
  {name:"Canal 12 Posadas",  province:"Misiones",           cat:"Interior", url:"https://unlimited1-us.dps.live/canal12posadas/canal12posadas.smil/playlist.m3u8"},
];

// ════════════════════════════════════════
// DB + PROXY
// ════════════════════════════════════════
const DB_KEY = 'atv_db_v5';
const LEGACY_DB_KEY = 'atv_db_v4';
const DEFAULT_ADMIN_PASS = atob('NjIwMmxlaXJB').split('').reverse().join(''); // clave inicial: Ariel2026

function normalizeDB(d){
  const defaults={users:{argentixtv:{pass:DEFAULT_ADMIN_PASS,role:'admin'}},playlists:[]};
  if(!d || typeof d!=='object') d=defaults;
  if(!d.users || typeof d.users!=='object') d.users={};
  if(!d.users.argentixtv) d.users.argentixtv={pass:DEFAULT_ADMIN_PASS,role:'admin'};
  d.users.argentixtv.role='admin';
  if(!Array.isArray(d.playlists)) d.playlists=[];
  return d;
}
function loadDB(){
  try{
    const r=localStorage.getItem(DB_KEY) || localStorage.getItem(LEGACY_DB_KEY);
    const d=normalizeDB(r?JSON.parse(r):null);
    localStorage.setItem(DB_KEY,JSON.stringify(d));
    return d;
  }catch(e){
    localStorage.removeItem(DB_KEY);
    return normalizeDB(null);
  }
}
function saveDB(){localStorage.setItem(DB_KEY,JSON.stringify(DB));}
function esc(v){
  return String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function isSafeMediaUrl(v){
  const s=String(v||'').trim();
  if(!s)return false;
  return /^(https?:\/\/|rtmp:\/\/|\/)/i.test(s);
}
let DB = loadDB();

const SETTINGS_KEY = 'atv_settings_v1';
const ON_NETLIFY = !['localhost','127.0.0.1'].includes(location.hostname) && !location.hostname.match(/^192\.|^10\.|^172\./);
const NETLIFY_PROXY = '/.netlify/functions/proxy?url=';

function normalizeProxyBase(v){
  let s=String(v||'').trim();
  if(!s) return '';
  if(!/^https?:\/\//i.test(s) && !s.startsWith('/')) s='https://'+s;
  if(s.includes('?url=')) return s;
  if(s.endsWith('/proxy')) return s+'?url=';
  if(s.endsWith('/proxy/')) return s.slice(0,-1)+'?url=';
  return s.replace(/\/+$/,'') + '/proxy?url=';
}
function loadSettings(){
  try{
    const r=localStorage.getItem(SETTINGS_KEY);
    const d=r?JSON.parse(r):{};
    return {proxyBase:normalizeProxyBase(d.proxyBase||'')};
  }catch(e){return {proxyBase:''};}
}
function saveSettings(s){localStorage.setItem(SETTINGS_KEY,JSON.stringify({proxyBase:normalizeProxyBase(s.proxyBase||'')}));}
let SETTINGS=loadSettings();
function customProxyBase(){return normalizeProxyBase(SETTINGS.proxyBase||'');}
function activeProxyBase(){return customProxyBase() || (ON_NETLIFY ? NETLIFY_PROXY : '');}
function px(url){const b=activeProxyBase();return b ? b + encodeURIComponent(url) : url;}
function proxyCandidates(url){
  const out=[];
  const custom=customProxyBase();
  if(custom) out.push(custom + encodeURIComponent(url));
  if(ON_NETLIFY) out.push(NETLIFY_PROXY + encodeURIComponent(url));
  out.push(url);
  return [...new Set(out)];
}
function proxyLabel(){return customProxyBase() ? 'Proxy Argentina externo' : (ON_NETLIFY ? 'Proxy Netlify' : 'Local sin proxy');}

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════
let currentUser=null, allCh=[...BUILTIN], filtered=[...allCh];
let currentIdx=-1, hls=null, osdTimer=null;

// ════════════════════════════════════════
// CLOCK
// ════════════════════════════════════════
setInterval(()=>{
  const n=new Date();
  document.getElementById('clock').textContent=n.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
},1000);

// ════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════
function togglePw(){
  const inp=document.getElementById('lp');
  const btn=document.getElementById('pw-eye');
  if(inp.type==='password'){inp.type='text';btn.textContent='OCULTAR';}
  else{inp.type='password';btn.textContent='VER';}
  inp.focus();
}
function doLogin(){
  const u=document.getElementById('lu').value.trim().toLowerCase();
  const p=document.getElementById('lp').value;
  const err=document.getElementById('l-err');
  err.textContent='';
  document.getElementById('lp').style.borderColor='';
  if(!u||!p){err.textContent='Ingresá usuario y contraseña';return;}
  DB=loadDB();
  const usr=DB.users[u];
  if(!usr){err.textContent='Usuario no encontrado';return;}
  if(usr.pass!==p){
    err.textContent='Contraseña incorrecta';
    document.getElementById('lp').style.borderColor='var(--danger)';
    return;
  }
  currentUser={name:u,role:usr.role||'user'};
  document.getElementById('screen-login').classList.add('hidden');
  document.getElementById('screen-app').classList.remove('hidden');
  initApp();
}
document.getElementById('btnlogin').addEventListener('click',doLogin);
['lu','lp'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();}));
document.getElementById('lu').addEventListener('input',()=>{document.getElementById('l-err').textContent='';});
document.getElementById('lp').addEventListener('input',()=>{document.getElementById('lp').style.borderColor='';document.getElementById('l-err').textContent='';});

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════
function initApp(){
  const badge=document.getElementById('ubadge');
  badge.textContent=currentUser.role==='admin'?`★ ${currentUser.name}`:currentUser.name;
  document.getElementById('btnadmin').style.display = currentUser.role==='admin' ? 'block' : 'none';

  const ps=document.getElementById('pxstat');
  if(customProxyBase()){ps.textContent='✓ Proxy AR';ps.className='off';ps.classList.add('ok');}
  else if(ON_NETLIFY){ps.textContent='✓ Proxy Netlify';ps.className='off';ps.classList.add('ok');}
  else{ps.textContent='⚠ Local (sin proxy)';ps.className='off';}

  // Load saved playlists
  DB.playlists.forEach(pl=>{
    // Re-parse stored channels
    if(pl.channels) pl.channels.forEach(c=>{c.cat=pl.name;allCh.push(c);});
  });

  buildCats();
  renderCh();
}

// ════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════
function buildCats(){
  const cats=['Todos',...new Set(allCh.map(c=>c.cat))];
  const w=document.getElementById('catwrap');
  w.innerHTML='';
  cats.forEach(cat=>{
    const b=document.createElement('button');
    b.className='cat'+(cat==='Todos'?' active':'');
    b.textContent=cat;
    b.addEventListener('click',()=>{
      document.querySelectorAll('.cat').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      applyFilter();
    });
    w.appendChild(b);
  });
}

// ════════════════════════════════════════
// FILTER + RENDER
// ════════════════════════════════════════
function applyFilter(){
  const q=document.getElementById('search').value.toLowerCase();
  const ac=document.querySelector('.cat.active')?.textContent||'Todos';
  filtered=allCh.filter(c=>{
    const mc=ac==='Todos'||c.cat===ac;
    const mq=!q||c.name.toLowerCase().includes(q)||(c.province||'').toLowerCase().includes(q);
    return mc&&mq;
  });
  renderCh();
}
document.getElementById('search').addEventListener('input',applyFilter);

function renderCh(){
  const list=document.getElementById('chlist');
  document.getElementById('chcount').textContent=`${filtered.length} canales`;
  list.innerHTML='';
  if(!filtered.length){list.innerHTML='<div style="padding:20px;text-align:center;font-size:12px;color:#404060;">Sin resultados</div>';return;}
  filtered.forEach(ch=>{
    const gi=allCh.indexOf(ch);
    const abbr=(ch.name||'TV').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
    const isYT=ch.type==='yt'||ch.type==='yt-splash'||ch.type==='ext';
    const safeLogo=isSafeMediaUrl(ch.logo)?ch.logo:'';
    const d=document.createElement('div');
    d.className='ch'+(gi===currentIdx?' active':'');
    d.tabIndex=0;
    d.innerHTML=`
      <div class="chlogo">${safeLogo?`<img src="${esc(safeLogo)}" alt="" onerror="this.parentNode.textContent='${esc(abbr)}'">`:`${esc(abbr)}`}</div>
      <div class="chinf"><div class="chn">${esc(ch.name)}</div><div class="chp">${esc(ch.province||'')}</div></div>
      ${isYT?'<span class="yt-badge">YT</span>':''}
      <div class="chdot ${gi===currentIdx?'live':''}"></div>
    `;
    d.addEventListener('click',()=>playChannel(gi));
    d.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();playChannel(gi);}
      if(e.key==='ArrowDown'){e.preventDefault();d.nextElementSibling?.focus();}
      if(e.key==='ArrowUp'){e.preventDefault();d.previousElementSibling?.focus();}
    });
    list.appendChild(d);
  });
}

// ════════════════════════════════════════
// PLAYER
// ════════════════════════════════════════
const video=document.getElementById('video');
const ytWrap=document.getElementById('yt-iframe-wrap');
const ytIframe=document.getElementById('yt-iframe');

let ytSplashUrl='';
function openYTSplash(){if(ytSplashUrl)window.location.href=ytSplashUrl;}
function showYTSplash(ch){
  document.getElementById('idle').style.display='none';
  document.getElementById('maintenance-screen').style.display='none';
  const s=document.getElementById('yt-splash');
  s.style.display='flex';
  document.getElementById('yts-name').textContent=ch.name;
  document.getElementById('yts-prov').textContent=ch.province||'';
  ytSplashUrl=ch.url;
  document.getElementById('now-info').innerHTML='<strong>'+esc(ch.name)+'</strong> — '+esc(ch.province||'')+' — <span style="color:#ff4444;font-size:11px">Solo YouTube</span>';
  setLoad(false);renderCh();
}
function showMaintenance(ch){
  document.getElementById('idle').style.display='none';
  document.getElementById('yt-splash').style.display='none';
  const m=document.getElementById('maintenance-screen');
  m.style.display='flex';
  document.getElementById('maint-name').textContent=ch.name;
  document.getElementById('now-info').innerHTML='<strong>'+esc(ch.name)+'</strong> — <span style="color:#ef9f27">En mantenimiento</span>';
  setLoad(false);renderCh();
}
function retryChannel(){
  document.getElementById('maintenance-screen').style.display='none';
  if(currentIdx>=0){const tmp=currentIdx;currentIdx=-1;playChannel(tmp);}
}
function playChannel(idx){
  const ch=allCh[idx];
  if(!ch)return;
  currentIdx=idx;
  document.getElementById('idle').style.display='none';
  document.getElementById('yt-splash').style.display='none';
  document.getElementById('maintenance-screen').style.display='none';
  setLoad(true,ch.name);
  hideErr();
  if(hls){hls.destroy();hls=null;}
  video.src='';
  ytWrap.style.display='none';
  video.style.display='block';
  if(ch.type==='yt-splash'||ch.type==='ext'){
    showYTSplash(ch);
    return;
  }
  if(ch.type==='yt'){
    setLoad(false);
    ytIframe.src=ch.url;
    ytWrap.style.display='block';
    video.style.display='none';
    updateUI(ch);showOSD(ch);
    return;
  }
  const streamUrl=px(ch.url);
  if(Hls.isSupported()){
    hls=new Hls({maxBufferLength:20,maxMaxBufferLength:40,manifestLoadingTimeOut:15000,levelLoadingTimeOut:15000,fragLoadingTimeOut:20000});
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,()=>{video.play().catch(()=>{});setLoad(false);showOSD(ch);updateUI(ch);});
    hls.on(Hls.Events.ERROR,(_,data)=>{
      if(data.fatal){setLoad(false);showMaintenance(ch);}
    });
  } else if(video.canPlayType('application/vnd.apple.mpegurl')){
    video.src=streamUrl;
    video.addEventListener('loadedmetadata',()=>{video.play().catch(()=>{});setLoad(false);showOSD(ch);updateUI(ch);},{once:true});
    video.addEventListener('error',()=>{setLoad(false);showMaintenance(ch);},{once:true});
  } else {
    setLoad(false);showMaintenance(ch);
  }
}

function updateUI(ch){
  document.getElementById('now-info').innerHTML=`<strong>${esc(ch.name)}</strong> — ${esc(ch.province||'')}`;
  document.getElementById('cplay').textContent='⏸';
  renderCh();
}
function setLoad(s,n=''){
  document.getElementById('loadov').classList.toggle('show',s);
  if(n)document.getElementById('loadtxt').textContent=n;
}
function showErr(msg){
  const t=document.getElementById('errtst');
  t.textContent='⚠ '+msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),5000);
}
function hideErr(){document.getElementById('errtst').classList.remove('show');}
function showOSD(ch){
  document.getElementById('osd-name').textContent=ch.name;
  document.getElementById('osd-prov').textContent=ch.province||'';
  const osd=document.getElementById('osd');osd.classList.add('show');
  clearTimeout(osdTimer);osdTimer=setTimeout(()=>osd.classList.remove('show'),4000);
}

document.getElementById('vwrap').addEventListener('click',()=>{
  if(currentIdx===-1)return;
  const osd=document.getElementById('osd');osd.classList.toggle('show');
  clearTimeout(osdTimer);
  if(osd.classList.contains('show'))osdTimer=setTimeout(()=>osd.classList.remove('show'),4000);
});

// ════════════════════════════════════════
// CONTROLS
// ════════════════════════════════════════
document.getElementById('cplay').addEventListener('click',()=>{
  if(currentIdx===-1)return;
  if(['yt','yt-splash','ext'].includes(allCh[currentIdx].type))return;
  if(video.paused){video.play();document.getElementById('cplay').textContent='⏸';}
  else{video.pause();document.getElementById('cplay').textContent='▶';}
});
document.getElementById('cprev').addEventListener('click',()=>{if(currentIdx>0)playChannel(currentIdx-1);});
document.getElementById('cnext').addEventListener('click',()=>{if(currentIdx<allCh.length-1)playChannel(currentIdx+1);});
document.getElementById('cmute').addEventListener('click',()=>{
  video.muted=!video.muted;
  document.getElementById('cmute').textContent=video.muted?'🔊':'🔇';
});
document.getElementById('cfs').addEventListener('click',toggleFS);
document.getElementById('vol').addEventListener('input',e=>video.volume=e.target.value);
document.getElementById('btnlogout').addEventListener('click',()=>location.reload());

// ════════════════════════════════════════
// FULLSCREEN
// ════════════════════════════════════════
function toggleFS(){
  const app=document.getElementById('screen-app');
  app.classList.toggle('fs');
  const btn=document.getElementById('cfs');
  if(app.classList.contains('fs')){document.documentElement.requestFullscreen?.();btn.textContent='⛶ Salir';}
  else{document.exitFullscreen?.();btn.textContent='⛶ Full';}
}

// ════════════════════════════════════════
// KEYBOARD
// ════════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
  switch(e.key){
    case 'f':case 'F':toggleFS();break;
    case 'm':case 'M':video.muted=!video.muted;document.getElementById('cmute').textContent=video.muted?'🔊':'🔇';break;
    case 'ArrowRight':case 'MediaTrackNext':e.preventDefault();if(currentIdx<allCh.length-1)playChannel(currentIdx+1);break;
    case 'ArrowLeft':case 'MediaTrackPrevious':e.preventDefault();if(currentIdx>0)playChannel(currentIdx-1);break;
    case ' ':if(document.activeElement===document.body&&currentIdx!==-1){e.preventDefault();video.paused?video.play():video.pause();}break;
    case 'Escape':if(document.getElementById('screen-app').classList.contains('fs'))toggleFS();break;
  }
});

// ════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════
document.getElementById('btnadmin').addEventListener('click',openAdmin);
document.getElementById('modalx').addEventListener('click',closeAdmin);
document.getElementById('modalbg').addEventListener('click',e=>{if(e.target===document.getElementById('modalbg'))closeAdmin();});
function openAdmin(){
  document.getElementById('modalbg').classList.remove('hidden');
  renderUsers();renderPL();
  document.getElementById('infoproxy').textContent=proxyLabel();
  document.getElementById('infoch').textContent=BUILTIN.length;
  const pbi=document.getElementById('proxybase');
  if(pbi) pbi.value=customProxyBase();
  displayVersion();
}
function closeAdmin(){document.getElementById('modalbg').classList.add('hidden');}

document.querySelectorAll('.mtab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.mtab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.mpanel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  });
});

// users
function renderUsers(){
  const list=document.getElementById('userlist');list.innerHTML='';
  const cols=['#00e5ff','#ff3cac','#ffd600','#00e676','#ff6b35'];
  Object.entries(DB.users).forEach(([name,data],i)=>{
    const d=document.createElement('div');d.className='uitem';
    const col=cols[i%cols.length];
    d.innerHTML=`
      <div class="uav" style="background:${col}22;color:${col}">${name[0].toUpperCase()}</div>
      <div class="uinf"><div class="uname">${esc(name)}</div><div class="urole">${data.role==='admin'?'★ Admin':'Usuario'}</div></div>
      ${data.role!=='admin'?`<button class="abtn danger" style="padding:5px 10px;font-size:11px" onclick="delUser('${name}')">Eliminar</button>`:''}
    `;
    list.appendChild(d);
  });
}
document.getElementById('btnadduser').addEventListener('click',()=>{
  const u=document.getElementById('nu').value.trim().toLowerCase();
  const p=document.getElementById('np').value.trim();
  if(!u||!p)return;
  if(!/^[a-z0-9._-]{3,20}$/.test(u)){alert('Usá un usuario de 3 a 20 caracteres: letras, números, punto, guion o guion bajo.');return;}
  if(DB.users[u]){alert('Ese usuario ya existe');return;}
  DB.users[u]={pass:p,role:'user'};saveDB();
  document.getElementById('nu').value='';document.getElementById('np').value='';
  renderUsers();
});
window.delUser=function(name){if(!confirm(`¿Eliminar "${name}"?`))return;delete DB.users[name];saveDB();renderUsers();};

// playlists
function renderPL(){
  const list=document.getElementById('pllist');list.innerHTML='';
  if(!DB.playlists.length){list.innerHTML='<div style="font-size:12px;color:#404060;padding:8px 0;">Sin playlists externas. Los canales gratuitos siempre están activos.</div>';return;}
  DB.playlists.forEach((pl,i)=>{
    const d=document.createElement('div');d.className='plitem';
    d.innerHTML=`<div style="flex:1"><div class="plname">${esc(pl.name)}</div><div class="plurl">${esc(pl.url)}</div></div>
      <button class="abtn danger" style="padding:5px 10px;font-size:11px;flex-shrink:0" onclick="delPL(${i})">✕</button>`;
    list.appendChild(d);
  });
}
document.getElementById('btnaddpl').addEventListener('click',async()=>{
  const name=document.getElementById('pln').value.trim();
  const url=document.getElementById('plu').value.trim();
  const st=document.getElementById('plst');
  try{
    await addPlaylistFromUrl(name,url);
    document.getElementById('pln').value='';document.getElementById('plu').value='';
  }catch(e){st.textContent='✕ Error: '+e.message;st.style.color='var(--danger)';}
});

document.getElementById('btnaddxtream').addEventListener('click',async()=>{
  const st=document.getElementById('plst');
  const srv=document.getElementById('xsrv').value.trim().replace(/\/+$/,'');
  const user=document.getElementById('xuser').value.trim();
  const pass=document.getElementById('xpass').value.trim();
  const name=(document.getElementById('xname').value.trim()||'IPTV Xtream');
  const output=(document.getElementById('xout').value.trim()||'m3u8').replace(/[^a-z0-9]/gi,'');
  try{
    if(!/^https?:\/\//i.test(srv)) throw new Error('Servidor debe empezar con http:// o https://');
    if(!user||!pass) throw new Error('Completá usuario y contraseña Xtream');
    const url=`${srv}/get.php?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}&type=m3u_plus&output=${encodeURIComponent(output)}`;
    await addPlaylistFromUrl(name,url);
    ['xsrv','xuser','xpass','xname'].forEach(id=>document.getElementById(id).value='');
  }catch(e){st.textContent='✕ Error: '+e.message;st.style.color='var(--danger)';}
});
window.delPL=function(i){
  if(!confirm('¿Eliminar esta playlist?'))return;
  const pl=DB.playlists[i];
  DB.playlists.splice(i,1);saveDB();
  allCh=allCh.filter(c=>c.cat!==pl.name);
  buildCats();applyFilter();renderPL();
};
async function fetchM3U(url){
  const sourceUrl=String(url||'').trim();
  if(!/^https?:\/\//i.test(sourceUrl)) throw new Error('La URL M3U debe empezar con http:// o https://');

  let text='';
  for(const fetchUrl of proxyCandidates(sourceUrl)){
    try{
      const res=await fetch(fetchUrl,{cache:'no-store'});
      if(!res.ok) continue;
      const t=await res.text();
      if(!t) continue;
      if(t.includes('#EXTINF')){text=t;break;}
      if(t.includes('/proxy?url=') || t.includes('.netlify/functions/proxy?url=')){
        const fixed=t.split(/\r?\n/).map(line=>{
          const m=line.match(/(?:\/proxy|\.netlify\/functions\/proxy)\?url=(.+)$/);
          return m?decodeURIComponent(m[1]):line;
        }).join('\n');
        if(fixed.includes('#EXTINF')){text=fixed;break;}
      }
    }catch(e){continue;}
  }

  if(!text || text.length<20) throw new Error('No se pudo obtener la lista. Revisá URL, credenciales, CORS o proxy.');
  if(!text.includes('#EXTM3U') && !text.includes('#EXTINF')) throw new Error('Formato M3U no reconocido');

  const lines=text.split(/\r?\n/);
  const channels=[];
  let cur=null;

  for(const raw of lines){
    const line=raw.trim();
    if(!line) continue;

    if(line.startsWith('#EXTINF')){
      const tvgName=line.match(/tvg-name="([^"]*)"/i);
      const commaName=line.match(/,(.+)$/);
      const lg=line.match(/tvg-logo="([^"]*)"/i);
      const grp=line.match(/group-title="([^"]*)"/i);
      const country=line.match(/tvg-country="([^"]*)"/i);
      const name=(tvgName?.[1]||commaName?.[1]||'Canal').trim().slice(0,120);
      cur={
        name:name||'Canal',
        logo:(lg?.[1]||'').trim(),
        province:(grp?.[1]||country?.[1]||'IPTV').trim().slice(0,80),
        cat:'IPTV'
      };
      continue;
    }

    if(cur && /^(https?:\/\/|rtmp:\/\/|\/)/i.test(line)){
      channels.push({...cur,url:line});
      cur=null;
    }
  }

  if(!channels.length) throw new Error('Sin canales en la lista ('+lines.length+' líneas procesadas)');
  return channels;
}
async function addPlaylistFromUrl(name,url){
  const st=document.getElementById('plst');
  st.textContent='Cargando…';st.style.color='var(--accent)';
  const cleanName=String(name||'IPTV').trim().slice(0,60);
  const cleanUrl=String(url||'').trim();
  if(!cleanName||!cleanUrl) throw new Error('Completá nombre y URL');
  const channels=await fetchM3U(cleanUrl);
  if(!channels.length) throw new Error('Sin canales');
  const entry={name:cleanName,url:cleanUrl,channels};
  DB.playlists.push(entry);saveDB();
  channels.forEach(c=>{c.cat=cleanName;allCh.push(c);});
  buildCats();applyFilter();renderPL();
  st.textContent=`✓ ${channels.length} canales de "${cleanName}" agregados`;st.style.color='var(--success)';
}


// proxy settings
function refreshProxyBadge(){
  const ps=document.getElementById('pxstat');
  if(!ps) return;
  if(customProxyBase()){ps.textContent='✓ Proxy AR';ps.className='off';ps.classList.add('ok');}
  else if(ON_NETLIFY){ps.textContent='✓ Proxy Netlify';ps.className='off';ps.classList.add('ok');}
  else{ps.textContent='⚠ Local (sin proxy)';ps.className='off';}
  const ip=document.getElementById('infoproxy');
  if(ip) ip.textContent=proxyLabel();
}
async function testActiveProxy(){
  const st=document.getElementById('proxyst');
  const base=customProxyBase();
  if(!base){st.textContent='No hay proxy externo configurado. Se usará Netlify como fallback.';st.style.color='var(--muted)';return;}
  st.textContent='Probando proxy…';st.style.color='var(--accent)';
  try{
    const res=await fetch(base+encodeURIComponent('https://example.com/'),{cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const txt=await res.text();
    if(!/example domain/i.test(txt)) throw new Error('Respuesta inesperada');
    st.textContent='✓ Proxy externo operativo';st.style.color='var(--success)';
  }catch(e){st.textContent='✕ No respondió bien: '+e.message;st.style.color='var(--danger)';}
}
document.getElementById('btnsaveproxy').addEventListener('click',()=>{
  const st=document.getElementById('proxyst');
  const val=normalizeProxyBase(document.getElementById('proxybase').value);
  SETTINGS.proxyBase=val;saveSettings(SETTINGS);
  document.getElementById('proxybase').value=val;
  refreshProxyBadge();
  st.textContent=val?'✓ Proxy guardado. Los canales nuevos y la reproducción usarán esta salida.':'Proxy externo vacío. Se usará Netlify/local.';
  st.style.color=val?'var(--success)':'var(--muted)';
});
document.getElementById('btntestproxy').addEventListener('click',testActiveProxy);
document.getElementById('btnresetproxy').addEventListener('click',()=>{
  SETTINGS.proxyBase='';saveSettings(SETTINGS);
  document.getElementById('proxybase').value='';
  refreshProxyBadge();
  const st=document.getElementById('proxyst');st.textContent='Restablecido: proxy Netlify/local.';st.style.color='var(--muted)';
});

// change pass
document.getElementById('btnchpass').addEventListener('click',()=>{
  const np=document.getElementById('newpass').value.trim();
  const st=document.getElementById('passst');
  if(!np)return;
  DB.users[currentUser.name].pass=np;saveDB();
  document.getElementById('newpass').value='';
  st.textContent='✓ Contraseña actualizada';st.style.color='var(--success)';
  setTimeout(()=>st.textContent='',3000);
});

// ════════════════════════════════════════
// PWA
// ════════════════════════════════════════
// ── VERSION TRACKING ──
const APP_VERSION = '2.3.0';
const APP_BUILD = '2026-05-23';

function getVersion(){
  return localStorage.getItem('atv_version') || APP_VERSION;
}
function bumpVersion(note){
  const parts = APP_VERSION.split('.');
  // Version is hardcoded per build — display current
  localStorage.setItem('atv_version', APP_VERSION);
  localStorage.setItem('atv_build', APP_BUILD);
}
function displayVersion(){
  const vn = document.getElementById('ver-num');
  const vd = document.getElementById('ver-date');
  const iv = document.getElementById('infover');
  const av = document.getElementById('admin-ver-display');
  if(vn) vn.textContent = APP_VERSION;
  if(vd) vd.textContent = APP_BUILD;
  if(iv) iv.textContent = APP_VERSION;
  if(av) av.textContent = 'ArgentixTV v' + APP_VERSION + ' · ' + APP_BUILD;
}
// Run on load
window.addEventListener('load', ()=>{
  localStorage.setItem('atv_version', APP_VERSION);
  localStorage.setItem('atv_build', APP_BUILD);
  displayVersion();
});

if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(regs=>{
    regs.forEach(r=>r.unregister());
  });
}
