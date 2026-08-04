import { ThumbnailDO } from '../do/ThumbnailDO';
import { handleImageRequest } from './images';

export { ThumbnailDO };

export interface Env {
  // Absent in the demo environment, which stores thumbnails in the browser instead
  THUMBNAIL_DO?: DurableObjectNamespace<ThumbnailDO>;
  // Uploaded images. Absent in the demo, so uploads there stay in the browser.
  IMAGES?: R2Bucket;
  ASSETS: Fetcher;
  // Absent means the access gate is off, which is how the demo stays public
  GATE_SECRET?: string;
}

const GATE_COOKIE = 'auth';
const GATE_REDIRECT = 'https://buildatscale.tv';
const GATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function gate(request: Request, env: Env): Response | null {
  const url = new URL(request.url);
  const secret = env.GATE_SECRET;

  if (!secret) return null;

  if (url.searchParams.has('lock')) {
    const clear = `${GATE_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`;
    return new Response(null, {
      status: 302,
      headers: { Location: GATE_REDIRECT, 'Set-Cookie': clear },
    });
  }

  const providedKey = url.searchParams.get('key');
  if (providedKey && providedKey === secret) {
    const clean = new URL(url.toString());
    clean.searchParams.delete('key');
    const cookie = `${GATE_COOKIE}=${encodeURIComponent(secret)}; Path=/; Max-Age=${GATE_COOKIE_MAX_AGE}; Secure; HttpOnly; SameSite=Lax`;
    return new Response(null, {
      status: 302,
      headers: { Location: clean.pathname + clean.search, 'Set-Cookie': cookie },
    });
  }

  if (readCookie(request, GATE_COOKIE) === secret) return null;

  return Response.redirect(GATE_REDIRECT, 302);
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(), status: 204 });
    }

    const blocked = gate(request, env);
    if (blocked) return blocked;

    // Uploaded images are served from R2 by the worker itself
    if (url.pathname.startsWith('/api/images')) {
      if (!env.IMAGES) return jsonError('Not found', 404);

      const handled = await handleImageRequest(request, env.IMAGES, corsHeaders());
      if (handled) return handled;
    }

    // Route API requests to the Durable Object
    if (url.pathname.startsWith('/api/')) {
      // No binding means this deployment keeps thumbnails in the browser, so there is
      // no API to reach. Answering 404 also keeps the demo from exposing a store that
      // anyone could write to.
      if (!env.THUMBNAIL_DO) {
        return jsonError('Not found', 404);
      }

      const id = env.THUMBNAIL_DO.idFromName('global');
      const doStub = env.THUMBNAIL_DO.get(id);
      return doStub.fetch(request);
    }

    // Serve static assets for everything else
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        // For SPA routing, serve index.html for non-asset routes
        const indexRequest = new Request(new URL('/index.html', url.origin), request);
        return env.ASSETS.fetch(indexRequest);
      }
      return response;
    } catch {
      // Fallback: serve index.html for SPA routes
      const indexRequest = new Request(new URL('/index.html', url.origin), request);
      return env.ASSETS.fetch(indexRequest);
    }
  },
};
