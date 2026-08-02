import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCanvasScale, toCanvasPoint, toCanvasDelta } from './canvasCoords';

// jsdom gives every element a zero sized rect, so the canvas box is stubbed here.
function mountCanvas(rect: { left: number; top: number; width: number; height: number }) {
  const canvas = document.createElement('div');
  canvas.id = 'thumbnail';
  canvas.getBoundingClientRect = () =>
    ({ ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height, x: rect.left, y: rect.top, toJSON: () => ({}) }) as DOMRect;
  document.body.append(canvas);
  return canvas;
}

afterEach(() => {
  document.getElementById('thumbnail')?.remove();
});

describe('canvas coordinates', () => {
  it('reports scale 1 at full size', () => {
    mountCanvas({ left: 40, top: 48, width: 1280, height: 720 });
    expect(getCanvasScale()).toBe(1);
  });

  it('reports the scale when the canvas is drawn smaller', () => {
    mountCanvas({ left: 8, top: 48, width: 320, height: 180 });
    expect(getCanvasScale()).toBe(0.25);
  });

  it('converts a screen point to canvas coordinates at full size', () => {
    mountCanvas({ left: 40, top: 48, width: 1280, height: 720 });
    expect(toCanvasPoint(680, 408)).toEqual({ x: 640, y: 360 });
  });

  it('converts a screen point to canvas coordinates when scaled down', () => {
    mountCanvas({ left: 8, top: 48, width: 320, height: 180 });
    // The middle of the drawn canvas must be the middle of the 1280x720 space
    expect(toCanvasPoint(8 + 160, 48 + 90)).toEqual({ x: 640, y: 360 });
  });

  it('scales a drag distance so the element tracks the finger', () => {
    mountCanvas({ left: 8, top: 48, width: 320, height: 180 });
    expect(toCanvasDelta(50, 25)).toEqual({ x: 200, y: 100 });
  });

  it('falls back to scale 1 when the canvas is not mounted', () => {
    expect(getCanvasScale()).toBe(1);
    expect(toCanvasDelta(10, 10)).toEqual({ x: 10, y: 10 });
  });
});

describe('unmounted canvas', () => {
  beforeEach(() => {
    document.getElementById('thumbnail')?.remove();
  });

  it('returns the screen point unchanged', () => {
    expect(toCanvasPoint(100, 200)).toEqual({ x: 100, y: 200 });
  });
});
