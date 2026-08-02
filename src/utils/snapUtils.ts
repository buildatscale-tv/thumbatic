import type { SnapTarget, ElementDimensions, ActiveSnap, SnapConfiguration } from '../types/snapping';
import type { ThumbnailElement } from '../types';

// Canvas constants
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const CANVAS_CENTER_X = CANVAS_WIDTH / 2;  // 640
export const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2; // 360

// Zone detection constants
export const CENTER_ZONE_THRESHOLD = 120; // Distance from center lines to show canvas center guides

// No scaling functions needed - we use direct 1280x720 pixel coordinates

/**
 * Determine if a position is near center lines (checks each axis independently)
 */
export const isInCenterZone = (position: { x: number; y: number }): boolean => {
  const distanceFromVerticalCenter = Math.abs(position.x - CANVAS_CENTER_X);
  const distanceFromHorizontalCenter = Math.abs(position.y - CANVAS_CENTER_Y);

  // Near center if within threshold of EITHER axis (not both required)
  return distanceFromVerticalCenter <= CENTER_ZONE_THRESHOLD ||
         distanceFromHorizontalCenter <= CENTER_ZONE_THRESHOLD;
};

// Default configuration
export const DEFAULT_SNAP_CONFIG: SnapConfiguration = {
  enabled: true,
  proximityThreshold: 50,
  snapThreshold: 25, // Snap if released within 50px of guide
  showGuides: true,
  canvasCenter: {
    enabled: true,
    vertical: true,
    horizontal: true,
  },
  textElementEdges: {
    enabled: true,
    horizontal: true,
    vertical: true,
    proximityThreshold: 50, // Lower priority, wider threshold
  },
  textElementCenters: {
    enabled: true,
    horizontal: true,
    vertical: true,
    proximityThreshold: 20, // Higher priority, tighter threshold
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
      priority: 6,
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
      priority: 6,
      label: 'Canvas Horizontal Center',
    });
  }

  return targets;
};

/**
 * Create text element edge snap targets
 */
export const createTextElementSnapTargets = (
  textElements: ThumbnailElement[],
  config: SnapConfiguration = DEFAULT_SNAP_CONFIG,
  excludeElementId?: string // Exclude the element being dragged
): SnapTarget[] => {
  const targets: SnapTarget[] = [];

  if (!config.textElementEdges.enabled) {
    return targets;
  }

  const proximityThreshold = config.textElementEdges.proximityThreshold ?? config.proximityThreshold;

  for (const element of textElements) {
    if (element.type !== 'text' || element.id === excludeElementId) continue;

    // Get DOM element to calculate actual dimensions
    const domElement = document.querySelector(`[data-element-id="${element.id}"]`) as HTMLElement;

    if (!domElement) continue;

    const elementDimensions = calculateElementDimensions(domElement, element.position);

    // Create horizontal alignment guides (top and bottom edges)
    if (config.textElementEdges.horizontal) {
      // Top edge horizontal line
      targets.push({
        id: `text-edge-top-${element.id}`,
        type: 'text-edge',
        orientation: 'horizontal',
        position: { y: elementDimensions.top },
        proximityThreshold,
        priority: 8, // Higher priority than canvas center
        elementId: element.id,
        label: `${element.name} Top Edge`,
      });

      // Bottom edge horizontal line
      targets.push({
        id: `text-edge-bottom-${element.id}`,
        type: 'text-edge',
        orientation: 'horizontal',
        position: { y: elementDimensions.bottom },
        proximityThreshold,
        priority: 8,
        elementId: element.id,
        label: `${element.name} Bottom Edge`,
      });
    }

    // Create vertical alignment guides (left and right edges)
    if (config.textElementEdges.vertical) {
      // Left edge vertical line
      targets.push({
        id: `text-edge-left-${element.id}`,
        type: 'text-edge',
        orientation: 'vertical',
        position: { x: elementDimensions.left },
        proximityThreshold,
        priority: 8,
        elementId: element.id,
        label: `${element.name} Left Edge`,
      });

      // Right edge vertical line
      targets.push({
        id: `text-edge-right-${element.id}`,
        type: 'text-edge',
        orientation: 'vertical',
        position: { x: elementDimensions.right },
        proximityThreshold,
        priority: 8,
        elementId: element.id,
        label: `${element.name} Right Edge`,
      });
    }
  }

  return targets;
};

