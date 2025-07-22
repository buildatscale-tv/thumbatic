import React from 'react';
import { ThumbnailGenerator } from './components/ThumbnailGenerator';
import { useThumbnailStore } from './store/thumbnailStore';
import { useSnapping } from './hooks/useSnapping';
import type { ActiveSnap } from './types/snapping';
import './styles/thumbnail.css';

function App() {
  // Get text elements for text-edge snapping using a stable reference
  const allElements = useThumbnailStore(state => state.elements);
  const textElements = React.useMemo(
    () => allElements.filter(el => el.type === 'text'),
    [allElements]
  );

  // Initialize snapping system
  const snapping = useSnapping({
    config: {
      enabled: true,
      proximityThreshold: 200, // Default for text edges
      snapThreshold: 100,
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
        proximityThreshold: 50, // Text edges appear at 50px
      },
      textElementCenters: {
        enabled: true,
        horizontal: true,
        vertical: true,
        proximityThreshold: 20, // Text centers appear at 20px (higher priority)
      },
    },
    textElements,
  });

  // State for active dragging element and position
  const [dragState, setDragState] = React.useState<{
    activeId: string | null;
    position?: { x: number; y: number };
    activeSnaps: ActiveSnap[];
  }>({ activeId: null, activeSnaps: [] });

  // Drag callbacks to be passed to draggable elements
  const dragCallbacks = {
    onDragStart: (elementId: string, position: { x: number; y: number }) => {
      const currentElement = useThumbnailStore.getState().elements.find(el => el.id === elementId);

      if (currentElement) {
        // Start snapping session for all element types
        snapping.startSnapping(elementId, position);

        setDragState({
          activeId: elementId,
          position: position,
          activeSnaps: []
        });
      }
    },

    onDragMove: (elementId: string, position: { x: number; y: number }) => {
      const currentElement = useThumbnailStore.getState().elements.find(el => el.id === elementId);

      if (currentElement) {
        // Update position in store immediately for visual feedback
        useThumbnailStore.getState().updateElementPosition(elementId, position);

        // Update snapping system for all element types
        if (snapping.isSnapping) {
          snapping.updateDrag(position);
        }

        setDragState(prev => ({
          ...prev,
          position: position,
          activeSnaps: snapping.activeSnapTargets
        }));
      }
    },

    onDragEnd: (elementId: string) => {
      const currentElement = useThumbnailStore.getState().elements.find(el => el.id === elementId);

      if (currentElement && snapping.isSnapping) {
        // Try to get snapped position from snapping system for all element types
        const snappedPosition = snapping.finalizeDrag();

        if (snappedPosition) {
          // Snapping occurred - use snapped position
          useThumbnailStore.getState().updateElementPosition(elementId, snappedPosition);
        }
        // If no snapping, position is already updated from onDragMove
      }

      // Clean up snapping session and reset drag state
      snapping.stopSnapping();
      setDragState({ activeId: null, activeSnaps: [] });
    }
  };

  return (
    <div className="thumbnail-generator">
      <ThumbnailGenerator
        dragState={{
          isDragging: !!dragState.activeId,
          position: dragState.position,
          activeSnaps: dragState.activeSnaps
        }}
        dragCallbacks={dragCallbacks}
        snapThreshold={snapping.config.snapThreshold}
      />
    </div>
  );
}

export default App;
