import React, { useState, useRef, useCallback } from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

interface DraggableElementProps {
  id: string;
  position: { x: number; y: number };
  zIndex?: number;
  children: React.ReactNode;
  dragCallbacks: DragCallbacks;
  className?: string;
  style?: React.CSSProperties;
  alignment?: { horizontal?: 'left' | 'center' | 'right', vertical?: 'top' | 'middle' | 'bottom' };
}

// Helper function to convert center coordinates to top-left coordinates
const centerToTopLeft = (centerPos: { x: number; y: number }, element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();

  // Guard against invalid element dimensions
  if (rect.width === 0 || rect.height === 0) {
    // Return a fallback position if element not properly rendered
    return { x: centerPos.x - 50, y: centerPos.y - 25 }; // Assume 100x50 as fallback
  }

  return {
    x: centerPos.x - rect.width / 2,
    y: centerPos.y - rect.height / 2,
  };
};


export function DraggableElement({
  id,
  position,
  zIndex,
  children,
  dragCallbacks,
  className = '',
  style = {},
  alignment
}: DraggableElementProps) {
  const { updateElementPosition, selectElement, selectedElement } = useThumbnailStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCenterPosition, setInitialCenterPosition] = useState({ x: 0, y: 0 });
  const [topLeftPosition, setTopLeftPosition] = useState({ x: 0, y: 0 });
  const currentPositionRef = useRef(position);
  const elementRef = useRef<HTMLDivElement>(null);
  const previousAlignment = useRef(alignment);

  // Calculate aligned position using actual element dimensions
  const calculateAlignedPosition = React.useCallback(() => {
    if (!elementRef.current || !alignment) return position;

    const rect = elementRef.current.getBoundingClientRect();

    // Guard against invalid rect dimensions that could corrupt position
    if (rect.width === 0 || rect.height === 0) {
      console.log('⚠️  Invalid rect dimensions, skipping alignment:', { id, rect, position });
      return position; // Return current position if element not properly rendered
    }

    const canvasWidth = 1280;
    const canvasHeight = 720;

    // Check for drop shadow offset
    let dropShadowOffset = { x: 0, y: 0 };
    if (elementRef.current.classList.contains('bg-style-drop-shadow')) {
      dropShadowOffset = { x: 8, y: 8 };
    }

    const newPosition = { ...position };

    if (alignment.horizontal) {
      switch (alignment.horizontal) {
        case 'left':
          // Account for drop shadow extending to the left
          newPosition.x = rect.width / 2 + dropShadowOffset.x;
          break;
        case 'right':
          // Right edge should be at canvas width (no drop shadow on right)
          newPosition.x = canvasWidth - rect.width / 2;
          break;
        case 'center':
          newPosition.x = canvasWidth / 2;
          break;
      }
    }

    if (alignment.vertical) {
      switch (alignment.vertical) {
        case 'top':
          // Top edge should be at 0 (no drop shadow on top)
          newPosition.y = rect.height / 2;
          break;
        case 'bottom':
          // Account for drop shadow extending below
          newPosition.y = canvasHeight - rect.height / 2 - dropShadowOffset.y;
          break;
        case 'middle':
          newPosition.y = canvasHeight / 2;
          break;
      }
    }

    // Guard against invalid calculated positions
    if (newPosition.x < 0 || newPosition.y < 0 || isNaN(newPosition.x) || isNaN(newPosition.y)) {
      return position; // Return current position if calculation results in invalid values
    }

    return newPosition;
  }, [alignment, position]);

  // Update position when alignment changes
  React.useLayoutEffect(() => {
    // Only track alignment changes after initial render
    const isInitialRender = previousAlignment.current === undefined;
    const alignmentChanged = JSON.stringify(alignment) !== JSON.stringify(previousAlignment.current);

    // Always update the previous alignment reference
    previousAlignment.current = alignment;

    // Skip alignment calculation on initial render to prevent timing issues
    if (isInitialRender || !elementRef.current || !alignment || !alignmentChanged) {
      return;
    }

    // Wait for next frame to ensure element is fully rendered
    requestAnimationFrame(() => {
      if (!elementRef.current) return;

      console.log('🔄 Alignment effect running for:', { id, currentPosition: position, alignment });
      const alignedPosition = calculateAlignedPosition();
      console.log('📐 Calculated aligned position:', { id, alignedPosition, originalPosition: position });

      // Additional guard: only update if the aligned position is significantly different and valid
      const positionDifference = Math.abs(alignedPosition.x - position.x) + Math.abs(alignedPosition.y - position.y);
      if (positionDifference > 1 && alignedPosition.x > 0 && alignedPosition.y > 0) {
        console.log('⚡ Updating element position via alignment:', { id, from: position, to: alignedPosition });
        // Use updateElementPosition directly to avoid triggering drag callbacks
        updateElementPosition(id, alignedPosition);
      } else {
        console.log('⏭️  Skipping alignment update:', { id, positionDifference, alignedPosition });
      }
    });
  }, [alignment, calculateAlignedPosition, id, updateElementPosition]);

  // Update positioning after element is mounted and when position changes
  React.useLayoutEffect(() => {
    if (elementRef.current) {
      const newTopLeft = centerToTopLeft(position, elementRef.current);
      setTopLeftPosition(newTopLeft);
    }

    // CRITICAL: Keep currentPositionRef in sync with actual position
    currentPositionRef.current = position;
  }, [position]);


  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCenterPosition(position); // position is stored as center coordinates

    // CRITICAL: Update currentPositionRef to current position to prevent corruption
    currentPositionRef.current = position;

    // Prevent text selection while dragging
    e.preventDefault();

    // Call the drag start callback with center coordinates
    dragCallbacks.onDragStart(id, position);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Get current element dimensions to calculate proper constraints
    const element = elementRef.current;
    let elementWidth = 100; // fallback
    let elementHeight = 50; // fallback

    if (element) {
      const rect = element.getBoundingClientRect();
      elementWidth = rect.width;
      elementHeight = rect.height;
    }

    // Calculate new center position from drag delta
    const newCenterPosition = {
      x: initialCenterPosition.x + deltaX,
      y: initialCenterPosition.y + deltaY,
    };

    // Determine element type from id to apply different constraints
    const isLogoOrIcon = id.startsWith('logo-') || id.startsWith('icon-');
    const isTextElement = id.startsWith('text-');

    // For logos and icons, allow 50px protrusion off canvas
    // For text elements, account for drop shadow if present
    let protrusionAllowance = 0;
    let dropShadowOffset = { x: 0, y: 0 };

    if (isLogoOrIcon) {
      protrusionAllowance = 50;
    } else if (isTextElement) {
      // Check if element has drop shadow by looking at class names
      const element = elementRef.current;
      if (element && element.classList.contains('bg-style-drop-shadow')) {
        // Drop shadow extends 8px left and 8px down
        dropShadowOffset = { x: 8, y: 8 };
      }
    }

    const constrainedCenterPosition = {
      x: Math.max(
        elementWidth / 2 + dropShadowOffset.x - protrusionAllowance,
        Math.min(
          1280 - elementWidth / 2 + protrusionAllowance, // Right edge: no shadow offset needed
          newCenterPosition.x
        )
      ),
      y: Math.max(
        elementHeight / 2 - protrusionAllowance, // Top edge: no shadow offset needed
        Math.min(
          720 - elementHeight / 2 - dropShadowOffset.y + protrusionAllowance, // Bottom edge: account for shadow
          newCenterPosition.y
        )
      ),
    };

    // Store current position for use in handleMouseUp
    currentPositionRef.current = constrainedCenterPosition;

    dragCallbacks.onDragMove(id, constrainedCenterPosition);
  }, [isDragging, dragStart.x, dragStart.y, initialCenterPosition.x, initialCenterPosition.y, dragCallbacks, id]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // Use the last constrained position from mousemove
      dragCallbacks.onDragEnd(id, currentPositionRef.current);
    }
  }, [isDragging, dragCallbacks, id]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isSelected = selectedElement?.id === id;

  const combinedStyle: React.CSSProperties = {
    position: 'absolute',
    left: topLeftPosition.x,
    top: topLeftPosition.y,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: isDragging ? 10000 : (zIndex || 0), // Use element's zIndex, dragging elements go to 10000
    outline: isSelected ? '2px solid #007acc' : 'none',
    outlineOffset: '2px',
    ...style,
  };

  const combinedClassName = `${className} ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`.trim();

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      className={combinedClassName}
      style={combinedStyle}
      data-element-id={id}
    >
      {children}
    </div>
  );
}
