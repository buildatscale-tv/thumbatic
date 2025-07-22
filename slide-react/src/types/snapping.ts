// Snapping system type definitions

export type SnapTargetType = 'canvas-center' | 'element-center' | 'element-edge' | 'text-edge' | 'text-center' | 'custom';
export type SnapOrientation = 'vertical' | 'horizontal' | 'both';

export interface SnapTarget {
  id: string;
  type: SnapTargetType;
  orientation: SnapOrientation;
  position: {
    x?: number; // For vertical lines and points
    y?: number; // For horizontal lines and points
  };
  proximityThreshold: number; // Distance in pixels to activate snapping
  priority: number; // Higher priority wins in conflicts (0-10)
  elementId?: string; // Reference to source element (for element-based targets)
  label?: string; // Debug/display label
}

export interface ElementDimensions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ActiveSnap {
  target: SnapTarget;
  distance: number; // Distance from drag position to snap target
  snapPosition: {
    x?: number; // Final x position if snapping vertically
    y?: number; // Final y position if snapping horizontally
  };
  orientation: SnapOrientation;
  isGlobalWinner: boolean; // True if this is the global highest priority snap for its orientation (no ties)
}

export interface SnapState {
  isActive: boolean;
  activeSnaps: ActiveSnap[];
  dragPosition?: { x: number; y: number };
  elementDimensions?: ElementDimensions;
}

export interface SnapConfiguration {
  enabled: boolean;
  proximityThreshold: number; // Default proximity threshold
  snapThreshold: number; // Distance threshold for final snapping on release
  showGuides: boolean; // Whether to show visual alignment guides
  canvasCenter: {
    enabled: boolean;
    vertical: boolean;
    horizontal: boolean;
  };
  textElementEdges: {
    enabled: boolean;
    horizontal: boolean; // Top/bottom edge alignment guides
    vertical: boolean;   // Left/right edge alignment guides
    proximityThreshold?: number; // Override default proximity threshold
  };
  textElementCenters: {
    enabled: boolean;
    horizontal: boolean; // Horizontal center line (vertical alignment)
    vertical: boolean;   // Vertical center line (horizontal alignment)
    proximityThreshold?: number; // Override default proximity threshold
  };
}