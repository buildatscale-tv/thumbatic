import React from 'react';
import type { ActiveSnap } from '../../types/snapping';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_CENTER_X, CANVAS_CENTER_Y } from '../../utils/snapUtils';

interface AlignmentGuidesProps {
  activeSnaps: ActiveSnap[];
  isVisible?: boolean;
  dragPosition?: { x: number; y: number };
  snapThreshold?: number;
  showDebugInfo?: boolean;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  activeSnaps,
  isVisible = true,
  dragPosition,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  snapThreshold: _snapThreshold = 100,
  showDebugInfo = false
}) => {
  if (!isVisible || activeSnaps.length === 0) {
    return null;
  }

  // Find the highest priority for each orientation separately
  const verticalSnaps = activeSnaps.filter(snap =>
    snap.orientation === 'vertical' && snap.target.position.x !== undefined
  );
  const horizontalSnaps = activeSnaps.filter(snap =>
    snap.orientation === 'horizontal' && snap.target.position.y !== undefined
  );

  // Show ALL proximity-based snaps, coloring will be based on isGlobalWinner
  const filteredVerticalSnaps = verticalSnaps;
  const filteredHorizontalSnaps = horizontalSnaps;

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

      {/* Vertical alignment guides - all proximity snaps with global winner coloring */}
      {filteredVerticalSnaps.map((snap, index) => {
        const x = snap.target.position.x!;
        const willSnap = snap.isGlobalWinner;
        const gradientId = willSnap ? 'url(#verticalGuideGradient)' : 'url(#verticalSnapGradient)';
        const solidColor = willSnap ? '#ff3b94' : '#027BFF';

        // Different rendering for text edge guides vs canvas center guides
        const isTextEdge = snap.target.type === 'text-edge';

        if (isTextEdge) {
          // For text edge guides, get the source text element bounds
          const sourceElement = document.querySelector(`[data-element-id="${snap.target.elementId}"]`) as HTMLElement;
          let elementTop = CANVAS_HEIGHT * 0.2;
          let elementBottom = CANVAS_HEIGHT * 0.8;
          let elementHeight = elementBottom - elementTop;
          let elementCenterY = elementTop + elementHeight / 2;

          if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            const slideRect = sourceElement.closest('.slide')?.getBoundingClientRect();
            if (slideRect) {
              const scale = CANVAS_WIDTH / slideRect.width;
              elementTop = (rect.top - slideRect.top) * scale;
              elementBottom = (rect.bottom - slideRect.top) * scale;
              elementHeight = rect.height * scale;
              elementCenterY = elementTop + elementHeight / 2;
            }
          }

          // Guide line height proportional to element height (1.75x)
          const guideHeight = elementHeight * 1.75;
          const guideTop = elementCenterY - guideHeight / 2;
          const guideBottom = elementCenterY + guideHeight / 2;


          return (
            <g key={`vertical-edge-${snap.target.id}-${index}`}>
              {/* Proportional guide line centered on element center vertically */}
              <line
                x1={x}
                y1={guideTop}
                x2={x}
                y2={guideBottom}
                stroke={solidColor}
                strokeWidth="2"
                opacity="0.9"
                strokeDasharray="5,5"
              >
                <animate
                  attributeName="opacity"
                  from="0"
                  to="0.9"
                  dur="0.2s"
                  fill="freeze"
                />
              </line>

              {/* Element edge indicator - positioned at actual edge Y position */}
              <rect
                x={x - 1.5}
                y={elementCenterY - 2}
                width="3"
                height="4"
                fill={solidColor}
                opacity="0.8"
              >
                <animate
                  attributeName="opacity"
                  from="0"
                  to="0.8"
                  dur="0.2s"
                  fill="freeze"
                />
              </rect>

              {/* Edge type indicator */}
              <circle
                cx={x}
                cy={elementCenterY}
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
        }

        // Position the center dot at the vertical center of the source element
        let dotCenterY: number;

        if (snap.target.elementId) {
          // For text element guides, get the source element's center
          const sourceElement = document.querySelector(`[data-element-id="${snap.target.elementId}"]`) as HTMLElement;
          if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            const slideRect = sourceElement.closest('.slide')?.getBoundingClientRect();
            if (slideRect) {
              const scale = CANVAS_WIDTH / slideRect.width;
              const elementTop = (rect.top - slideRect.top) * scale;
              const elementHeight = rect.height * scale;
              dotCenterY = elementTop + elementHeight / 2;
            } else {
              dotCenterY = CANVAS_CENTER_Y;
            }
          } else {
            dotCenterY = CANVAS_CENTER_Y;
          }
        } else {
          // Canvas center guides - dot should be at canvas center
          dotCenterY = CANVAS_CENTER_Y;
        }

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

            {/* Center indicator dot - positioned at element center for text guides */}
            <circle
              cx={x}
              cy={dotCenterY}
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

      {/* Horizontal alignment guides - all proximity snaps with global winner coloring */}
      {filteredHorizontalSnaps.map((snap, index) => {
        const y = snap.target.position.y!;
        const willSnap = snap.isGlobalWinner;
        const gradientId = willSnap ? 'url(#horizontalGuideGradient)' : 'url(#horizontalSnapGradient)';
        const solidColor = willSnap ? '#ff3b94' : '#027BFF';

        // Different rendering for text edge guides vs canvas center guides
        const isTextEdge = snap.target.type === 'text-edge';

        if (isTextEdge) {
          // For text edge guides, get the source text element bounds
          const sourceElement = document.querySelector(`[data-element-id="${snap.target.elementId}"]`) as HTMLElement;
          let elementLeft = CANVAS_WIDTH * 0.2;
          let elementRight = CANVAS_WIDTH * 0.8;
          let elementWidth = elementRight - elementLeft;
          let elementCenterX = elementLeft + elementWidth / 2;

          if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            const slideRect = sourceElement.closest('.slide')?.getBoundingClientRect();
            if (slideRect) {
              const scale = CANVAS_WIDTH / slideRect.width;
              elementLeft = (rect.left - slideRect.left) * scale;
              elementRight = (rect.right - slideRect.left) * scale;
              elementWidth = rect.width * scale;
              elementCenterX = elementLeft + elementWidth / 2;
            }
          }

          // Guide line width proportional to element width (1.75x)
          const guideWidth = elementWidth * 1.75;
          const guideLeft = elementCenterX - guideWidth / 2;
          const guideRight = elementCenterX + guideWidth / 2;


          return (
            <g key={`horizontal-edge-${snap.target.id}-${index}`}>
              {/* Proportional guide line centered on element center horizontally */}
              <line
                x1={guideLeft}
                y1={y}
                x2={guideRight}
                y2={y}
                stroke={solidColor}
                strokeWidth="2"
                opacity="0.9"
                strokeDasharray="5,5"
              >
                <animate
                  attributeName="opacity"
                  from="0"
                  to="0.9"
                  dur="0.2s"
                  fill="freeze"
                />
              </line>

              {/* Element edge indicator - positioned at actual edge X position */}
              <rect
                x={elementCenterX - 2}
                y={y - 1.5}
                width="4"
                height="3"
                fill={solidColor}
                opacity="0.8"
              >
                <animate
                  attributeName="opacity"
                  from="0"
                  to="0.8"
                  dur="0.2s"
                  fill="freeze"
                />
              </rect>

              {/* Edge type indicator */}
              <circle
                cx={elementCenterX}
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
        }

        // Position the center dot at the horizontal center of the source element
        let dotCenterX: number;

        if (snap.target.elementId) {
          // For text element guides, get the source element's center
          const sourceElement = document.querySelector(`[data-element-id="${snap.target.elementId}"]`) as HTMLElement;
          if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            const slideRect = sourceElement.closest('.slide')?.getBoundingClientRect();
            if (slideRect) {
              const scale = CANVAS_WIDTH / slideRect.width;
              const elementLeft = (rect.left - slideRect.left) * scale;
              const elementWidth = rect.width * scale;
              dotCenterX = elementLeft + elementWidth / 2;
            } else {
              dotCenterX = CANVAS_CENTER_X;
            }
          } else {
            dotCenterX = CANVAS_CENTER_X;
          }
        } else {
          // Canvas center guides - dot should be at canvas center
          dotCenterX = CANVAS_CENTER_X;
        }

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

            {/* Center indicator dot - positioned at element center for text guides */}
            <circle
              cx={dotCenterX}
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
      {(showDebugInfo && (dragPosition || filteredVerticalSnaps.length > 0 || filteredHorizontalSnaps.length > 0)) && (
        <g>
          {/* Element Center Position */}
          {dragPosition && (
            <text
              x={10}
              y={30}
              fill="#22c55e"
              fontSize="14"
              fontFamily="monospace"
              opacity="0.8"
            >
              {`Element Center: (${Math.round(dragPosition.x)}, ${Math.round(dragPosition.y)})`}
            </text>
          )}

          {/* Global Winners Info */}
          {(filteredVerticalSnaps.length > 0 || filteredHorizontalSnaps.length > 0) && (
            <text
              x={10}
              y={50}
              fill="#ff3b94"
              fontSize="14"
              fontFamily="monospace"
              opacity="0.8"
            >
              {`Will Snap To: ${[...filteredVerticalSnaps, ...filteredHorizontalSnaps]
                .filter(snap => snap.isGlobalWinner)
                .map(snap => snap.target.type)
                .join(', ') || 'None (ties or no clear winner)'}`}
            </text>
          )}

          {/* Guide Count Information */}
          {(filteredVerticalSnaps.length > 0 || filteredHorizontalSnaps.length > 0) && (
            <text
              x={10}
              y={70}
              fill="#22c55e"
              fontSize="14"
              fontFamily="monospace"
              opacity="0.8"
            >
              {`Guides: V=${filteredVerticalSnaps.length} | H=${filteredHorizontalSnaps.length} | Winners: ${[...filteredVerticalSnaps, ...filteredHorizontalSnaps].filter(snap => snap.isGlobalWinner).length}`}
            </text>
          )}

          {/* Active Snap Coordinates */}
          {(filteredVerticalSnaps.length > 0 || filteredHorizontalSnaps.length > 0) && (
            <text
              x={10}
              y={90}
              fill="#22c55e"
              fontSize="14"
              fontFamily="monospace"
              opacity="0.8"
            >
              {`Snap Coords: ${[...filteredVerticalSnaps, ...filteredHorizontalSnaps].map(snap => {
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
            y={110}
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
