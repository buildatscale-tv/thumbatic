import React from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useSlideStore } from '../store/slideStore';
import { TextElements } from './slide/TextElements';
import { LogoElements } from './slide/LogoElements';
import { IconElements } from './slide/IconElements';
import { AccentShapes } from './slide/AccentShapes';

export const SlideCanvas: React.FC = () => {
  const { theme, cornerStyle, selectElement, updateElementPosition } = useSlideStore();

  const themeClass = `${theme}-theme`;
  const cornerClass = cornerStyle === 'sharp' ? 'sharp-corners' : '';

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start dragging
      },
    })
  );

  const handleSlideClick = (event: React.MouseEvent) => {
    // Only clear selection if clicking directly on the slide background
    if (event.target === event.currentTarget || 
        (event.target as HTMLElement).classList.contains('slide-content')) {
      selectElement(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (!active || !delta) return;

    const elementId = active.id as string;
    
    // Get slide dimensions for percentage calculation
    const slideRect = document.getElementById('slide')?.getBoundingClientRect();
    if (!slideRect) return;

    // Convert delta to percentage
    const deltaXPercent = (delta.x / slideRect.width) * 100;
    const deltaYPercent = (delta.y / slideRect.height) * 100;

    // Update element position in store
    const currentElement = active.data.current;
    if (currentElement) {
      const newX = Math.max(5, Math.min(95, currentElement.position.x + deltaXPercent));
      const newY = Math.max(5, Math.min(95, currentElement.position.y + deltaYPercent));
      
      updateElementPosition(elementId, { x: newX, y: newY });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div 
        id="slide"
        className={`slide ${themeClass} ${cornerClass}`.trim()}
        onClick={handleSlideClick}
      >
        <div className="slide-content" onClick={handleSlideClick}>
          <LogoElements />
          <TextElements />
          <AccentShapes />
          <IconElements />
        </div>
      </div>
    </DndContext>
  );
};