const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
app.set('trust proxy', true);
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

const PORT = process.env.PORT || 3000;
const PRIVATE_HOST_RE = /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)$/i;

function cors(res) {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range, User-Agent, Accept, Origin, Referer',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
  });
}
function proxyBase(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('host');
  return `${proto}://${host}/proxy?url=`;
}
function proxify(rawUrl, baseUrl, req) {
  if (!rawUrl || /^data:/i.test(rawUrl)) return rawUrl;
  try {
    const absolute = new URL(rawUrl, baseUrl).href;
    return proxyBase(req) + encodeURIComponent(absolute);
  } catch (_) {
    return rawUrl;
  }
}
function rewriteManifest(text, targetUrl, req) {
  return text.split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;
    if (trimmed.startsWith('#')) {
      return line.replace(/URI="([^"]+)"/gi, (_, uri) => `URI="${proxify(uri, targetUrl, req)}"`);
    }
    return proxify(trimmed, targetUrl, req);
  }).join('\n');
}
function validateTarget(target) {
  if (!target) throw new Error('Missing url');
  const parsed = new URL(target);
  if (!['http:', 'https:'].includes(parsed.protocol) || PRIVATE_HOST_RE.test(parsed.hostname)) {
    const err = new Error('URL not allowed');
    err.status = 403;
    throw err;
  }
  return parsed;
}

app.options('/proxy', (req, res) => { cors(res); res.status(204).end(); });
app.get('/health', (req, res) => {
  cors(res);
  res.json({ ok: true, service: 'ArgentixTV Proxy Argentina', version: '2.3.0', ipMode: 'Use este servicio en un VPS con IP argentina' });
});

app.all('/proxy', async (req, res) => {
  cors(res);
  let parsed;
  try { parsed = validateTarget(req.query.url); }
  catch (err) { return res.status(err.status || 400).type('text/plain').send(err.message); }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.UPSTREAM_TIMEOUT_MS || 25000));
  const upstreamHeaders = {
    'User-Agent': req.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36 ArgentixTV/2.3',
    'Accept': req.get('accept') || '*/*',
    'Referer': `${parsed.origin}/`,
    'Origin': parsed.origin,
  };
  if (req.get('range')) upstreamHeaders.Range = req.get('range');

  try {
    const upstream = await fetch(parsed.href, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: upstreamHeaders,
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = upstream.headers.get('content-type') || '';
    const looksManifest = /mpegurl|x-mpegurl|application\/vnd\.apple\.mpegurl|audio\/mpegurl|text\/plain/i.test(contentType)
      || /\.m3u8?(\?|$)/i.test(parsed.pathname)
      || /\.m3u8?(\?|$)/i.test(parsed.href);

    res.status(upstream.status);
    res.set('Content-Type', looksManifest ? 'application/vnd.apple.mpegurl; charset=utf-8' : (contentType || 'application/octet-stream'));
    res.set('Cache-Control', looksManifest ? 'no-cache, no-store, must-revalidate' : 'public, max-age=30');
    ['content-length','content-range','accept-ranges'].forEach(h => {
      const v = upstream.headers.get(h);
      if (v && !looksManifest) res.set(h, v);
    });

    if (!upstream.ok && upstream.status !== 206) {
      const msg = await upstream.text().catch(() => 'Upstream error');
      return res.type('text/plain').send(msg.slice(0, 800));
    }
    if (req.method === 'HEAD') return res.end();
    if (looksManifest) {
      const text = await upstream.text();
      return res.send(rewriteManifest(text, parsed.href, req));
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.end(buf);
  } catch (err) {
    clearTimeout(timeout);
    return res.status(502).json({ error: 'Proxy fetch failed', detail: err.message });
  }
});

app.listen(PORT, () => console.log(`ArgentixTV Proxy Argentina listening on :${PORT}`));
