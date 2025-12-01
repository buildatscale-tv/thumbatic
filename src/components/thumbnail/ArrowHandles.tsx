import React from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import type { ArrowElementProperties, ThumbnailElement } from '../../types';

interface ArrowHandlesProps {
  element: ThumbnailElement;
}

export const ArrowHandles: React.FC<ArrowHandlesProps> = ({ element }) => {
  const { updateArrowPoint } = useThumbnailStore();
  const props = element.properties as ArrowElementProperties;

  const handleDrag = (pointType: 'start' | 'end' | 'control', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const canvas = document.getElementById('thumbnail');
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.max(0, Math.min(1280, moveEvent.clientX - rect.left));
      const y = Math.max(0, Math.min(720, moveEvent.clientY - rect.top));

      updateArrowPoint(element.id, pointType, { x, y });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <svg
      className="arrow-handles"
      width="1280"
      height="720"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9000,
      }}
    >
      {/* Guide lines from endpoints to control point */}
      <line
        x1={props.startPoint.x}
        y1={props.startPoint.y}
        x2={props.controlPoint.x}
        y2={props.controlPoint.y}
        stroke="#0066FF"
        strokeWidth={1}
        strokeDasharray="4"
        opacity={0.5}
      />
      <line
        x1={props.endPoint.x}
        y1={props.endPoint.y}
        x2={props.controlPoint.x}
        y2={props.controlPoint.y}
        stroke="#0066FF"
        strokeWidth={1}
        strokeDasharray="4"
        opacity={0.5}
      />

      {/* Start handle - circle */}
      <circle
        cx={props.startPoint.x}
        cy={props.startPoint.y}
        r={8}
        fill="white"
        stroke="#0066FF"
        strokeWidth={2}
        style={{ cursor: 'move', pointerEvents: 'auto' }}
        onMouseDown={(e) => handleDrag('start', e)}
      />

      {/* End handle - circle */}
      <circle
        cx={props.endPoint.x}
        cy={props.endPoint.y}
        r={8}
        fill="white"
        stroke="#0066FF"
        strokeWidth={2}
        style={{ cursor: 'move', pointerEvents: 'auto' }}
        onMouseDown={(e) => handleDrag('end', e)}
      />

      {/* Control handle - diamond (rotated square) */}
      <rect
        x={props.controlPoint.x - 6}
        y={props.controlPoint.y - 6}
        width={12}
        height={12}
        fill="white"
        stroke="#FF6600"
        strokeWidth={2}
        transform={`rotate(45 ${props.controlPoint.x} ${props.controlPoint.y})`}
        style={{ cursor: 'move', pointerEvents: 'auto' }}
        onMouseDown={(e) => handleDrag('control', e)}
      />
    </svg>
  );
};
