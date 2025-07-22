import React from 'react';
import type { ActiveSnap } from '../../types/snapping';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../utils/snapUtils';

interface AlignmentGuidesProps {
  activeSnaps: ActiveSnap[];
  isVisible?: boolean;
  dragPosition?: { x: number; y: number };
  snapThreshold?: number;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  activeSnaps,
  isVisible = true,
  dragPosition,
  snapThreshold = 100
}) => {
  if (!isVisible || activeSnaps.length === 0) {
    return null;
  }

  // Group snaps by orientation for rendering
  const verticalSnaps = activeSnaps.filter(snap =>
    snap.orientation === 'vertical' && snap.target.position.x !== undefined
  );
  const horizontalSnaps = activeSnaps.filter(snap =>
    snap.orientation === 'horizontal' && snap.target.position.y !== undefined
  );

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000, // Above everything else during drag
      }}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Pink gradient for proximity guides */}
        <linearGradient id="verticalGuideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 59, 148, 0.1)" />
          <stop offset="20%" stopColor="rgba(255, 59, 148, 0.8)" />
          <stop offset="80%" stopColor="rgba(255, 59, 148, 0.8)" />
          <stop offset="100%" stopColor="rgba(255, 59, 148, 0.1)" />
        </linearGradient>

        <linearGradient id="horizontalGuideGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 59, 148, 0.1)" />
          <stop offset="20%" stopColor="rgba(255, 59, 148, 0.8)" />
          <stop offset="80%" stopColor="rgba(255, 59, 148, 0.8)" />
          <stop offset="100%" stopColor="rgba(255, 59, 148, 0.1)" />
        </linearGradient>

        {/* Green gradient for snap-ready guides */}
        <linearGradient id="verticalSnapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(34, 197, 94, 0.1)" />
          <stop offset="20%" stopColor="rgba(34, 197, 94, 0.8)" />
          <stop offset="80%" stopColor="rgba(34, 197, 94, 0.8)" />
          <stop offset="100%" stopColor="rgba(34, 197, 94, 0.1)" />
        </linearGradient>

        <linearGradient id="horizontalSnapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34, 197, 94, 0.1)" />
          <stop offset="20%" stopColor="rgba(34, 197, 94, 0.8)" />
          <stop offset="80%" stopColor="rgba(34, 197, 94, 0.8)" />
          <stop offset="100%" stopColor="rgba(34, 197, 94, 0.1)" />
        </linearGradient>
      </defs>

      {/* Vertical alignment guides */}
      {verticalSnaps.map((snap, index) => {
        const x = snap.target.position.x!;
        const isSnapReady = snap.distance <= snapThreshold;
        const gradientId = isSnapReady ? 'url(#verticalSnapGradient)' : 'url(#verticalGuideGradient)';
        const solidColor = isSnapReady ? '#22c55e' : '#ff3b94';

        return (
          <g key={`vertical-${snap.target.id}-${index}`}>
            {/* Main guide line */}
            <line
              x1={x}
              y1={0}
              x2={x}
              y2={CANVAS_HEIGHT}
              stroke={gradientId}
              strokeWidth="1.5"
              opacity="0.9"
            >
              {/* Smooth fade in animation */}
              <animate
                attributeName="opacity"
                from="0"
                to="0.9"
                dur="0.2s"
                fill="freeze"
              />
            </line>

            {/* Central highlight section */}
            <line
              x1={x}
              y1={CANVAS_HEIGHT * 0.3}
              x2={x}
              y2={CANVAS_HEIGHT * 0.7}
              stroke={solidColor}
              strokeWidth="2"
              opacity="1"
            >
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="0.2s"
                fill="freeze"
              />
            </line>

            {/* Center indicator dot */}
            <circle
              cx={x}
              cy={CANVAS_HEIGHT / 2}
              r="3"
              fill={solidColor}
              opacity="1"
            >
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="0.3s"
                fill="freeze"
              />
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}

      {/* Horizontal alignment guides */}
      {horizontalSnaps.map((snap, index) => {
        const y = snap.target.position.y!;
        const isSnapReady = snap.distance <= snapThreshold;
        const gradientId = isSnapReady ? 'url(#horizontalSnapGradient)' : 'url(#horizontalGuideGradient)';
        const solidColor = isSnapReady ? '#22c55e' : '#ff3b94';

        return (
          <g key={`horizontal-${snap.target.id}-${index}`}>
            {/* Main guide line */}
            <line
              x1={0}
              y1={y}
              x2={CANVAS_WIDTH}
              y2={y}
              stroke={gradientId}
              strokeWidth="1.5"
              opacity="0.9"
            >
              {/* Smooth fade in animation */}
              <animate
                attributeName="opacity"
                from="0"
                to="0.9"
                dur="0.2s"
                fill="freeze"
              />
            </line>

            {/* Central highlight section */}
            <line
              x1={CANVAS_WIDTH * 0.3}
              y1={y}
              x2={CANVAS_WIDTH * 0.7}
              y2={y}
              stroke={solidColor}
              strokeWidth="2"
              opacity="1"
            >
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="0.2s"
                fill="freeze"
              />
            </line>

            {/* Center indicator dot */}
            <circle
              cx={CANVAS_WIDTH / 2}
              cy={y}
              r="3"
              fill={solidColor}
              opacity="1"
            >
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="0.3s"
                fill="freeze"
              />
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}

      {/* Debug information */}
      {(dragPosition || activeSnaps.length > 0) && (
        <g>
          {/* Element Center Position */}
          {dragPosition && (
            <text
              x={10}
              y={30}
              fill="#ff3b94"
              fontSize="14"
              fontFamily="monospace"
              opacity="0.8"
            >
              {`Element Center: (${Math.round(dragPosition.x)}, ${Math.round(dragPosition.y)})`}
            </text>
          )}

          {/* Active Snaps Count */}
          {activeSnaps.length > 0 && (
            <text
              x={10}
              y={50}
              fill="#ff3b94"
              fontSize="14"
              fontFamily="monospace"
              opacity="0.8"
            >
              {`Active Snaps: ${activeSnaps.length}`}
            </text>
          )}

          {/* Active Snap Coordinates */}
          {activeSnaps.length > 0 && (
            <text
              x={10}
              y={70}
              fill="#ff3b94"
              fontSize="14"
              fontFamily="monospace"
              opacity="0.8"
            >
              {`Snap Coords: ${activeSnaps.map(snap => {
                if (snap.orientation === 'vertical' && snap.target.position.x !== undefined) {
                  return `x=${Math.round(snap.target.position.x)}`;
                } else if (snap.orientation === 'horizontal' && snap.target.position.y !== undefined) {
                  return `y=${Math.round(snap.target.position.y)}`;
                }
                return '';
              }).filter(coord => coord).join(', ')}`}
            </text>
          )}

          {/* Direct Pixel Mode */}
          <text
            x={10}
            y={90}
            fill="#ff3b94"
            fontSize="12"
            fontFamily="monospace"
            opacity="0.6"
          >
            Direct Pixel Mode (1280x720)
          </text>
        </g>
      )}
    </svg>
  );
};
