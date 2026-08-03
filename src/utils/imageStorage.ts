// Uploaded logos are stored as blobs in IndexedDB and referenced by every thumbnail
// that uses them. These helpers keep an upload as sharp as possible while staying
// small enough to be worth storing.

// The canvas is 1280x720 and exports at 2x, so detail beyond 2x the canvas width
// can never be seen. Anything at or below this keeps its full resolution.
const MAX_DIMENSION = 2048;

// Aim to keep a single image under this. Quality steps down only when it does not fit.
const TARGET_BYTES = 600 * 1024;

// Tried in order, best quality first. The first result under the target wins.
const ENCODE_STEPS = [
  { maxDimension: 2048, quality: 0.95 },
  { maxDimension: 2048, quality: 0.9 },
  { maxDimension: 1600, quality: 0.9 },
  { maxDimension: 1280, quality: 0.85 },
  { maxDimension: 1024, quality: 0.8 },
];

export interface PreparedImage {
  blob: Blob;
  aspectRatio: number;
  originalBytes: number;
  storedBytes: number;
  width: number;
  height: number;
  recompressed: boolean;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The image could not be decoded.'));
    img.src = src;
  });
}

async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

/** Draws the image at a scale that fits maxDimension, never larger than the source. */
function drawScaled(img: HTMLImageElement, maxDimension: number): HTMLCanvasElement | null {
  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Reads an image file and returns the sharpest blob that still fits the budget.
 *
 * - SVG files are never touched. They are vector, already small, and rasterizing loses quality.
 * - A file that is already small enough and no larger than MAX_DIMENSION is kept byte for byte,
 *   so a hand-made logo is never re-encoded.
 * - Anything else is re-encoded as WebP, which keeps transparency and is much smaller than PNG.
 *   Resolution and quality drop one step at a time, and only as far as the budget requires.
 * - A lossless PNG at the same size is used instead when it happens to be smaller, which is
 *   common for flat logos.
 */
export async function prepareImageForStorage(file: File): Promise<PreparedImage> {
  const img = await loadImageFromBlob(file);
  const aspectRatio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;

  const keepOriginal = (): PreparedImage => ({
    blob: file,
    aspectRatio,
    originalBytes: file.size,
    storedBytes: file.size,
    width: img.naturalWidth,
    height: img.naturalHeight,
    recompressed: false,
  });

  if (file.type === 'image/svg+xml') return keepOriginal();

  // Already small enough and not oversized: keep every pixel of the source
  const withinDimensions = Math.max(img.naturalWidth, img.naturalHeight) <= MAX_DIMENSION;
  if (withinDimensions && file.size <= TARGET_BYTES) return keepOriginal();

  let best: PreparedImage | null = null;

  for (const step of ENCODE_STEPS) {
    const canvas = drawScaled(img, step.maxDimension);
    if (!canvas) break;

    const candidates: Blob[] = [];
    const webp = await canvasToBlob(canvas, 'image/webp', step.quality);
    // toBlob silently falls back to PNG when a format is unsupported
    if (webp && webp.type === 'image/webp') candidates.push(webp);
    const png = await canvasToBlob(canvas, 'image/png');
    if (png) candidates.push(png);
    if (candidates.length === 0) break;

    const smallest = candidates.reduce((a, b) => (b.size < a.size ? b : a));

    const attempt: PreparedImage = {
      blob: smallest,
      aspectRatio,
      originalBytes: file.size,
      storedBytes: smallest.size,
      width: canvas.width,
      height: canvas.height,
      recompressed: true,
    };

    // Keep the smallest attempt so far, in case no step reaches the target
    if (!best || attempt.storedBytes < best.storedBytes) best = attempt;

    if (attempt.storedBytes <= TARGET_BYTES) return attempt;
  }

  if (!best) return keepOriginal();

  // Never make a file bigger than it started
  return best.storedBytes < file.size ? best : keepOriginal();
}
