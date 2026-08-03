// Uploaded images live in R2, keyed by the SHA-256 of their bytes. Content addressing
// buys three things: an image is stored once however many thumbnails use it, a client
// can ask whether the bytes are already held before sending any, and a response can be
// cached forever because different bytes always mean a different key.

const KEY_PREFIX = 'images/';
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';

export interface StoredImageSummary {
  id: string;
  name: string;
  type: string;
  bytes: number;
  width: number;
  height: number;
  createdAt: number;
}

function keyFor(id: string): string {
  return `${KEY_PREFIX}${id}`;
}

/** Only a hex SHA-256 is a valid id, which also keeps the key space free of traversal. */
function isValidId(id: string): boolean {
  return /^[a-f0-9]{64}$/.test(id);
}

function summaryFrom(object: R2Object): StoredImageSummary {
  const meta = object.customMetadata ?? {};
  return {
    id: object.key.slice(KEY_PREFIX.length),
    name: meta.name ?? 'image',
    type: object.httpMetadata?.contentType ?? 'image/png',
    bytes: object.size,
    width: Number(meta.width ?? 0),
    height: Number(meta.height ?? 0),
    createdAt: object.uploaded.getTime(),
  };
}

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/**
 * Handles /api/images routes. Returns null when the path is not an image route, so the
 * caller can carry on to the thumbnail routes.
 */
export async function handleImageRequest(
  request: Request,
  bucket: R2Bucket,
  corsHeaders: HeadersInit
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/images')) return null;

  // The library listing
  if (url.pathname === '/api/images') {
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }
    const listed = await bucket.list({ prefix: KEY_PREFIX, include: ['customMetadata', 'httpMetadata'] });
    const images = listed.objects
      .map(summaryFrom)
      .sort((a, b) => b.createdAt - a.createdAt);
    return json(images, 200, corsHeaders);
  }

  const match = url.pathname.match(/^\/api\/images\/([^/]+)$/);
  if (!match) return json({ error: 'Not found' }, 404, corsHeaders);

  const id = match[1];
  if (!isValidId(id)) {
    return json({ error: 'An image id must be a SHA-256 in hex' }, 400, corsHeaders);
  }

  // Does the store already hold these bytes? Answered before any upload happens.
  if (request.method === 'HEAD') {
    const head = await bucket.head(keyFor(id));
    return new Response(null, {
      status: head ? 200 : 404,
      headers: { ...corsHeaders, ...(head ? { 'Content-Length': String(head.size) } : {}) },
    });
  }

  if (request.method === 'GET') {
    const object = await bucket.get(keyFor(id));
    if (!object) return json({ error: 'Image not found' }, 404, corsHeaders);

    return new Response(object.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
        'Cache-Control': IMMUTABLE_CACHE,
        ETag: object.httpEtag,
      },
    });
  }

  if (request.method === 'PUT') {
    // Storing again would only rewrite identical bytes
    const existing = await bucket.head(keyFor(id));
    if (existing) return json(summaryFrom(existing), 200, corsHeaders);

    const body = await request.arrayBuffer();
    if (body.byteLength === 0) {
      return json({ error: 'Empty upload' }, 400, corsHeaders);
    }

    const digest = await crypto.subtle.digest('SHA-256', body);
    const actual = Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    // The key is a claim about the bytes, so check it rather than trust it
    if (actual !== id) {
      return json({ error: 'The bytes do not match the id' }, 400, corsHeaders);
    }

    const put = await bucket.put(keyFor(id), body, {
      httpMetadata: { contentType: request.headers.get('Content-Type') ?? 'image/png' },
      customMetadata: {
        name: request.headers.get('X-Image-Name') ?? 'image',
        width: request.headers.get('X-Image-Width') ?? '0',
        height: request.headers.get('X-Image-Height') ?? '0',
      },
    });
    return json(summaryFrom(put), 201, corsHeaders);
  }

  if (request.method === 'DELETE') {
    await bucket.delete(keyFor(id));
    return json({ success: true }, 200, corsHeaders);
  }

  return json({ error: 'Method not allowed' }, 405, corsHeaders);
}

/** Deletes images that no thumbnail refers to. */
export async function sweepImages(bucket: R2Bucket, referenced: Set<string>): Promise<number> {
  const listed = await bucket.list({ prefix: KEY_PREFIX });
  let removed = 0;

  for (const object of listed.objects) {
    const id = object.key.slice(KEY_PREFIX.length);
    if (referenced.has(id)) continue;
    await bucket.delete(object.key);
    removed += 1;
  }

  return removed;
}