/**
 * Create text element center snap targets
 */
export const createTextElementCenterTargets = (
  textElements: ThumbnailElement[],
  config: SnapConfiguration = DEFAULT_SNAP_CONFIG,
  excludeElementId?: string // Exclude the element being dragged
): SnapTarget[] => {
  const targets: SnapTarget[] = [];

  if (!config.textElementCenters.enabled) {
    return targets;
  }

  const proximityThreshold = config.textElementCenters.proximityThreshold ?? config.proximityThreshold;

  for (const element of textElements) {
    if (element.type !== 'text' || element.id === excludeElementId) continue;

    // Get DOM element to calculate actual dimensions
    const domElement = document.querySelector(`[data-element-id="${element.id}"]`) as HTMLElement;

    if (!domElement) continue;

    const elementDimensions = calculateElementDimensions(domElement, element.position);

    // Create horizontal center line (for vertical alignment)
    if (config.textElementCenters.horizontal) {
      targets.push({
        id: `text-center-horizontal-${element.id}`,
        type: 'text-center',
        orientation: 'horizontal',
        position: { y: elementDimensions.centerY },
        proximityThreshold,
        priority: 9, // Highest priority for text centers
        elementId: element.id,
        label: `${element.name} Horizontal Center`,
      });
    }

    // Create vertical center line (for horizontal alignment)
    if (config.textElementCenters.vertical) {
      targets.push({
        id: `text-center-vertical-${element.id}`,
        type: 'text-center',
        orientation: 'vertical',
        position: { x: elementDimensions.centerX },
        proximityThreshold,
        priority: 9, // Highest priority for text centers
        elementId: element.id,
        label: `${element.name} Vertical Center`,
      });
    }
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
  const { centerX, centerY, left, right, top, bottom } = elementDimensions;

  // For canvas center targets, snap to center point
  if (target.type === 'canvas-center') {
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
  }

  // For text edge targets, snap edges to edges
  if (target.type === 'text-edge') {
    if (target.orientation === 'vertical' && target.position.x !== undefined) {
      // Find closest edge (left or right) to target vertical line
      const leftDistance = Math.abs(left - target.position.x);
      const rightDistance = Math.abs(right - target.position.x);
      return Math.min(leftDistance, rightDistance);
    }

    if (target.orientation === 'horizontal' && target.position.y !== undefined) {
      // Find closest edge (top or bottom) to target horizontal line
      const topDistance = Math.abs(top - target.position.y);
      const bottomDistance = Math.abs(bottom - target.position.y);
      return Math.min(topDistance, bottomDistance);
    }
  }

  // For text center targets, snap center to center
  if (target.type === 'text-center') {
    if (target.orientation === 'vertical' && target.position.x !== undefined) {
      return Math.abs(centerX - target.position.x);
    }

    if (target.orientation === 'horizontal' && target.position.y !== undefined) {
      return Math.abs(centerY - target.position.y);
    }
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

      // Calculate final snap position based on target type
      if (target.type === 'canvas-center') {
        // Canvas center snapping - snap element center to target position
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
      } else if (target.type === 'text-edge') {
        // Text edge snapping - snap closest element edge to target position
        if (target.orientation === 'vertical' && target.position.x !== undefined) {
          const { left, right, width } = elementDimensions;
          const leftDistance = Math.abs(left - target.position.x);
          const rightDistance = Math.abs(right - target.position.x);

          if (leftDistance <= rightDistance) {
            // Snap left edge to target
            snapPosition.x = target.position.x + width / 2;
          } else {
            // Snap right edge to target
            snapPosition.x = target.position.x - width / 2;
          }
        }

        if (target.orientation === 'horizontal' && target.position.y !== undefined) {
          const { top, bottom, height } = elementDimensions;
          const topDistance = Math.abs(top - target.position.y);
          const bottomDistance = Math.abs(bottom - target.position.y);

          if (topDistance <= bottomDistance) {
            // Snap top edge to target
            snapPosition.y = target.position.y + height / 2;
          } else {
            // Snap bottom edge to target
            snapPosition.y = target.position.y - height / 2;
          }
        }
      } else if (target.type === 'text-center') {
        // Text center snapping - snap element center to target center position
        if (target.orientation === 'vertical' && target.position.x !== undefined) {
          snapPosition.x = target.position.x;
        }

        if (target.orientation === 'horizontal' && target.position.y !== undefined) {
          snapPosition.y = target.position.y;
        }
      }

      activeSnaps.push({
        target,
        distance,
        snapPosition,
        orientation: target.orientation,
        isGlobalWinner: false, // Will be calculated after all snaps are collected
      });
    }
  }

  // Calculate global winners for each orientation (handling ties)
  const verticalSnaps = activeSnaps.filter(snap => snap.orientation === 'vertical');
  const horizontalSnaps = activeSnaps.filter(snap => snap.orientation === 'horizontal');

  // Find global highest priorities
  const globalVerticalPriority = verticalSnaps.length > 0
    ? Math.max(...verticalSnaps.map(snap => snap.target.priority))
    : -1;
  const globalHorizontalPriority = horizontalSnaps.length > 0
    ? Math.max(...horizontalSnaps.map(snap => snap.target.priority))
    : -1;

  // Find candidates for each orientation
  const verticalWinnerCandidates = verticalSnaps.filter(snap =>
    snap.target.priority === globalVerticalPriority
  );
  const horizontalWinnerCandidates = horizontalSnaps.filter(snap =>
    snap.target.priority === globalHorizontalPriority
  );

  // Determine if there are ties (multiple candidates = tie = no winner)
  const hasVerticalWinner = verticalWinnerCandidates.length === 1;
  const hasHorizontalWinner = horizontalWinnerCandidates.length === 1;

  // Mark global winners (only if no ties)
  for (const snap of activeSnaps) {
    if (snap.orientation === 'vertical') {
      snap.isGlobalWinner = hasVerticalWinner &&
        snap.target.priority === globalVerticalPriority;
    } else if (snap.orientation === 'horizontal') {
      snap.isGlobalWinner = hasHorizontalWinner &&
        snap.target.priority === globalHorizontalPriority;
    } else {
      snap.isGlobalWinner = false;
    }
  }

  // Sort by priority (higher priority first), then by distance (closer first)
  // Priority hierarchy:
  // 9: Text element centers (highest priority, tight threshold)
  // 8: Text element edges (high priority, wider threshold)
  // 6: Canvas center lines (lower priority)
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
  _snapThreshold: number = DEFAULT_SNAP_CONFIG.snapThreshold
): { x: number; y: number } => {
  const finalPosition = { ...currentPosition };

  // activeSnaps already contains only snaps within their individual proximity thresholds
  // (filtered by findActiveSnaps), so we don't need to filter further
  if (activeSnaps.length === 0) {
    return finalPosition;
  }

  // Apply only global winners (no ties allowed)
  for (const activeSnap of activeSnaps) {
    if (activeSnap.isGlobalWinner) {
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
  config: SnapConfiguration = DEFAULT_SNAP_CONFIG,
  textElements: ThumbnailElement[] = [],
  excludeElementId?: string,
  centerSnapMode: boolean = false // Explicit mode toggle: false = neighbor, true = center
): SnapTarget[] => {
  const targets: SnapTarget[] = [];

  if (centerSnapMode) {
    // CENTER SNAP MODE: Only show canvas center guides
    const centerConfig = {
      ...config,
      proximityThreshold: 150 // Wider snap range for strong magnetic feel
    };
    targets.push(...createCanvasCenterTargets(centerConfig));
  } else {
    // NEIGHBOR SNAP MODE (default): Only show text element guides
    // Add text element edge targets (excluding the dragged element)
    targets.push(...createTextElementSnapTargets(textElements, config, excludeElementId));

    // Add text element center targets (excluding the dragged element)
    targets.push(...createTextElementCenterTargets(textElements, config, excludeElementId));
  }

  return targets;
};
