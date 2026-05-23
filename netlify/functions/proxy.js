const PRIVATE_HOST_RE = /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)$/i;

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range, User-Agent, Accept, Origin, Referer',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
    ...extra,
  };
}

function proxify(rawUrl, baseUrl, origin) {
  if (!rawUrl || /^data:/i.test(rawUrl)) return rawUrl;
  try {
    const absolute = new URL(rawUrl, baseUrl).href;
    return `${origin}/.netlify/functions/proxy?url=${encodeURIComponent(absolute)}`;
  } catch (_) {
    return rawUrl;
  }
}

function rewriteManifest(text, targetUrl, origin) {
  return text.split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Rewrite HLS attribute URIs: EXT-X-KEY, EXT-X-MAP, etc.
    if (trimmed.startsWith('#')) {
      return line.replace(/URI="([^"]+)"/gi, (_, uri) => `URI="${proxify(uri, targetUrl, origin)}"`);
    }

    // Rewrite media segments, variant manifests, relative paths, absolute URLs.
    return proxify(trimmed, targetUrl, origin);
  }).join('\n');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  const target = event.queryStringParameters && event.queryStringParameters.url;
  if (!target) {
    return { statusCode: 400, headers: corsHeaders(), body: 'Missing url' };
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch (_) {
    return { statusCode: 400, headers: corsHeaders(), body: 'Invalid URL' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || PRIVATE_HOST_RE.test(parsed.hostname)) {
    return { statusCode: 403, headers: corsHeaders(), body: 'URL not allowed' };
  }

  const origin = event.headers['x-forwarded-proto'] && event.headers.host
    ? `${event.headers['x-forwarded-proto']}://${event.headers.host}`
    : '';

  const upstreamHeaders = {
    'User-Agent': event.headers['user-agent'] || 'Mozilla/5.0 (SmartTV; ArgentixTV) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    'Accept': event.headers.accept || '*/*',
    'Referer': `${parsed.origin}/`,
  };
  if (event.headers.range) upstreamHeaders.Range = event.headers.range;

  try {
    const upstream = await fetch(parsed.href, {
      method: event.httpMethod === 'HEAD' ? 'HEAD' : 'GET',
      headers: upstreamHeaders,
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') || '';
    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    const acceptRanges = upstream.headers.get('accept-ranges');
    const looksManifest = /mpegurl|x-mpegurl|application\/vnd\.apple\.mpegurl|audio\/mpegurl|text\/plain/i.test(contentType)
      || /\.m3u8?(\?|$)/i.test(parsed.pathname)
      || /\.m3u8?(\?|$)/i.test(parsed.href);

    if (!upstream.ok && upstream.status !== 206) {
      const msg = await upstream.text().catch(() => 'Upstream error');
      return {
        statusCode: upstream.status,
        headers: corsHeaders({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }),
        body: msg.slice(0, 500),
      };
    }

    if (event.httpMethod === 'HEAD') {
      return {
        statusCode: upstream.status,
        headers: corsHeaders({
          'Content-Type': contentType || 'application/octet-stream',
          ...(contentLength ? { 'Content-Length': contentLength } : {}),
          ...(contentRange ? { 'Content-Range': contentRange } : {}),
          ...(acceptRanges ? { 'Accept-Ranges': acceptRanges } : {}),
          'Cache-Control': looksManifest ? 'no-store' : 'public, max-age=30',
        }),
        body: '',
      };
    }

    if (looksManifest) {
      const text = await upstream.text();
      const body = rewriteManifest(text, parsed.href, origin || '');
      return {
        statusCode: 200,
        headers: corsHeaders({
          'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }),
        body,
      };
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return {
      statusCode: upstream.status,
      headers: corsHeaders({
        'Content-Type': contentType || 'application/octet-stream',
        ...(contentLength ? { 'Content-Length': contentLength } : {}),
        ...(contentRange ? { 'Content-Range': contentRange } : {}),
        ...(acceptRanges ? { 'Accept-Ranges': acceptRanges } : {}),
        'Cache-Control': 'public, max-age=30',
      }),
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }),
      body: JSON.stringify({ error: 'Proxy fetch failed', detail: err.message }),
    };
  }
};
