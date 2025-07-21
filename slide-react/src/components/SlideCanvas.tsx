import React from 'react';
import { useSlideStore } from '../store/slideStore';
import { TextElements } from './slide/TextElements';
import { LogoElements } from './slide/LogoElements';
import { IconElements } from './slide/IconElements';
import { AccentShapes } from './slide/AccentShapes';
import { AlignmentGuides } from './slide/AlignmentGuides';
import type { ActiveSnap } from '../types/snapping';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

interface SlideCanvasProps {
  dragState?: {
    isDragging: boolean;
    position?: { x: number; y: number };
    activeSnaps: ActiveSnap[];
  };
  dragCallbacks: DragCallbacks;
  snapThreshold?: number;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({ dragState, dragCallbacks, snapThreshold = 100 }) => {
  const { theme, cornerStyle, selectElement } = useSlideStore();

  const themeClass = `${theme}-theme`;
  const cornerClass = cornerStyle === 'sharp' ? 'sharp-corners' : '';

  const handleSlideClick = (event: React.MouseEvent) => {
    // Only clear selection if clicking directly on the slide background
    if (event.target === event.currentTarget || 
        (event.target as HTMLElement).classList.contains('slide-content')) {
      selectElement(null);
    }
  };

  return (
    <div 
      id="slide"
      className={`slide ${themeClass} ${cornerClass}`.trim()}
      onClick={handleSlideClick}
      style={{ 
        position: 'relative',
        width: '1280px',
        height: '720px',
        overflow: 'visible'
      }}
    >
      <AlignmentGuides 
        activeSnaps={dragState?.activeSnaps || []}
        isVisible={dragState?.isDragging || false}
        dragPosition={dragState?.position}
        snapThreshold={snapThreshold}
      />
      <div className="slide-content" onClick={handleSlideClick}>
        <LogoElements dragCallbacks={dragCallbacks} />
        <TextElements dragCallbacks={dragCallbacks} />
        <AccentShapes />
        <IconElements dragCallbacks={dragCallbacks} />
      </div>
    </div>
  );
};