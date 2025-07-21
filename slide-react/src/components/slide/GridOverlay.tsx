import React from 'react';
import { useSlideStore } from '../../store/slideStore';

interface GridOverlayProps {
  isDragging?: boolean;
  dragPosition?: { x: number; y: number };
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ isDragging, dragPosition }) => {
  const { gridRows, gridCols, showGrid } = useSlideStore();

  if (!showGrid && !isDragging) return null;

  const cellWidth = 1280 / gridCols;
  const cellHeight = 720 / gridRows;

  // Calculate which grid intersection is being targeted during drag
  // This must match the logic in App.tsx handleDragEnd
  let hoverGridX = -1;
  let hoverGridY = -1;
  if (isDragging && dragPosition) {
    // Use the same calculation as the drag end logic
    const snappedGridX = Math.round(dragPosition.x / cellWidth);
    const snappedGridY = Math.round(dragPosition.y / cellHeight);
    
    hoverGridX = Math.max(0, Math.min(gridCols, snappedGridX));
    hoverGridY = Math.max(0, Math.min(gridRows, snappedGridY));
    
    // Debug: Show what the overlay thinks vs what drag end will do (reduced frequency)
    if (Math.random() < 0.05) { // Only log ~5% of drag moves
      console.log('GridOverlay calculation:', {
        dragPosition,
        cellWidth, cellHeight,
        snappedGridX, snappedGridY,
        hoverGridX, hoverGridY,
        willSnapTo: { x: hoverGridX * cellWidth, y: hoverGridY * cellHeight }
      });
    }
  }

  // Create vertical lines
  const verticalLines = [];
  for (let i = 0; i <= gridCols; i++) {
    verticalLines.push(
      <line
        key={`v-${i}`}
        x1={i * cellWidth}
        y1={0}
        x2={i * cellWidth}
        y2={720}
        stroke={isDragging ? "rgba(0, 123, 255, 0.6)" : "rgba(0, 123, 255, 0.3)"}
        strokeWidth={isDragging ? "2" : "1"}
      />
    );
  }

  // Create horizontal lines
  const horizontalLines = [];
  for (let i = 0; i <= gridRows; i++) {
    horizontalLines.push(
      <line
        key={`h-${i}`}
        x1={0}
        y1={i * cellHeight}
        x2={1280}
        y2={i * cellHeight}
        stroke={isDragging ? "rgba(0, 123, 255, 0.6)" : "rgba(0, 123, 255, 0.3)"}
        strokeWidth={isDragging ? "2" : "1"}
      />
    );
  }

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: isDragging ? 999 : 1,
      }}
      viewBox="0 0 1280 720"
      preserveAspectRatio="none"
    >
      {(showGrid || isDragging) && (
        <>
          {verticalLines}
          {horizontalLines}
        </>
      )}
      
      {/* Grid intersection dots */}
      {Array.from({ length: gridRows + 1 }, (_, row) =>
        Array.from({ length: gridCols + 1 }, (_, col) => {
          const isHovered = isDragging && col === hoverGridX && row === hoverGridY;
          return (
            <circle
              key={`dot-${row}-${col}`}
              cx={col * cellWidth}
              cy={row * cellHeight}
              r={isHovered ? "6" : "3"}
              fill={isHovered ? "rgba(255, 99, 71, 0.8)" : "rgba(0, 123, 255, 0.5)"}
              stroke={isHovered ? "rgba(255, 99, 71, 1)" : "none"}
              strokeWidth={isHovered ? "2" : "0"}
            />
          );
        })
      )}
      
      {/* Show exact snap point during drag */}
      {isDragging && hoverGridX >= 0 && hoverGridY >= 0 && (
        <g>
          {/* Large pulsing circle at exact snap point */}
          <circle
            cx={hoverGridX * cellWidth}
            cy={hoverGridY * cellHeight}
            r="12"
            fill="rgba(255, 99, 71, 0.3)"
            stroke="rgba(255, 99, 71, 1)"
            strokeWidth="3"
          >
            <animate
              attributeName="r"
              values="8;16;8"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* Cross-hair at exact snap point */}
          <g stroke="rgba(255, 99, 71, 1)" strokeWidth="2">
            <line
              x1={hoverGridX * cellWidth - 10}
              y1={hoverGridY * cellHeight}
              x2={hoverGridX * cellWidth + 10}
              y2={hoverGridY * cellHeight}
            />
            <line
              x1={hoverGridX * cellWidth}
              y1={hoverGridY * cellHeight - 10}
              x2={hoverGridX * cellWidth}
              y2={hoverGridY * cellHeight + 10}
            />
          </g>
        </g>
      )}
    </svg>
  );
};