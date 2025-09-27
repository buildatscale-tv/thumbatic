import React from 'react';
import { ThumbnailGenerator } from './components/ThumbnailGenerator';
import { useThumbnailStore } from './store/thumbnailStore';
import { useSnapping } from './hooks/useSnapping';
import type { ActiveSnap } from './types/snapping';
import './styles/thumbnail.css';

function App() {
  // Get text elements for text-edge snapping using a stable reference
  const allElements = useThumbnailStore(state => state.elements);
  const selectedElement = useThumbnailStore(state => state.selectedElement);
  const updateElementPosition = useThumbnailStore(state => state.updateElementPosition);
  const updateElementZIndex = useThumbnailStore(state => state.updateElementZIndex);

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

  // Keyboard controls for element movement
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedElement) return;

      // Only handle arrow keys
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
      }

      // Don't handle keyboard shortcuts if focus is on a text input
      if (document.activeElement &&
          (document.activeElement.tagName === 'INPUT' ||
           document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      event.preventDefault();

      console.log('⌨️ Key pressed:', {
        key: event.key,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        elementZIndex: selectedElement.zIndex
      });

      // Handle Alt+Arrow for z-index changes
      if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        console.log('🎯 Alt+Arrow detected!', { key: event.key, altKey: event.altKey, currentZIndex: selectedElement.zIndex });
        const currentZIndex = selectedElement.zIndex ?? 100; // Default to 100 if no z-index (use nullish coalescing to allow 0)
        const zIndexChange = event.shiftKey ? 500 : 100; // Shift+Alt for larger jumps

        let newZIndex;
        if (event.key === 'ArrowUp') {
          newZIndex = currentZIndex + zIndexChange; // Move forward (higher z-index)
        } else {
          newZIndex = Math.max(-9000, currentZIndex - zIndexChange); // Move backward (lower z-index, minimum -9000 to stay above background)
        }

        console.log('🚀 Updating z-index:', { from: currentZIndex, to: newZIndex, elementId: selectedElement.id });
        updateElementZIndex(selectedElement.id, newZIndex);
        return;
      }

      // Handle regular movement (only if Alt is not pressed)
      if (event.altKey) return;

      // Determine movement amount based on modifiers
      let moveAmount = 1; // Default 1px
      if (event.shiftKey && (event.metaKey || event.ctrlKey)) {
        moveAmount = 50; // Cmd/Ctrl + Shift = 50px
      } else if (event.shiftKey) {
        moveAmount = 10; // Shift = 10px
      }

      // Calculate new position
      const currentPos = selectedElement.position;
      const newPos = { ...currentPos };

      switch (event.key) {
        case 'ArrowUp':
          newPos.y = Math.max(0, currentPos.y - moveAmount);
          break;
        case 'ArrowDown':
          newPos.y = Math.min(720, currentPos.y + moveAmount);
          break;
        case 'ArrowLeft':
          newPos.x = Math.max(0, currentPos.x - moveAmount);
          break;
        case 'ArrowRight':
          newPos.x = Math.min(1280, currentPos.x + moveAmount);
          break;
      }

      // Update element position
      updateElementPosition(selectedElement.id, newPos);
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, updateElementPosition, updateElementZIndex]);

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

    onDragEnd: (elementId: string, finalPosition: { x: number; y: number }) => {
      const currentElement = useThumbnailStore.getState().elements.find(el => el.id === elementId);

      if (currentElement && snapping.isSnapping) {
        // Try to get snapped position from snapping system for all element types
        const snappedPosition = snapping.finalizeDrag();

        if (snappedPosition) {
          // Snapping occurred - use snapped position
          useThumbnailStore.getState().updateElementPosition(elementId, snappedPosition);
        } else {
          // No snapping - use the final constrained position from DraggableElement
          useThumbnailStore.getState().updateElementPosition(elementId, finalPosition);
        }
      } else {
        // No snapping active - use the final constrained position from DraggableElement
        useThumbnailStore.getState().updateElementPosition(elementId, finalPosition);
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
