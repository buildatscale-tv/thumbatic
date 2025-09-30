import React from 'react';

interface GridOverlayProps {
  isVisible: boolean;
  activeSnapPoint?: { x: number; y: number } | null;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ isVisible, activeSnapPoint }) => {
  if (!isVisible) return null;

  // 12 columns × 4 rows (interior lines only)
  const columns = 12;
  const rows = 4;

  // Canvas dimensions
  const width = 1280;
  const height = 720;

  // Calculate spacing
  const columnWidth = width / columns;
  const rowHeight = height / rows;

  // Generate interior vertical lines only (11 lines for 12 columns)
  const verticalLines = Array.from({ length: columns - 1 }, (_, i) => {
    const x = (i + 1) * columnWidth;
    return { x };
  });

  // Generate interior horizontal lines only (3 lines for 4 rows)
  const horizontalLines = Array.from({ length: rows - 1 }, (_, i) => {
    const y = (i + 1) * rowHeight;
    return { y };
  });

  return (
    <div className="grid-overlay">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Interior vertical grid lines */}
        {verticalLines.map((line, i) => (
          <line
            key={`v-${i}`}
            x1={line.x}
            y1={0}
            x2={line.x}
            y2={height}
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
        ))}

        {/* Interior horizontal grid lines */}
        {horizontalLines.map((line, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={line.y}
            x2={width}
            y2={line.y}
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
        ))}

        {/* Intersection dots at grid crossings */}
        {verticalLines.map((vLine, col) =>
          horizontalLines.map((hLine, row) => (
            <circle
              key={`dot-${col}-${row}`}
              cx={vLine.x}
              cy={hLine.y}
              r="3"
              fill="rgba(59, 130, 246, 0.8)"
            />
          ))
        )}

        {/* Active snap point indicator */}
        {activeSnapPoint && (
          <>
            {/* Highlight vertical line */}
            <line
              x1={activeSnapPoint.x}
              y1={0}
              x2={activeSnapPoint.x}
              y2={height}
              stroke="rgba(34, 197, 94, 0.8)"
              strokeWidth="2"
            />
            {/* Highlight horizontal line */}
            <line
              x1={0}
              y1={activeSnapPoint.y}
              x2={width}
              y2={activeSnapPoint.y}
              stroke="rgba(34, 197, 94, 0.8)"
              strokeWidth="2"
            />
            {/* Snap point circle with pulse animation */}
            <circle
              cx={activeSnapPoint.x}
              cy={activeSnapPoint.y}
              r="8"
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgba(34, 197, 94, 1)"
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                values="8;12;8"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Inner solid dot */}
            <circle
              cx={activeSnapPoint.x}
              cy={activeSnapPoint.y}
              r="4"
              fill="rgba(34, 197, 94, 1)"
            />
          </>
        )}
      </svg>
    </div>
  );
};
