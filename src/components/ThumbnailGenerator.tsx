import React from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { Toolbar } from './Toolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';
import { LogoLibraryModal } from './LogoLibraryModal';
import { MobileTextEditor } from './MobileTextEditor';
import { ThumbnailCanvas } from './ThumbnailCanvas';
import type { ActiveSnap } from '../types/snapping';

const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 720;

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
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);

  // Scale the 1280x720 canvas down when the container is too small for it, so the
  // whole thumbnail stays visible on a phone or a narrow window. Full size stays 1,
  // so nothing changes on a normal desktop window.
  React.useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const fit = () => {
      const style = getComputedStyle(container);
      const availableWidth = container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const availableHeight = container.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const scale = Math.min(1, availableWidth / THUMBNAIL_WIDTH, availableHeight / THUMBNAIL_HEIGHT);
      container.style.setProperty('--canvas-scale', String(scale > 0 ? scale : 1));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="editor-layout">
      <Toolbar />
      <div className="editor-main">
        <div className="canvas-container" ref={canvasContainerRef}>
          <div className="canvas-fit">
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
        </div>
        <PropertiesPanel />
      </div>
      <StatusBar />
      <LogoLibraryModal />
      <MobileTextEditor />
    </div>
  );
};
