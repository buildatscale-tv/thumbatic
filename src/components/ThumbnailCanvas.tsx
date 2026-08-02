import React, { useState } from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { toCanvasPoint } from '../utils/canvasCoords';
import { TextElements } from './thumbnail/TextElements';
import { LogoElements } from './thumbnail/LogoElements';
import { ArrowElements } from './thumbnail/ArrowElements';
import { ArrowHandles } from './thumbnail/ArrowHandles';
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
  const {
    theme,
    selectElement,
    setEditingElementId,
    showGridGuides,
    snappingEnabled,
    isDrawingArrow,
    arrowDrawStart,
    setArrowDrawStart,
    addArrowElement,
    setDrawingArrow,
    selectedElement,
  } = useThumbnailStore();

  const [arrowPreview, setArrowPreview] = useState<{ x: number; y: number } | null>(null);

  const themeClass = `${theme}-theme`;

  const handleThumbnailClick = (event: React.MouseEvent) => {
    // Don't clear selection if in drawing mode
    if (isDrawingArrow) return;

    // Only clear selection if clicking directly on the thumbnail background
    if (event.target === event.currentTarget ||
        (event.target as HTMLElement).classList.contains('thumbnail-content')) {
      selectElement(null);
      setEditingElementId(null); // Also clear editing state to remove cursor
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isDrawingArrow) return;

    setArrowDrawStart(toCanvasPoint(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingArrow || !arrowDrawStart) return;

    setArrowPreview(toCanvasPoint(e.clientX, e.clientY));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawingArrow || !arrowDrawStart) return;

    const { x, y } = toCanvasPoint(e.clientX, e.clientY);

    // Minimum distance to create arrow (20px)
    const dist = Math.hypot(x - arrowDrawStart.x, y - arrowDrawStart.y);
    if (dist > 20) {
      addArrowElement(arrowDrawStart, { x, y });
    }

    setArrowDrawStart(null);
    setArrowPreview(null);
  };

  // Handle ESC key to cancel drawing mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawingArrow) {
        setDrawingArrow(false);
        setArrowDrawStart(null);
        setArrowPreview(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawingArrow, setDrawingArrow, setArrowDrawStart]);

  return (
    <div
      id="thumbnail"
      className={`thumbnail ${themeClass} ${isDrawingArrow ? 'drawing-mode' : ''}`.trim()}
      onClick={handleThumbnailClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'relative',
        width: '1280px',
        height: '720px',
        overflow: 'visible',
        cursor: isDrawingArrow ? 'crosshair' : 'default',
      }}
    >
      <div className="thumbnail-content" onClick={handleThumbnailClick}>
        <LogoElements dragCallbacks={dragCallbacks} />
        <TextElements dragCallbacks={dragCallbacks} />
        <AccentShapes />
        <ArrowElements dragCallbacks={dragCallbacks} />
      </div>

      {/* Arrow preview while drawing */}
      {arrowDrawStart && arrowPreview && (
        <svg
          className="arrow-preview"
          width="1280"
          height="720"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 8000,
          }}
        >
          <line
            x1={arrowDrawStart.x}
            y1={arrowDrawStart.y}
            x2={arrowPreview.x}
            y2={arrowPreview.y}
            stroke="#FF0000"
            strokeWidth={24}
            strokeLinecap="round"
            opacity={0.7}
          />
        </svg>
      )}

      {/* Show handles for selected arrow */}
      {selectedElement?.type === 'arrow' && !isDrawingArrow && (
        <ArrowHandles element={selectedElement} />
      )}

      <AlignmentGuides
        activeSnaps={dragState?.activeSnaps || []}
        isVisible={(dragState?.isDragging && snappingEnabled) || false}
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
