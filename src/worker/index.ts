import { ThumbnailDO } from '../do/ThumbnailDO';

export { ThumbnailDO };

export interface Env {
  THUMBNAIL_DO: DurableObjectNamespace<ThumbnailDO>;
  ASSETS: Fetcher;
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(), status: 204 });
    }

    // Route API requests to the Durable Object
    if (url.pathname.startsWith('/api/')) {
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
