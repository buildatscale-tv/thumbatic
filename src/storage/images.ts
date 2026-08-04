import { STORAGE_BACKEND } from './config';
import {
  deleteImage as deleteLocalImage,
  findImageForSource,
  getImageBlob,
  hasImage as hasLocalImage,
  hashBlob,
  listImages as listLocalImages,
  putImage as putLocalImage,
  rememberSource,
} from './imageStore';
import type { StoredImage } from './imageStore';
import {
  deleteRemoteImage,
  hasRemoteImage,
  listRemoteImages,
  putRemoteImage,
  remoteImageUrl,
  remoteImageUsage,
} from './remoteImageStore';
import { getStorageAdapter } from './index';
import { isImageRef, imageRefToId } from './imageStore';

/**
 * One way in to the uploaded images, whichever side is holding them.
 *
 * With the Durable Object backend the images live in R2, so the library follows you to
 * another device. Otherwise they are blobs in IndexedDB and stay in this browser. Both
 * sides key an image by the SHA-256 of its bytes, so a thumbnail refers to an image the
 * same way either way, and a record never changes when the backend does.
 */

const usesRemote = () => STORAGE_BACKEND === 'durable-objects';

export type { StoredImage };
export { hashBlob };

export async function hasImage(id: string): Promise<boolean> {
  return usesRemote() ? hasRemoteImage(id) : hasLocalImage(id);
}

export async function putImage(
  blob: Blob,
  meta: { name: string; width: number; height: number }
): Promise<StoredImage> {
  if (!usesRemote()) return putLocalImage(blob, meta);
  const id = await hashBlob(blob);
  return putRemoteImage(id, blob, meta);
}

export async function listImages(): Promise<StoredImage[]> {
  return usesRemote() ? listRemoteImages() : listLocalImages();
}

export async function deleteImage(id: string): Promise<void> {
  return usesRemote() ? deleteRemoteImage(id) : deleteLocalImage(id);
}

/**
 * Which thumbnails use each image, keyed by image id.
 *
 * The picker shows this before deleting an upload, since deleting one that is in use
 * leaves a blank space on those thumbnails. A browser backend reads its own records,
 * which is local work. The Durable Object answers in a single request.
 */
export async function imageUsage(): Promise<Record<string, string[]>> {
  if (usesRemote()) return remoteImageUsage();

  const adapter = getStorageAdapter();
  const usage: Record<string, string[]> = {};

  for (const summary of await adapter.list()) {
    const record = await adapter.get(summary.id);
    const seen = new Set<string>();
    for (const element of record.elements ?? []) {
      const src = (element as { properties?: { src?: string } }).properties?.src;
      if (!isImageRef(src) || seen.has(src)) continue;
      seen.add(src);
      (usage[imageRefToId(src)] ??= []).push(record.name || 'Untitled Thumbnail');
    }
  }

  return usage;
}

/**
 * A URL an img tag can use. The remote store answers with a normal URL that the browser
 * and the edge cache forever, since a different image would have a different id. The
 * local store has to build an object URL from the blob.
 */
export async function imageUrlFor(id: string): Promise<string | null> {
  if (usesRemote()) return remoteImageUrl(id);

  const blob = await getImageBlob(id);
  return blob ? URL.createObjectURL(blob) : null;
}

/**
 * The map from an original file to the image made from it stays in this browser even
 * when the images are remote. It only saves work, so it never needs to be shared.
 */
export { findImageForSource, rememberSource };
