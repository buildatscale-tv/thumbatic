// Uploaded logos are kept as data URLs inside the saved thumbnail, so their size
// counts against the storage quota (localStorage is about 5 MB in most browsers).
// These helpers keep an upload as sharp as possible while staying small enough to save.

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
  dataUrl: string;
  aspectRatio: number;
  originalBytes: number;
  storedBytes: number;
  width: number;
  height: number;
  recompressed: boolean;
}

/** Decoded byte size of a base64 data URL, without allocating the bytes. */
export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`"${file.name}" could not be read.`));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The image could not be decoded.'));
    img.src = src;
  });
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
 * Reads an image file and returns the sharpest data URL that still fits the budget.
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
  const original = await readAsDataUrl(file);
  const originalBytes = dataUrlBytes(original);
  const img = await loadImage(original);
  const aspectRatio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;

  const keepOriginal = (): PreparedImage => ({
    dataUrl: original,
    aspectRatio,
    originalBytes,
    storedBytes: originalBytes,
    width: img.naturalWidth,
    height: img.naturalHeight,
    recompressed: false,
  });

  if (file.type === 'image/svg+xml') return keepOriginal();

  // Already small enough and not oversized: keep every pixel of the source
  const withinDimensions = Math.max(img.naturalWidth, img.naturalHeight) <= MAX_DIMENSION;
  if (withinDimensions && originalBytes <= TARGET_BYTES) return keepOriginal();

  let best: PreparedImage | null = null;

  for (const step of ENCODE_STEPS) {
    const canvas = drawScaled(img, step.maxDimension);
    if (!canvas) break;

    const candidates: string[] = [];
    const webp = canvas.toDataURL('image/webp', step.quality);
    // toDataURL silently falls back to PNG when a format is unsupported
    if (webp.startsWith('data:image/webp')) candidates.push(webp);
    candidates.push(canvas.toDataURL('image/png'));

    const smallest = candidates.reduce((a, b) => (dataUrlBytes(b) < dataUrlBytes(a) ? b : a));
    const bytes = dataUrlBytes(smallest);

    const attempt: PreparedImage = {
      dataUrl: smallest,
      aspectRatio,
      originalBytes,
      storedBytes: bytes,
      width: canvas.width,
      height: canvas.height,
      recompressed: true,
    };

    // Keep the smallest attempt so far, in case no step reaches the target
    if (!best || bytes < best.storedBytes) best = attempt;

    if (bytes <= TARGET_BYTES) return attempt;
  }

  if (!best) return keepOriginal();

  // Never make a file bigger than it started
  return best.storedBytes < originalBytes ? best : keepOriginal();
}
