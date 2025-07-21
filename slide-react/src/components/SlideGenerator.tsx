import React from 'react';
import { ControlPanel } from './ControlPanel';
import { SlideCanvas } from './SlideCanvas';

interface SlideGeneratorProps {
  dragState?: {
    isDragging: boolean;
    position?: { x: number; y: number };
  };
}

export const SlideGenerator: React.FC<SlideGeneratorProps> = ({ dragState }) => {
  return (
    <div className="container">
      <ControlPanel />
      <div className="preview">
        <SlideCanvas dragState={dragState} />
      </div>
    </div>
  );
};