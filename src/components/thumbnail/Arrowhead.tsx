import React from 'react';

interface ArrowheadProps {
  point: { x: number; y: number };
  angle: number;  // Degrees
  style: 'sharp' | 'rounded' | 'filled';
  color: string;
  size: number;
  seed?: number;  // For hand-drawn effect
}

export const Arrowhead: React.FC<ArrowheadProps> = ({ point, angle, style, color, size }) => {
  // The arrowhead shape has BASE at origin (0,0) and TIP extending in +X direction
  const transform = `translate(${point.x}, ${point.y}) rotate(${angle})`;

  // All shapes have BASE at origin, TIP at +X
  switch (style) {
    case 'filled':
      // Pointy but substantial base
      const filledWidth = size * 0.55;
      return (
        <polygon
          points={`${size},0 0,${filledWidth} 0,${-filledWidth}`}
          fill={color}
          transform={transform}
        />
      );

    case 'sharp':
      // Chevron-style - base extends back into the stroke to avoid gap
      const sharpWidth = size * 0.35;
      const sharpBack = -size * 0.15;  // Extend back into stroke
      return (
        <polygon
          points={`${size},0 ${sharpBack},${sharpWidth} ${size * 0.3},0 ${sharpBack},${-sharpWidth}`}
          fill={color}
          transform={transform}
        />
      );

    case 'rounded':
      // Curved style - less round, more pointed
      const roundWidth = size * 0.35;
      return (
        <path
          d={`M -${size * 0.1} ${roundWidth} Q ${size * 0.85} 0 -${size * 0.1} ${-roundWidth}`}
          stroke={color}
          strokeWidth={Math.max(size / 3, 3)}
          strokeLinecap="round"
          fill="none"
          transform={transform}
        />
      );

    default:
      return null;
  }
};

// Calculate tangent angle at end of quadratic bezier (from control to end)
export function calculateEndTangentAngle(control: { x: number; y: number }, end: { x: number; y: number }): number {
  const dx = end.x - control.x;
  const dy = end.y - control.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

// Calculate tangent angle at start of quadratic bezier (from start to control)
export function calculateStartTangentAngle(start: { x: number; y: number }, control: { x: number; y: number }): number {
  const dx = control.x - start.x;
  const dy = control.y - start.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}
