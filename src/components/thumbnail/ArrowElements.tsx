import React from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { Arrowhead } from './Arrowhead';
import { calculateEndTangentAngle, calculateStartTangentAngle } from '../../utils/arrowUtils';
import type { ArrowElementProperties, ThumbnailElement } from '../../types';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

// Generate simple quadratic bezier path
function generatePath(
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number }
): string {
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
}

// Get point on quadratic bezier at parameter t (0-1)
function bezierPoint(
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t;
  return {
    x: mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x,
    y: mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y
  };
}

// Get tangent direction at point t on quadratic bezier
function bezierTangent(
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t;
  const dx = 2 * mt * (control.x - start.x) + 2 * t * (end.x - control.x);
  const dy = 2 * mt * (control.y - start.y) + 2 * t * (end.y - control.y);
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
}

// Generate tapered stroke as a filled polygon (pen stroke effect)
// taperEnd: 'start' = thin at start, 'end' = thin at end
function generateTaperedPath(
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number },
  strokeWidth: number,
  taperEnd: 'start' | 'end' = 'start'
): string {
  const segments = 16;
  const topEdge: { x: number; y: number }[] = [];
  const bottomEdge: { x: number; y: number }[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = bezierPoint(start, control, end, t);
    const tangent = bezierTangent(start, control, end, t);

    // Perpendicular to tangent
    const perpX = -tangent.y;
    const perpY = tangent.x;

    // Taper calculation based on which end should be thin
    let taper: number;
    if (taperEnd === 'start') {
      // Thin at start (t=0), full width at end (t=1)
      taper = Math.pow(t, 0.6);
    } else {
      // Full width at start (t=0), thin at end (t=1)
      taper = Math.pow(1 - t, 0.6);
    }
    const width = (strokeWidth / 2) * Math.max(0.08, taper);  // Min 8% width at tip

    topEdge.push({
      x: point.x + perpX * width,
      y: point.y + perpY * width
    });
    bottomEdge.push({
      x: point.x - perpX * width,
      y: point.y - perpY * width
    });
  }

  // Build path: top edge forward, bottom edge backward
  let path = `M ${topEdge[0].x} ${topEdge[0].y}`;

  // Smooth curve along top edge
  for (let i = 1; i < topEdge.length; i++) {
    path += ` L ${topEdge[i].x} ${topEdge[i].y}`;
  }

  // Connect to bottom edge and go backward
  for (let i = bottomEdge.length - 1; i >= 0; i--) {
    path += ` L ${bottomEdge[i].x} ${bottomEdge[i].y}`;
  }

  path += ' Z';  // Close path
  return path;
}

interface ArrowProps {
  element: ThumbnailElement;
  isSelected: boolean;
}

const Arrow: React.FC<ArrowProps> = ({ element, isSelected }) => {
  const props = element.properties as ArrowElementProperties;
  const { selectElement } = useThumbnailStore();

  // Use tapered stroke when only one arrowhead (pen stroke effect on opposite end)
  const hasOnlyEnd = props.arrowheadEnd && !props.arrowheadStart;
  const hasOnlyStart = props.arrowheadStart && !props.arrowheadEnd;
  const useTaper = hasOnlyEnd || hasOnlyStart;
  const taperEnd = hasOnlyEnd ? 'start' : 'end';  // Taper opposite side of arrowhead

  // Build path - tapered or regular
  const pathD = useTaper
    ? generateTaperedPath(props.startPoint, props.controlPoint, props.endPoint, props.strokeWidth, taperEnd)
    : generatePath(props.startPoint, props.controlPoint, props.endPoint);

  // Calculate arrowhead rotation angles
  // The arrowhead shape has BASE at origin and TIP extending in +X direction
  // When rotated, the base stays at the endpoint and tip extends in the direction of angle

  // End arrowhead: base at endPoint, tip extends in direction of travel (control -> end)
  const endAngle = calculateEndTangentAngle(props.controlPoint, props.endPoint);

  // Start arrowhead: base at startPoint, tip extends AWAY from the arrow body
  // Direction away from arrow body = opposite of (start -> control)
  const startAngle = calculateStartTangentAngle(props.startPoint, props.controlPoint) + 180;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element);
  };

  return (
    <g
      className={`arrow-element ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        opacity: props.opacity / 100,
        filter: 'drop-shadow(-3px 3px 0px rgba(0, 0, 0, 0.35))',
      }}
    >
      {/* Main arrow body */}
      {useTaper ? (
        // Tapered filled shape (pen stroke effect)
        <path
          d={pathD}
          fill={props.color}
          style={{ pointerEvents: 'fill' }}
        />
      ) : (
        // Regular stroked path
        <path
          d={pathD}
          stroke={props.color}
          strokeWidth={props.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ pointerEvents: 'stroke' }}
        />
      )}

      {/* End arrowhead - offset back to close gap */}
      {props.arrowheadEnd && (() => {
        const size = props.strokeWidth * 2.5;
        const offset = props.arrowheadStyle === 'filled' ? size * 0.08 : props.arrowheadStyle === 'rounded' ? size * 0.5 : size * 0.3;
        const angleRad = endAngle * Math.PI / 180;
        const offsetPoint = {
          x: props.endPoint.x - Math.cos(angleRad) * offset,
          y: props.endPoint.y - Math.sin(angleRad) * offset,
        };
        return (
          <Arrowhead
            point={offsetPoint}
            angle={endAngle}
            style={props.arrowheadStyle}
            color={props.color}
            size={size}
          />
        );
      })()}

      {/* Start arrowhead - offset back to close gap */}
      {props.arrowheadStart && (() => {
        const size = props.strokeWidth * 2.5;
        const offset = props.arrowheadStyle === 'filled' ? size * 0.08 : props.arrowheadStyle === 'rounded' ? size * 0.5 : size * 0.3;
        const angleRad = startAngle * Math.PI / 180;
        const offsetPoint = {
          x: props.startPoint.x - Math.cos(angleRad) * offset,
          y: props.startPoint.y - Math.sin(angleRad) * offset,
        };
        return (
          <Arrowhead
            point={offsetPoint}
            angle={startAngle}
            style={props.arrowheadStyle}
            color={props.color}
            size={size}
          />
        );
      })()}
    </g>
  );
};

interface ArrowElementsProps {
  dragCallbacks: DragCallbacks;
}

export const ArrowElements: React.FC<ArrowElementsProps> = ({ dragCallbacks: _dragCallbacks }) => {
  const { elements, selectedElement } = useThumbnailStore();
  const arrowElements = elements.filter(el => el.type === 'arrow');

  if (arrowElements.length === 0) {
    return null;
  }

  return (
    <svg
      className="arrow-layer"
      width="1280"
      height="720"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 6000,
      }}
    >
      {arrowElements.map((element) => (
        <Arrow
          key={element.id}
          element={element}
          isSelected={selectedElement?.id === element.id}
        />
      ))}
    </svg>
  );
};
