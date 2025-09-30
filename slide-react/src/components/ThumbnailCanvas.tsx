import React from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { TextElements } from './thumbnail/TextElements';
import { LogoElements } from './thumbnail/LogoElements';
import { IconElements } from './thumbnail/IconElements';
import { AccentShapes } from './thumbnail/AccentShapes';
import { AlignmentGuides } from './thumbnail/AlignmentGuides';
import { GridOverlay } from './GridOverlay';
import type { ActiveSnap } from '../types/snapping';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

interface ThumbnailCanvasProps {
  dragState?: {
    isDragging: boolean;
    position?: { x: number; y: number };
    activeSnaps: ActiveSnap[];
    gridSnapPoint?: { x: number; y: number } | null;
  };
  dragCallbacks: DragCallbacks;
  snapThreshold?: number;
}

export const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({ dragState, dragCallbacks, snapThreshold = 100 }) => {
  const { theme, selectElement, setEditingElementId, showGridGuides } = useThumbnailStore();

  const themeClass = `${theme}-theme`;

  const handleThumbnailClick = (event: React.MouseEvent) => {
    // Only clear selection if clicking directly on the thumbnail background
    if (event.target === event.currentTarget ||
        (event.target as HTMLElement).classList.contains('thumbnail-content')) {
      selectElement(null);
      setEditingElementId(null); // Also clear editing state to remove cursor
    }
  };

  return (
    <div
      id="thumbnail"
      className={`thumbnail ${themeClass}`.trim()}
      onClick={handleThumbnailClick}
      style={{
        position: 'relative',
        width: '1280px',
        height: '720px',
        overflow: 'visible'
      }}
    >
      <div className="thumbnail-content" onClick={handleThumbnailClick}>
        <LogoElements dragCallbacks={dragCallbacks} />
        <TextElements dragCallbacks={dragCallbacks} />
        <AccentShapes />
        <IconElements dragCallbacks={dragCallbacks} />
      </div>
      <AlignmentGuides
        activeSnaps={dragState?.activeSnaps || []}
        isVisible={dragState?.isDragging || false}
        dragPosition={dragState?.position}
        snapThreshold={snapThreshold}
      />
      <GridOverlay
        isVisible={showGridGuides}
        activeSnapPoint={showGridGuides && dragState?.isDragging ? dragState?.gridSnapPoint : null}
      />
    </div>
  );
};
