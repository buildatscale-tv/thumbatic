import React from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SlideGenerator } from './components/SlideGenerator';
import { useSlideStore } from './store/slideStore';
import './styles/slide.css';

function App() {
  const { updateElementPosition } = useSlideStore();

  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // State for active dragging element and position
  const [dragState, setDragState] = React.useState<{
    activeId: string | null;
    position?: { x: number; y: number };
  }>({ activeId: null });

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const currentElement = useSlideStore.getState().elements.find(el => el.id === active.id);
    
    setDragState({ 
      activeId: active.id as string,
      position: currentElement?.position
    });
  };

  // Handle drag move to update position for grid preview
  const handleDragMove = (event: DragMoveEvent) => {
    const { active, delta } = event;
    const currentElement = useSlideStore.getState().elements.find(el => el.id === active.id);
    
    if (currentElement) {
      // Calculate where the element center will be after this drag
      const newCenterPosition = {
        x: currentElement.position.x + delta.x,
        y: currentElement.position.y + delta.y
      };
      
      setDragState(prev => ({
        ...prev,
        position: newCenterPosition
      }));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    if (!active || !over) {
      setDragState({ activeId: null });
      return;
    }

    // Only update position if dropped in the slide canvas
    if (over.id === 'slide-canvas') {
      const elementId = active.id.toString();
      const currentElement = useSlideStore.getState().elements.find(el => el.id === elementId);
      
      if (currentElement && currentElement.type === 'text') {
        // Get the DOM element to measure its actual dimensions
        const domElement = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
        
        if (domElement) {
          console.log('=== GRID SNAP CALCULATION ===');
          
          // Step 1: Get element's actual dimensions
          const rect = domElement.getBoundingClientRect();
          const elementWidth = rect.width;
          const elementHeight = rect.height;
          console.log('Element dimensions:', { width: elementWidth, height: elementHeight });
          
          // Step 2: Calculate where the user dragged the element's center to
          // The current position represents where the center currently is (due to translate(-50%, -50%))
          const draggedCenterX = currentElement.position.x + delta.x;
          const draggedCenterY = currentElement.position.y + delta.y;
          console.log('User dragged center to:', { x: draggedCenterX, y: draggedCenterY });
          
          // Step 3: Find the nearest grid intersection to this center point
          const { gridCols, gridRows } = useSlideStore.getState();
          const cellWidth = 1280 / gridCols;
          const cellHeight = 720 / gridRows;
          
          const nearestGridX = Math.round(draggedCenterX / cellWidth);
          const nearestGridY = Math.round(draggedCenterY / cellHeight);
          
          // Clamp to valid grid bounds
          const clampedGridX = Math.max(0, Math.min(gridCols, nearestGridX));
          const clampedGridY = Math.max(0, Math.min(gridRows, nearestGridY));
          
          // Step 4: Calculate the exact pixel coordinates of this grid intersection
          const intersectionX = clampedGridX * cellWidth;
          const intersectionY = clampedGridY * cellHeight;
          console.log('Target grid intersection:', { x: intersectionX, y: intersectionY });
          
          // Step 5: Position the element so its CENTER aligns with this intersection
          // Since we use transform: translate(-50%, -50%), setting position to the intersection
          // coordinates will center the element there
          updateElementPosition(elementId, {
            x: intersectionX,
            y: intersectionY
          });
          
          console.log('Positioned element center at intersection:', { x: intersectionX, y: intersectionY });
        } else {
          // Fallback: no snapping if we can't measure the element
          updateElementPosition(elementId, {
            x: currentElement.position.x + delta.x,
            y: currentElement.position.y + delta.y
          });
        }
      } else if (currentElement) {
        // For non-text elements, use the existing logic
        updateElementPosition(elementId, {
          x: currentElement.position.x + delta.x,
          y: currentElement.position.y + delta.y
        });
      }
    }
    
    // Reset drag state
    setDragState({ activeId: null });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="slide-generator">
        <SlideGenerator 
          dragState={{
            isDragging: !!dragState.activeId,
            position: dragState.position
          }}
        />
      </div>
    </DndContext>
  );
}

export default App;
