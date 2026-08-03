import React from 'react';
import { getImageBlob, imageRefToId, isImageRef } from '../storage/imageStore';

// Thumbnails reference an uploaded image by content hash, not by data. These helpers
// turn a reference into something an <img> can show. Object URLs are cached per image,
// so ten elements using the same logo share one URL and one decode.

const urlCache = new Map<string, string>();
const pending = new Map<string, Promise<string | null>>();

export async function resolveImageRef(reference: string): Promise<string | null> {
  const id = imageRefToId(reference);

  const cached = urlCache.get(id);
  if (cached) return cached;

  const inFlight = pending.get(id);
  if (inFlight) return inFlight;

  const request = getImageBlob(id)
    .then(blob => {
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      urlCache.set(id, url);
      return url;
    })
    .finally(() => pending.delete(id));

  pending.set(id, request);
  return request;
}

/** Drops a cached object URL, for instance after the image is deleted. */
export function forgetImageUrl(id: string): void {
  const url = urlCache.get(id);
  if (!url) return;
  URL.revokeObjectURL(url);
  urlCache.delete(id);
}

/**
 * Returns something an <img> can use. A plain URL passes straight through, so library
 * logos cost nothing, and a stored reference resolves to an object URL.
 */
export function useImageSrc(src: string | undefined): string | undefined {
  const [resolved, setResolved] = React.useState<string | undefined>(() =>
    isImageRef(src) ? undefined : src
  );

  React.useEffect(() => {
    if (!isImageRef(src)) {
      setResolved(src);
      return;
    }

    let active = true;
    resolveImageRef(src).then(url => {
      if (active) setResolved(url ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [src]);

  return resolved;
}
