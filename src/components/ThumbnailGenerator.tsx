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
    gridSnapPoint?: { x: number; y: number } | null;
  };
  dragCallbacks: DragCallbacks;
  snapThreshold?: number;
}

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ dragState, dragCallbacks, snapThreshold }) => {
  const isHydrated = useThumbnailStore(state => state.isHydrated);

  return (
    <div className="editor-layout">
      <Toolbar />
      <div className="editor-main">
        <div className="canvas-container">
          {!isHydrated ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1280px',
              height: '720px',
              background: '#1b1c1f',
              borderRadius: '4px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#017cff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : (
            <ThumbnailCanvas dragState={dragState} dragCallbacks={dragCallbacks} snapThreshold={snapThreshold} />
          )}
        </div>
        <PropertiesPanel />
      </div>
      <StatusBar />
      <LogoLibraryModal />
    </div>
  );
};
