import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  deleteRemoteImage,
  hasRemoteImage,
  listRemoteImages,
  putRemoteImage,
  remoteImageUrl,
  sweepRemoteImages,
} from './remoteImageStore';

const blob = () => new Blob([new Uint8Array(8).fill(1)], { type: 'image/png' });
const id = 'a'.repeat(64);

let calls: { url: string; method: string }[] = [];

function respondWith(handler: (url: string, method: string) => Response) {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    calls.push({ url, method });
    return handler(url, method);
  }));
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  calls = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('remote image store', () => {
  it('builds a plain URL for an image, so the browser and the edge can cache it', () => {
    expect(remoteImageUrl(id)).toBe(`/api/images/${id}`);
  });

  it('asks with HEAD whether the bytes are already held', async () => {
    respondWith(() => new Response(null, { status: 200 }));
    expect(await hasRemoteImage(id)).toBe(true);
    expect(calls).toEqual([{ url: `/api/images/${id}`, method: 'HEAD' }]);
  });

  it('skips the upload when the store already holds those bytes', async () => {
    const summary = { id, name: 'held.png', type: 'image/png', bytes: 8, width: 2, height: 2, createdAt: 1 };
    respondWith((url, method) => {
      if (method === 'HEAD') return new Response(null, { status: 200 });
      if (url === '/api/images') return json([summary]);
      return json({ error: 'should not upload' }, 500);
    });

    const stored = await putRemoteImage(id, blob(), { name: 'held.png', width: 2, height: 2 });

    expect(stored.id).toBe(id);
    expect(calls.some(call => call.method === 'PUT')).toBe(false);
  });

  it('uploads when the store does not have the bytes', async () => {
    const summary = { id, name: 'new.png', type: 'image/png', bytes: 8, width: 2, height: 2, createdAt: 1 };
    respondWith((_url, method) => {
      if (method === 'HEAD') return new Response(null, { status: 404 });
      if (method === 'PUT') return json(summary, 201);
      return json([]);
    });

    const stored = await putRemoteImage(id, blob(), { name: 'new.png', width: 2, height: 2 });

    expect(stored.name).toBe('new.png');
    expect(calls.filter(call => call.method === 'PUT')).toHaveLength(1);
  });

  it('reports the status when a request fails', async () => {
    respondWith(() => new Response('<!doctype html>', { status: 502, statusText: 'Bad Gateway' }));
    await expect(listRemoteImages()).rejects.toThrow(/502/);
  });

  it('prefers the error message the server sent', async () => {
    respondWith(() => json({ error: 'The bytes do not match the id' }, 400));
    await expect(deleteRemoteImage(id)).rejects.toThrow('The bytes do not match the id');
  });

  it('returns how many images the sweep removed', async () => {
    respondWith(() => json({ removed: 3 }));
    expect(await sweepRemoteImages()).toBe(3);
  });
});
