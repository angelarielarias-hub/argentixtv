const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range, Accept, Origin, Referer, User-Agent',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (
      url.pathname === '/functions/proxy' ||
      url.pathname === '/functions/proxy/' ||
      url.pathname === '/.netlify/functions/proxy' ||
      url.pathname === '/.netlify/functions/proxy/' ||
      url.pathname === '/proxy' ||
      url.pathname === '/proxy/'
    ) {
      return handleProxy(request);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('ArgentixTV Worker activo. Assets no configurados.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS },
    });
  },
};

async function handleProxy(request) {
  const reqUrl = new URL(request.url);
  const target = reqUrl.searchParams.get('url');

  if (!target) {
    return textResponse('Missing url', 400);
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch {
    return textResponse('Invalid URL', 400);
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return textResponse('URL not allowed', 403);
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: buildUpstreamHeaders(request, targetUrl),
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') || '';
    const isM3U8 = contentType.includes('mpegurl') ||
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('application/x-mpegURL') ||
      targetUrl.pathname.toLowerCase().includes('.m3u8');

    if (isM3U8) {
      const text = await upstream.text();
      const rewritten = rewriteM3U8(text, targetUrl.toString(), reqUrl.origin);
      return new Response(rewritten, {
        status: upstream.status,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    const responseHeaders = new Headers(CORS_HEADERS);
    responseHeaders.set('Content-Type', contentType || 'application/octet-stream');
    responseHeaders.set('Cache-Control', 'public, max-age=30');

    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    const acceptRanges = upstream.headers.get('accept-ranges');

    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    if (contentRange) responseHeaders.set('Content-Range', contentRange);
    if (acceptRanges) responseHeaders.set('Accept-Ranges', acceptRanges);

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return textResponse(`Proxy error: ${err?.message || err}`, 502);
  }
}

function buildUpstreamHeaders(request, targetUrl) {
  const referer = getRefererForTarget(targetUrl);
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    'Accept': '*/*',
    'Referer': referer,
    'Origin': new URL(referer).origin,
  };

  const range = request.headers.get('Range');
  if (range) headers.Range = range;

  return headers;
}

function getRefererForTarget(targetUrl) {
  const host = targetUrl.hostname.toLowerCase();
  const path = targetUrl.pathname.toLowerCase();

  if (host.includes('tvlin.net') && path.includes('/telesol/')) {
    return 'https://www.telesoldiario.com/';
  }

  if (host.includes('telesoldiario.com')) {
    return 'https://www.telesoldiario.com/';
  }

  return `${targetUrl.origin}/`;
}

function rewriteM3U8(text, sourceUrl, origin) {
  const proxyBase = `${origin}/functions/proxy?url=`;
  const baseUrl = new URL(sourceUrl);

  return text.split('\n').map((line) => {
    const trimmed = line.trim();

    if (!trimmed) return line;

    if (trimmed.startsWith('#')) {
      return rewriteUriAttributes(line, baseUrl, proxyBase);
    }

    return proxyBase + encodeURIComponent(resolveUrl(trimmed, baseUrl));
  }).join('\n');
}

function rewriteUriAttributes(line, baseUrl, proxyBase) {
  return line.replace(/URI="([^"]+)"/g, (_match, uri) => {
    return `URI="${proxyBase}${encodeURIComponent(resolveUrl(uri, baseUrl))}"`;
  });
}

function resolveUrl(value, baseUrl) {
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `${baseUrl.protocol}${value}`;
  return new URL(value, baseUrl).toString();
}

function textResponse(message, status = 200) {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS },
  });
}
