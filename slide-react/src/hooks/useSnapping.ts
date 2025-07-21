import { useState, useCallback, useMemo } from 'react';
import type { SnapState, ElementDimensions, ActiveSnap, SnapConfiguration } from '../types/snapping';
import {
  DEFAULT_SNAP_CONFIG,
  calculateElementDimensions,
  getAllSnapTargets,
  findActiveSnaps,
  calculateSnapPosition,
} from '../utils/snapUtils';

export interface UseSnappingOptions {
  config?: Partial<SnapConfiguration>;
  elementId?: string; // ID of the element being dragged
}

export interface UseSnappingReturn {
  snapState: SnapState;
  startSnapping: (elementId: string, initialPosition: { x: number; y: number }) => void;
  updateDrag: (position: { x: number; y: number }) => void;
  finalizeDrag: () => { x: number; y: number } | null;
  stopSnapping: () => void;
  isSnapping: boolean;
  activeSnapTargets: ActiveSnap[];
  config: SnapConfiguration;
}

export const useSnapping = (options: UseSnappingOptions = {}): UseSnappingReturn => {
  // Merge with default configuration
  const config: SnapConfiguration = useMemo(() => ({
    ...DEFAULT_SNAP_CONFIG,
    ...options.config,
  }), [options.config]);

  // Snapping state
  const [snapState, setSnapState] = useState<SnapState>({
    isActive: false,
    activeSnaps: [],
    dragPosition: undefined,
    elementDimensions: undefined,
  });

  // Get all available snap targets (memoized to avoid recalculation)
  const snapTargets = useMemo(() => 
    getAllSnapTargets(config), 
    [config]
  );

  /**
   * Start snapping session for an element
   */
  const startSnapping = useCallback((elementId: string, initialPosition: { x: number; y: number }) => {
    if (!config.enabled) return;

    // Get the DOM element to calculate dimensions
    const domElement = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
    
    let elementDimensions: ElementDimensions;
    
    if (domElement) {
      elementDimensions = calculateElementDimensions(domElement, initialPosition);
    } else {
      // Fallback if element not found
      elementDimensions = {
        width: 100,
        height: 40,
        centerX: initialPosition.x,
        centerY: initialPosition.y,
        left: initialPosition.x - 50,
        top: initialPosition.y - 20,
        right: initialPosition.x + 50,
        bottom: initialPosition.y + 20,
      };
    }

    setSnapState({
      isActive: true,
      activeSnaps: [],
      dragPosition: initialPosition,
      elementDimensions,
    });
  }, [config.enabled]);

  /**
   * Update drag position and recalculate active snaps
   */
  const updateDrag = useCallback((position: { x: number; y: number }) => {
    if (!snapState.isActive || !snapState.elementDimensions) return;

    // Update element dimensions with new position
    const updatedDimensions: ElementDimensions = {
      ...snapState.elementDimensions,
      centerX: position.x,
      centerY: position.y,
      left: position.x - snapState.elementDimensions.width / 2,
      top: position.y - snapState.elementDimensions.height / 2,
      right: position.x + snapState.elementDimensions.width / 2,
      bottom: position.y + snapState.elementDimensions.height / 2,
    };

    // Find active snaps for current position
    const activeSnaps = findActiveSnaps(updatedDimensions, snapTargets);

    setSnapState(prevState => ({
      ...prevState,
      dragPosition: position,
      elementDimensions: updatedDimensions,
      activeSnaps,
    }));
  }, [snapState.isActive, snapState.elementDimensions, snapTargets]);

  /**
   * Finalize drag and return final snapped position
   */
  const finalizeDrag = useCallback((): { x: number; y: number } | null => {
    if (!snapState.isActive || !snapState.dragPosition || snapState.activeSnaps.length === 0) {
      return null;
    }

    // Calculate final snapped position
    const finalPosition = calculateSnapPosition(
      snapState.dragPosition,
      snapState.activeSnaps,
      config.snapThreshold
    );

    // Check if position actually changed (i.e., snapping occurred)
    const hasSnapped = (
      finalPosition.x !== snapState.dragPosition.x ||
      finalPosition.y !== snapState.dragPosition.y
    );

    return hasSnapped ? finalPosition : null;
  }, [snapState.isActive, snapState.dragPosition, snapState.activeSnaps, config.snapThreshold]);

  /**
   * Stop snapping session
   */
  const stopSnapping = useCallback(() => {
    setSnapState({
      isActive: false,
      activeSnaps: [],
      dragPosition: undefined,
      elementDimensions: undefined,
    });
  }, []);

  return {
    snapState,
    startSnapping,
    updateDrag,
    finalizeDrag,
    stopSnapping,
    isSnapping: snapState.isActive,
    activeSnapTargets: snapState.activeSnaps,
    config,
  };
};