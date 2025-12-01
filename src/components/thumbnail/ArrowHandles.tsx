import React, { useRef } from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import type { ArrowElementProperties, ThumbnailElement } from '../../types';

interface ArrowHandlesProps {
  element: ThumbnailElement;
}

export const ArrowHandles: React.FC<ArrowHandlesProps> = ({ element }) => {
  const { updateArrowPoint, moveArrow } = useThumbnailStore();
  const props = element.properties as ArrowElementProperties;
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

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

  const handleMoveAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const canvas = document.getElementById('thumbnail');
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return;

    lastPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!lastPosRef.current) return;

      const currentX = moveEvent.clientX - rect.left;
      const currentY = moveEvent.clientY - rect.top;

      const delta = {
        x: currentX - lastPosRef.current.x,
        y: currentY - lastPosRef.current.y,
      };

      moveArrow(element.id, delta);

      lastPosRef.current = { x: currentX, y: currentY };
    };

    const handleMouseUp = () => {
      lastPosRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate center point for move handle
  let centerX = (props.startPoint.x + props.endPoint.x + props.controlPoint.x) / 3;
  let centerY = (props.startPoint.y + props.endPoint.y + props.controlPoint.y) / 3;

  // If move handle is too close to control handle, offset it perpendicular to the arrow
  const distToControl = Math.sqrt(
    Math.pow(centerX - props.controlPoint.x, 2) + Math.pow(centerY - props.controlPoint.y, 2)
  );
  if (distToControl < 25) {
    // Get perpendicular direction to arrow
    const dx = props.endPoint.x - props.startPoint.x;
    const dy = props.endPoint.y - props.startPoint.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    // Perpendicular offset (pick direction away from control or just down/right)
    const perpX = -dy / len;
    const perpY = dx / len;
    centerX = props.controlPoint.x + perpX * 30;
    centerY = props.controlPoint.y + perpY * 30;
  }

  // Reset bezier curve to straight line (control point at midpoint)
  const handleResetBezier = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const midPoint = {
      x: (props.startPoint.x + props.endPoint.x) / 2,
      y: (props.startPoint.y + props.endPoint.y) / 2,
    };
    updateArrowPoint(element.id, 'control', midPoint);
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

      {/* Center move handle - move entire arrow (rendered first so control is on top) */}
      <circle
        cx={centerX}
        cy={centerY}
        r={12}
        fill="white"
        stroke="#0066FF"
        strokeWidth={2}
        style={{ cursor: 'grab', pointerEvents: 'auto' }}
        onMouseDown={handleMoveAll}
      />
      <g transform={`translate(${centerX}, ${centerY})`} style={{ pointerEvents: 'none' }}>
        {/* Four-way arrow move icon */}
        <path
          d="M 0 -5 L 2 -2 M 0 -5 L -2 -2 M 0 -5 L 0 5 M 0 5 L 2 2 M 0 5 L -2 2 M -5 0 L 5 0 M -5 0 L -2 -2 M -5 0 L -2 2 M 5 0 L 2 -2 M 5 0 L 2 2"
          stroke="#0066FF"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Control handle - diamond (rotated square) - double-click to reset (on top) */}
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
        onDoubleClick={handleResetBezier}
      />
    </svg>
  );
};
