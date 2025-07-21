import React from 'react';
import { useSlideStore } from '../store/slideStore';
import { TextElements } from './slide/TextElements';
import { LogoElements } from './slide/LogoElements';
import { IconElements } from './slide/IconElements';
import { AccentShapes } from './slide/AccentShapes';
import { DroppableArea } from './slide/DroppableArea';
import { GridOverlay } from './slide/GridOverlay';

interface SlideCanvasProps {
  dragState?: {
    isDragging: boolean;
    position?: { x: number; y: number };
  };
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({ dragState }) => {
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
    >
      <DroppableArea id="slide-canvas" />
      <GridOverlay 
        isDragging={dragState?.isDragging || false}
        dragPosition={dragState?.position}
      />
      <div className="slide-content" onClick={handleSlideClick}>
        <LogoElements />
        <TextElements />
        <AccentShapes />
        <IconElements />
      </div>
    </div>
  );
};