import React from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { Toolbar } from './Toolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';
import { LogoLibraryModal } from './LogoLibraryModal';
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
  };
  dragCallbacks: DragCallbacks;
  snapThreshold?: number;
}

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ dragState, dragCallbacks, snapThreshold }) => {
  const { showGridGuides } = useThumbnailStore();

  return (
    <div className="editor-layout">
      <Toolbar />
      <div className="editor-main">
        <div className={`canvas-container ${showGridGuides ? 'canvas-container--with-guides' : ''}`}>
          <ThumbnailCanvas dragState={dragState} dragCallbacks={dragCallbacks} snapThreshold={snapThreshold} />
        </div>
        <PropertiesPanel />
      </div>
      <StatusBar />
      <LogoLibraryModal />
    </div>
  );
};