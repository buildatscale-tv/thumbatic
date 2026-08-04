import type { StoredImage } from './imageStore';

// Uploaded images held by the worker in R2. The id is the SHA-256 of the bytes, which
// makes three things possible: the store asks whether the bytes are already held before
// sending any, the same image is stored once for every thumbnail that uses it, and the
// response can be cached forever because different bytes mean a different id.

const API_BASE = '/api/images';

async function readError(response: Response): Promise<string> {
  const body = await response.text().catch(() => '');
  try {
    return (JSON.parse(body) as { error?: string }).error ?? '';
  } catch {
    return '';
  }
}

async function failed(response: Response, action: string): Promise<Error> {
  const message = await readError(response);
  return new Error(message || `${response.status} ${response.statusText || action}`);
}

export async function hasRemoteImage(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'HEAD' });
  return response.ok;
}

/** Uploads the bytes unless the store already holds them. */
export async function putRemoteImage(
  id: string,
  blob: Blob,
  meta: { name: string; width: number; height: number }
): Promise<StoredImage> {
  // Skipping an upload the store does not need is the whole point of hashing first
  if (await hasRemoteImage(id)) {
    const existing = (await listRemoteImages()).find(image => image.id === id);
    if (existing) return existing;
  }

  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': blob.type || 'image/png',
      'X-Image-Name': meta.name,
      'X-Image-Width': String(meta.width),
      'X-Image-Height': String(meta.height),
    },
    body: blob,
  });

  if (!response.ok) throw await failed(response, 'upload failed');
  return response.json() as Promise<StoredImage>;
}

export async function listRemoteImages(): Promise<StoredImage[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) throw await failed(response, 'could not list images');
  return response.json() as Promise<StoredImage[]>;
}

export async function deleteRemoteImage(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw await failed(response, 'delete failed');
}

/** The worker serves these with a long immutable cache, so no blob handling is needed. */
export function remoteImageUrl(id: string): string {
  return `${API_BASE}/${id}`;
}

/** Which thumbnails use each image, keyed by image id. */
export async function remoteImageUsage(): Promise<Record<string, string[]>> {
  const response = await fetch('/api/thumbnails/image-usage');
  if (!response.ok) throw await failed(response, 'could not read image usage');
  return response.json() as Promise<Record<string, string[]>>;
}
