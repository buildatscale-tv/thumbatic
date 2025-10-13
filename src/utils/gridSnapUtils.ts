/**
 * Grid-based snapping utilities for 6x3 column grid
 */

// Canvas dimensions
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

// Grid configuration
const GRID_COLUMNS = 12;
const GRID_ROWS = 4;

// Calculate grid spacing
const COLUMN_WIDTH = CANVAS_WIDTH / GRID_COLUMNS;
const ROW_HEIGHT = CANVAS_HEIGHT / GRID_ROWS;

// Snap threshold for grid snapping (pixels)
const GRID_SNAP_THRESHOLD = 20;

/**
 * Calculate all grid intersection points
 */
export function getGridIntersections(): Array<{ x: number; y: number }> {
  const intersections: Array<{ x: number; y: number }> = [];

  for (let col = 0; col <= GRID_COLUMNS; col++) {
    for (let row = 0; row <= GRID_ROWS; row++) {
      intersections.push({
        x: col * COLUMN_WIDTH,
        y: row * ROW_HEIGHT,
      });
    }
  }

  return intersections;
}

/**
 * Snap a position to the nearest grid intersection
 */
export function snapToGrid(
  position: { x: number; y: number },
  threshold: number = GRID_SNAP_THRESHOLD
): { x: number; y: number; snapped: boolean } {
  const intersections = getGridIntersections();

  // Find the closest intersection
  let closestIntersection: { x: number; y: number } | null = null;
  let minDistance = Infinity;

  for (const intersection of intersections) {
    const dx = position.x - intersection.x;
    const dy = position.y - intersection.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      closestIntersection = intersection;
    }
  }

  // If within threshold, snap to grid
  if (closestIntersection && minDistance <= threshold) {
    return {
      x: closestIntersection.x,
      y: closestIntersection.y,
      snapped: true,
    };
  }

  // Otherwise, return original position
  return {
    x: position.x,
    y: position.y,
    snapped: false,
  };
}

/**
 * Get the nearest grid lines for a position (for visual feedback)
 */
export function getNearestGridLines(
  position: { x: number; y: number },
  threshold: number = GRID_SNAP_THRESHOLD
): {
  vertical: number | null;
  horizontal: number | null;
} {
  // Find nearest vertical grid line
  let nearestVertical: number | null = null;
  let minVerticalDistance = Infinity;

  for (let col = 0; col <= GRID_COLUMNS; col++) {
    const x = col * COLUMN_WIDTH;
    const distance = Math.abs(position.x - x);

    if (distance < minVerticalDistance && distance <= threshold) {
      minVerticalDistance = distance;
      nearestVertical = x;
    }
  }

  // Find nearest horizontal grid line
  let nearestHorizontal: number | null = null;
  let minHorizontalDistance = Infinity;

  for (let row = 0; row <= GRID_ROWS; row++) {
    const y = row * ROW_HEIGHT;
    const distance = Math.abs(position.y - y);

    if (distance < minHorizontalDistance && distance <= threshold) {
      minHorizontalDistance = distance;
      nearestHorizontal = y;
    }
  }

  return {
    vertical: nearestVertical,
    horizontal: nearestHorizontal,
  };
}

export { GRID_COLUMNS, GRID_ROWS, COLUMN_WIDTH, ROW_HEIGHT, GRID_SNAP_THRESHOLD };
