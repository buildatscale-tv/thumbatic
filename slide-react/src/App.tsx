import React from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
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

  // State for active dragging element
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    if (!active || !over) return;

    // Only update position if dropped in the slide canvas
    if (over.id === 'slide-canvas') {
      // Find the dragged element
      const elementId = active.id.toString();
      const currentElement = useSlideStore.getState().elements.find(el => el.id === elementId);
      
      if (currentElement) {
        // Update position by adding delta directly (no scaling needed)
        updateElementPosition(elementId, {
          x: currentElement.position.x + delta.x,
          y: currentElement.position.y + delta.y
        });
      }
    }
    
    // Reset active element
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="slide-generator">
        <SlideGenerator />
      </div>
    </DndContext>
  );
}

export default App;
