export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const target = url.searchParams.get('url');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
      }
    });
  }

  if (!target) return new Response('Missing url', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });

  let parsed;
  try { parsed = new URL(target); } catch {
    return new Response('Invalid URL', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new Response('URL not allowed', { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const upstream = await fetch(target, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120',
      'Accept': '*/*',
      'Referer': parsed.origin + '/',
    }
  });

  const contentType = upstream.headers.get('content-type') || '';
  const text = await upstream.text();

  // Channel playlist: return raw
  const hasExtinf = text.includes('#EXTINF');
  const hasSegments = text.includes('.ts') || text.includes('#EXT-X-TARGETDURATION');
  if (hasExtinf && !hasSegments) {
    return new Response(text, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    });
  }

  // Stream manifest: rewrite segments
  if (contentType.includes('mpegurl') || target.includes('.m3u8') || hasExtinf) {
    const base = target.substring(0, target.lastIndexOf('/') + 1);
    const proxyBase = url.origin + '/functions/proxy?url=';
    const rewritten = text.split('\n').map(line => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return line;
      const abs = t.startsWith('http') ? t : base + t;
      return proxyBase + encodeURIComponent(abs);
    }).join('\n');
    return new Response(rewritten, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache',
      }
    });
  }

  // Binary segments
  const buf = await (await fetch(target)).arrayBuffer();
  return new Response(buf, {
    status: upstream.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': contentType || 'video/MP2T',
      'Cache-Control': 'public, max-age=30',
    }
  });
}
