import React from 'react';
import { Toolbar } from './Toolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';
import { LogoLibraryModal } from './LogoLibraryModal';
import { IconLibraryModal } from './IconLibraryModal';
import { ThumbnailCanvas } from './ThumbnailCanvas';
import type { ActiveSnap } from '../types/snapping';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

interface ThumbnailGeneratorProps {
  dragState?: {
    isDragging: boolean;
    position?: { x: number; y: number };
    activeSnaps: ActiveSnap[];
    gridSnapPoint?: { x: number; y: number } | null;
  };
  dragCallbacks: DragCallbacks;
  snapThreshold?: number;
}

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ dragState, dragCallbacks, snapThreshold }) => {
  return (
    <div className="editor-layout">
      <Toolbar />
      <div className="editor-main">
        <div className="canvas-container">
          <ThumbnailCanvas dragState={dragState} dragCallbacks={dragCallbacks} snapThreshold={snapThreshold} />
        </div>
        <PropertiesPanel />
      </div>
      <StatusBar />
      <LogoLibraryModal />
      <IconLibraryModal />
    </div>
  );
};
