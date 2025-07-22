import React, { useState, useRef, useCallback } from 'react';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

interface DraggableElementProps {
  id: string;
  position: { x: number; y: number };
  children: React.ReactNode;
  dragCallbacks: DragCallbacks;
  className?: string;
  style?: React.CSSProperties;
}

// Helper function to convert center coordinates to top-left coordinates
const centerToTopLeft = (centerPos: { x: number; y: number }, element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  return {
    x: centerPos.x - rect.width / 2,
    y: centerPos.y - rect.height / 2,
  };
};


export function DraggableElement({
  id,
  position,
  children,
  dragCallbacks,
  className = '',
  style = {}
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCenterPosition, setInitialCenterPosition] = useState({ x: 0, y: 0 });
  const [topLeftPosition, setTopLeftPosition] = useState({ x: 0, y: 0 });
  const currentPositionRef = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Update positioning after element is mounted and when position changes
  React.useLayoutEffect(() => {
    if (elementRef.current) {
      const newTopLeft = centerToTopLeft(position, elementRef.current);
      setTopLeftPosition(newTopLeft);
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCenterPosition(position); // position is stored as center coordinates

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

    // Constrain center position to keep element fully within canvas bounds
    const constrainedCenterPosition = {
      x: Math.max(elementWidth / 2, Math.min(1280 - elementWidth / 2, newCenterPosition.x)),
      y: Math.max(elementHeight / 2, Math.min(720 - elementHeight / 2, newCenterPosition.y)),
    };

    // Store current position for use in handleMouseUp
    currentPositionRef.current = constrainedCenterPosition;

    dragCallbacks.onDragMove(id, constrainedCenterPosition);
  }, [isDragging, dragStart.x, dragStart.y, initialCenterPosition.x, initialCenterPosition.y, dragCallbacks, id]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // Use the last position from mousemove
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

  const combinedStyle: React.CSSProperties = {
    position: 'absolute',
    left: topLeftPosition.x,
    top: topLeftPosition.y,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: isDragging ? 1000 : 'auto',
    ...style,
  };

  const combinedClassName = `${className} ${isDragging ? 'dragging' : ''}`.trim();

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
