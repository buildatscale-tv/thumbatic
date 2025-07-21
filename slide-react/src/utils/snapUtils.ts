import type { SnapTarget, ElementDimensions, ActiveSnap, SnapConfiguration } from '../types/snapping';

// Canvas constants
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const CANVAS_CENTER_X = CANVAS_WIDTH / 2;  // 640
export const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2; // 360

// No scaling functions needed - we use direct 1280x720 pixel coordinates

// Default configuration
export const DEFAULT_SNAP_CONFIG: SnapConfiguration = {
  enabled: true,
  proximityThreshold: 100,
  snapThreshold: 50, // Snap if released within 50px of guide
  showGuides: true,
  canvasCenter: {
    enabled: true,
    vertical: true,
    horizontal: true,
  },
};

/**
 * Calculate element dimensions and center from DOM element
 * All coordinates are in direct pixel system (1280x720)
 */
export const calculateElementDimensions = (
  element: HTMLElement,
  currentPosition: { x: number; y: number }
): ElementDimensions => {
  const rect = element.getBoundingClientRect();
  
  // Use direct DOM dimensions (no scaling)
  const width = rect.width;
  const height = rect.height;
  
  // currentPosition is already in pixel coordinates
  return {
    width,
    height,
    centerX: currentPosition.x,
    centerY: currentPosition.y,
    left: currentPosition.x - width / 2,
    top: currentPosition.y - height / 2,
    right: currentPosition.x + width / 2,
    bottom: currentPosition.y + height / 2,
  };
};

/**
 * Create canvas center snap targets
 */
export const createCanvasCenterTargets = (
  config: SnapConfiguration = DEFAULT_SNAP_CONFIG
): SnapTarget[] => {
  const targets: SnapTarget[] = [];

  if (!config.canvasCenter.enabled) {
    return targets;
  }

  // Vertical center line (for horizontal alignment)
  if (config.canvasCenter.vertical) {
    targets.push({
      id: 'canvas-center-vertical',
      type: 'canvas-center',
      orientation: 'vertical',
      position: { x: CANVAS_CENTER_X },
      proximityThreshold: config.proximityThreshold,
      priority: 8,
      label: 'Canvas Vertical Center',
    });
  }

  // Horizontal center line (for vertical alignment)
  if (config.canvasCenter.horizontal) {
    targets.push({
      id: 'canvas-center-horizontal', 
      type: 'canvas-center',
      orientation: 'horizontal',
      position: { y: CANVAS_CENTER_Y },
      proximityThreshold: config.proximityThreshold,
      priority: 8,
      label: 'Canvas Horizontal Center',
    });
  }

  return targets;
};

/**
 * Calculate distance from a point to a snap target
 */
export const calculateDistanceToTarget = (
  elementDimensions: ElementDimensions,
  target: SnapTarget
): number => {
  const { centerX, centerY } = elementDimensions;

  if (target.orientation === 'vertical' && target.position.x !== undefined) {
    return Math.abs(centerX - target.position.x);
  }
  
  if (target.orientation === 'horizontal' && target.position.y !== undefined) {
    return Math.abs(centerY - target.position.y);
  }

  if (target.orientation === 'both' && target.position.x !== undefined && target.position.y !== undefined) {
    const dx = centerX - target.position.x;
    const dy = centerY - target.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  return Infinity;
};

/**
 * Find all active snap targets within proximity threshold
 */
export const findActiveSnaps = (
  elementDimensions: ElementDimensions,
  snapTargets: SnapTarget[]
): ActiveSnap[] => {
  const activeSnaps: ActiveSnap[] = [];

  for (const target of snapTargets) {
    const distance = calculateDistanceToTarget(elementDimensions, target);
    
    if (distance <= target.proximityThreshold) {
      const snapPosition: { x?: number; y?: number } = {};
      
      // Calculate final snap position
      if (target.orientation === 'vertical' && target.position.x !== undefined) {
        snapPosition.x = target.position.x;
      }
      
      if (target.orientation === 'horizontal' && target.position.y !== undefined) {
        snapPosition.y = target.position.y;
      }

      if (target.orientation === 'both' && target.position.x !== undefined && target.position.y !== undefined) {
        snapPosition.x = target.position.x;
        snapPosition.y = target.position.y;
      }

      activeSnaps.push({
        target,
        distance,
        snapPosition,
        orientation: target.orientation,
      });
    }
  }

  // Sort by priority (higher priority first), then by distance (closer first)
  return activeSnaps.sort((a, b) => {
    if (a.target.priority !== b.target.priority) {
      return b.target.priority - a.target.priority;
    }
    return a.distance - b.distance;
  });
};

/**
 * Calculate final position after snapping on drag end
 */
export const calculateSnapPosition = (
  currentPosition: { x: number; y: number },
  activeSnaps: ActiveSnap[],
  snapThreshold: number = DEFAULT_SNAP_CONFIG.snapThreshold
): { x: number; y: number } => {
  const finalPosition = { ...currentPosition };

  // Apply snaps that are within the snap threshold
  for (const activeSnap of activeSnaps) {
    if (activeSnap.distance <= snapThreshold) {
      if (activeSnap.snapPosition.x !== undefined) {
        finalPosition.x = activeSnap.snapPosition.x;
      }
      if (activeSnap.snapPosition.y !== undefined) {
        finalPosition.y = activeSnap.snapPosition.y;
      }
    }
  }

  return finalPosition;
};

/**
 * Get all available snap targets for the current state
 */
export const getAllSnapTargets = (
  config: SnapConfiguration = DEFAULT_SNAP_CONFIG
): SnapTarget[] => {
  const targets: SnapTarget[] = [];
  
  // Add canvas center targets
  targets.push(...createCanvasCenterTargets(config));
  
  // Future: Add element-based targets here
  // targets.push(...createElementSnapTargets(elements, config));
  
  return targets;
};