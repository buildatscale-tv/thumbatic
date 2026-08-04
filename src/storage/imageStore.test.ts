import { describe, it, expect, beforeEach } from 'vitest';
import { IndexedDBAdapter } from './indexeddb';
import {
  deleteImage,
  findImageForSource,
  hasImage,
  hashBlob,
  idToImageRef,
  imageRefToId,
  isImageRef,
  listImages,
  putImage,
  rememberSource,
} from './imageStore';
import { useThumbnailStore, createInitialTextElements } from '../store/thumbnailStore';
import type { ThumbnailState } from '../types';

const bytes = (fill: number, size = 64) => new Blob([new Uint8Array(size).fill(fill)], { type: 'image/png' });

async function clearDatabase() {
  for (const image of await listImages()) {
    await deleteImage(image.id);
  }
  const adapter = new IndexedDBAdapter();
  for (const thumbnail of await adapter.list()) {
    await adapter.delete(thumbnail.id);
  }
}

function stateWithImage(name: string, reference: string): ThumbnailState {
  useThumbnailStore.setState({
    thumbnailId: null,
    thumbnailName: name,
    elements: [
      ...createInitialTextElements(),
      {
        id: 'image-1',
        type: 'image',
        name: 'Image',
        position: { x: 200, y: 500 },
        zIndex: 5000,
        properties: { size: 256, rotation: 0, opacity: 100, src: reference },
      },
    ],
  });
  return useThumbnailStore.getState();
}

beforeEach(clearDatabase);

describe('image references', () => {
  it('round trips an id through a reference', () => {
    expect(isImageRef('img:abc')).toBe(true);
    expect(isImageRef('https://example.com/logo.svg')).toBe(false);
    expect(imageRefToId(idToImageRef('abc'))).toBe('abc');
  });
});

describe('content hashing', () => {
  it('gives the same hash for the same bytes', async () => {
    expect(await hashBlob(bytes(7))).toBe(await hashBlob(bytes(7)));
  });

  it('gives a different hash for different bytes', async () => {
    expect(await hashBlob(bytes(7))).not.toBe(await hashBlob(bytes(8)));
  });
});

describe('storing images', () => {
  it('stores one copy no matter how often the same image is added', async () => {
    const first = await putImage(bytes(1), { name: 'a.png', width: 10, height: 5 });
    const again = await putImage(bytes(1), { name: 'renamed.png', width: 10, height: 5 });
    await putImage(bytes(2), { name: 'b.png', width: 10, height: 5 });

    expect(again.id).toBe(first.id);
    expect(await listImages()).toHaveLength(2);
  });

  it('reports whether an image is held', async () => {
    const stored = await putImage(bytes(3), { name: 'c.png', width: 1, height: 1 });
    expect(await hasImage(stored.id)).toBe(true);
    expect(await hasImage('not-a-real-id')).toBe(false);
  });

  it('finds the image made earlier from the same source file', async () => {
    const source = bytes(4);
    const sourceId = await hashBlob(source);
    const stored = await putImage(bytes(5), { name: 'd.png', width: 1, height: 1 });
    await rememberSource(sourceId, stored.id);

    expect(await findImageForSource(sourceId)).toBe(stored.id);
    expect(await findImageForSource('unknown-source')).toBeNull();
  });

  it('forgets a source whose image was deleted', async () => {
    const sourceId = 'source-1';
    const stored = await putImage(bytes(6), { name: 'e.png', width: 1, height: 1 });
    await rememberSource(sourceId, stored.id);
    await deleteImage(stored.id);

    expect(await findImageForSource(sourceId)).toBeNull();
  });
});

describe('an upload is a library entry, not a cache entry', () => {
  it('keeps one copy however many thumbnails use it, and keeps it when none do', async () => {
    const adapter = new IndexedDBAdapter();
    const shared = await putImage(bytes(9), { name: 'shared.png', width: 20, height: 10 });
    const unused = await putImage(bytes(10), { name: 'unused.png', width: 20, height: 10 });
    const reference = idToImageRef(shared.id);

    const one = await adapter.create('One', stateWithImage('One', reference));
    const two = await adapter.create('Two', stateWithImage('Two', reference));

    // The record carries a reference, not the image data
    const saved = await adapter.get(one.id);
    expect(JSON.stringify(saved)).toContain('img:');
    expect(JSON.stringify(saved)).not.toContain('base64');
    expect(await listImages()).toHaveLength(2);

    // An upload nobody has placed yet is still in the library. Nothing removes an
    // image behind the user's back, because Your Uploads is theirs to keep.
    expect(await hasImage(unused.id)).toBe(true);

    // Nor does losing every thumbnail that used one
    await adapter.delete(one.id);
    await adapter.delete(two.id);
    expect(await hasImage(shared.id)).toBe(true);
  });

  it('goes when it is deleted by hand, and takes its source record with it', async () => {
    const image = await putImage(bytes(12), { name: 'bye.png', width: 4, height: 4 });

    await deleteImage(image.id);

    expect(await hasImage(image.id)).toBe(false);
    expect(await listImages()).toHaveLength(0);
  });
});
