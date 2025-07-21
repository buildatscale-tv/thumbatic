import React from 'react';
import { ControlPanel } from './ControlPanel';
import { SlideCanvas } from './SlideCanvas';
import type { ActiveSnap } from '../types/snapping';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

interface SlideGeneratorProps {
  dragState?: {
    isDragging: boolean;
    position?: { x: number; y: number };
    activeSnaps: ActiveSnap[];
  };
  dragCallbacks: DragCallbacks;
  snapThreshold?: number;
}

export const SlideGenerator: React.FC<SlideGeneratorProps> = ({ dragState, dragCallbacks, snapThreshold }) => {
  return (
    <div className="container">
      <ControlPanel />
      <div className="preview">
        <SlideCanvas dragState={dragState} dragCallbacks={dragCallbacks} snapThreshold={snapThreshold} />
      </div>
    </div>
  );
};