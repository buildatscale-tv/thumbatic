import type { ThumbnailRecord } from './types';
import { IMAGES_STORE, SOURCES_STORE, THUMBNAILS_STORE, getAllFrom, withStore } from './idb';

/**
 * Uploaded images, stored once per unique file and referenced by every thumbnail that
 * uses them. The id is the SHA-256 of the bytes, so the same image can never be stored
 * twice, no matter how many thumbnails use it or how often it is uploaded again.
 */

export const IMAGE_REF_PREFIX = 'img:';

export interface StoredImage {
  id: string;
  name: string;
  type: string;
  bytes: number;
  width: number;
  height: number;
  createdAt: number;
}

interface StoredImageRecord extends StoredImage {
  blob: Blob;
}

interface SourceRecord {
  sourceId: string;
  imageId: string;
}

export function isImageRef(value: string | undefined): value is string {
  return typeof value === 'string' && value.startsWith(IMAGE_REF_PREFIX);
}

export function imageRefToId(reference: string): string {
  return reference.slice(IMAGE_REF_PREFIX.length);
}

export function idToImageRef(id: string): string {
  return `${IMAGE_REF_PREFIX}${id}`;
}

/** SHA-256 of the bytes, as hex. Needs a secure context, so https or localhost. */
export async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Looks up the processed image made earlier from this exact source file. */
export async function findImageForSource(sourceId: string): Promise<string | null> {
  const record = await withStore<SourceRecord | undefined>(
    SOURCES_STORE,
    'readonly',
    store => store.get(sourceId)
  );
  if (!record) return null;
  const exists = await hasImage(record.imageId);
  return exists ? record.imageId : null;
}

export async function rememberSource(sourceId: string, imageId: string): Promise<void> {
  await withStore(SOURCES_STORE, 'readwrite', store => store.put({ sourceId, imageId }));
}

export async function hasImage(id: string): Promise<boolean> {
  const key = await withStore<IDBValidKey | undefined>(
    IMAGES_STORE,
    'readonly',
    store => store.getKey(id)
  );
  return key !== undefined;
}

/** Stores the image unless those exact bytes are already held. Returns its id. */
export async function putImage(
  blob: Blob,
  meta: { name: string; width: number; height: number }
): Promise<StoredImage> {
  const id = await hashBlob(blob);
  const existing = await withStore<StoredImageRecord | undefined>(
    IMAGES_STORE,
    'readonly',
    store => store.get(id)
  );
  if (existing) {
    const { blob: _blob, ...summary } = existing;
    return summary;
  }

  const record: StoredImageRecord = {
    id,
    blob,
    name: meta.name,
    type: blob.type || 'image/png',
    bytes: blob.size,
    width: meta.width,
    height: meta.height,
    createdAt: Date.now(),
  };
  await withStore(IMAGES_STORE, 'readwrite', store => store.put(record));

  const { blob: _stored, ...summary } = record;
  return summary;
}

export async function getImageBlob(id: string): Promise<Blob | null> {
  const record = await withStore<StoredImageRecord | undefined>(
    IMAGES_STORE,
    'readonly',
    store => store.get(id)
  );
  return record?.blob ?? null;
}

/** Every stored image, newest first. This is the personal image library. */
export async function listImages(): Promise<StoredImage[]> {
  const records = await getAllFrom<StoredImageRecord>(IMAGES_STORE);
  return records
    .map(({ blob: _blob, ...summary }) => summary)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteImage(id: string): Promise<void> {
  await withStore(IMAGES_STORE, 'readwrite', store => store.delete(id));
}

/** Collects every image id referenced by a saved thumbnail. */
export async function collectReferencedImageIds(): Promise<Set<string>> {
  const records = await getAllFrom<ThumbnailRecord>(THUMBNAILS_STORE);
  const referenced = new Set<string>();

  for (const record of records) {
    // An image is in use when it is on a canvas. Nothing else refers to one.
    for (const element of record.elements ?? []) {
      const src = (element as { properties?: { src?: string } }).properties?.src;
      if (isImageRef(src)) referenced.add(imageRefToId(src));
    }
  }

  return referenced;
}

/**
 * Deletes images that no saved thumbnail refers to any more.
 *
 * Mark and sweep rather than reference counting. Counting breaks whenever a write fails
 * between two stores, while a sweep is idempotent and a crash only postpones it.
 */
export async function sweepUnusedImages(keepAlso: Set<string> = new Set()): Promise<number> {
  const referenced = await collectReferencedImageIds();
  const stored = await listImages();

  let removed = 0;
  for (const image of stored) {
    if (referenced.has(image.id) || keepAlso.has(image.id)) continue;
    await deleteImage(image.id);
    removed += 1;
  }
  return removed;
}
