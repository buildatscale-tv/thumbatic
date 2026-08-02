// The canvas is always 1280x720 in its own coordinates, but it is drawn smaller when
// the window cannot hold it, for example on a phone. Pointer events arrive in screen
// pixels, so they have to be converted before they touch element positions.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

function canvasRect(): DOMRect | null {
  const canvas = document.getElementById('thumbnail');
  return canvas ? canvas.getBoundingClientRect() : null;
}

/** How much the canvas is scaled on screen. 1 at full size. */
export function getCanvasScale(): number {
  const rect = canvasRect();
  if (!rect || rect.width <= 0) return 1;
  return rect.width / CANVAS_WIDTH;
}

/** Converts a screen point to canvas coordinates. */
export function toCanvasPoint(clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvasRect();
  if (!rect || rect.width <= 0) return { x: clientX, y: clientY };
  const scale = rect.width / CANVAS_WIDTH;
  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale,
  };
}

/** Converts a screen distance to a canvas distance. */
export function toCanvasDelta(deltaX: number, deltaY: number): { x: number; y: number } {
  const scale = getCanvasScale();
  return { x: deltaX / scale, y: deltaY / scale };
}
