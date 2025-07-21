import React from 'react';
import { SlideGenerator } from './components/SlideGenerator';
import { useSlideStore } from './store/slideStore';
import { useSnapping } from './hooks/useSnapping';
import type { ActiveSnap } from './types/snapping';
import './styles/slide.css';

function App() {
  // Initialize snapping system
  const snapping = useSnapping({
    config: {
      enabled: true,
      proximityThreshold: 100,
      snapThreshold: 50,
      showGuides: true,
      canvasCenter: {
        enabled: true,
        vertical: true,
        horizontal: true,
      },
    },
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
      const currentElement = useSlideStore.getState().elements.find(el => el.id === elementId);
      
      if (currentElement) {
        // Start snapping session for text elements only
        if (currentElement.type === 'text') {
          snapping.startSnapping(elementId, position);
        }
        
        setDragState({ 
          activeId: elementId,
          position: position,
          activeSnaps: []
        });
      }
    },

    onDragMove: (elementId: string, position: { x: number; y: number }) => {
      const currentElement = useSlideStore.getState().elements.find(el => el.id === elementId);
      
      if (currentElement) {
        // Update position in store immediately for visual feedback
        useSlideStore.getState().updateElementPosition(elementId, position);
        
        // Update snapping system for text elements
        if (currentElement.type === 'text' && snapping.isSnapping) {
          snapping.updateDrag(position);
        }
        
        setDragState(prev => ({
          ...prev,
          position: position,
          activeSnaps: currentElement.type === 'text' ? snapping.activeSnapTargets : []
        }));
      }
    },

    onDragEnd: (elementId: string, _position: { x: number; y: number }) => {
      const currentElement = useSlideStore.getState().elements.find(el => el.id === elementId);
      
      if (currentElement) {
        if (currentElement.type === 'text' && snapping.isSnapping) {
          // Try to get snapped position from snapping system
          const snappedPosition = snapping.finalizeDrag();
          
          if (snappedPosition) {
            // Snapping occurred - use snapped position
            useSlideStore.getState().updateElementPosition(elementId, snappedPosition);
          }
          // If no snapping, position is already updated from onDragMove
        }
        // For non-text elements, position is already updated from onDragMove
      }
      
      // Clean up snapping session and reset drag state
      snapping.stopSnapping();
      setDragState({ activeId: null, activeSnaps: [] });
    }
  };

  return (
    <div className="slide-generator">
      <SlideGenerator 
        dragState={{
          isDragging: !!dragState.activeId,
          position: dragState.position,
          activeSnaps: dragState.activeSnaps
        }}
        dragCallbacks={dragCallbacks}
      />
    </div>
  );
}

export default App;
