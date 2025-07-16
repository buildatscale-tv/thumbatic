import React from 'react';
import { ControlPanel } from './ControlPanel';
import { SlideCanvas } from './SlideCanvas';

export const SlideGenerator: React.FC = () => {
  return (
    <div className="container">
      <ControlPanel />
      <div className="preview">
        <SlideCanvas />
      </div>
    </div>
  );
};