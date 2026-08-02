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
    case 'filled': {
      // Pointy but substantial base
      const filledWidth = size * 0.55;
      return (
        <polygon
          points={`${size},0 0,${filledWidth} 0,${-filledWidth}`}
          fill={color}
          transform={transform}
        />
      );
    }

    case 'sharp': {
      // Chevron-style - shallow notch
      const sharpWidth = size * 0.5;
      const sharpBack = -size * 0.3;  // Moderate back extension
      const notchDepth = size * 0.1;  // Shallow notch
      return (
        <polygon
          points={`${size},0 ${sharpBack},${sharpWidth} ${notchDepth},0 ${sharpBack},${-sharpWidth}`}
          fill={color}
          transform={transform}
        />
      );
    }

    case 'rounded': {
      // Angular V-shape with slightly rounded ends
      const roundWidth = size * 0.55;
      const roundBack = -size * 0.3;  // Moderate back extension
      const roundTip = size * 0.75;   // Shorter tip
      return (
        <path
          d={`M ${roundBack} ${roundWidth} L ${roundTip} 0 L ${roundBack} ${-roundWidth}`}
          stroke={color}
          strokeWidth={Math.max(size / 4, 3)}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          transform={transform}
        />
      );
    }

    default:
      return null;
  }
};
