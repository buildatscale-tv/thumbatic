import React from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { ThumbnailCanvas } from './ThumbnailCanvas';

interface PreviewSize {
  width: number;
  height: number;
  label: string;
}

const previewSizes: PreviewSize[] = [
  { width: 120, height: 68, label: 'Tiny (120×68)' },
  { width: 320, height: 180, label: 'Small (320×180)' },
  { width: 480, height: 270, label: 'Medium (480×270)' },
  { width: 640, height: 360, label: 'Large (640×360)' },
];

export default function PreviewMode() {
  const setPreviewMode = useThumbnailStore((state) => state.setPreviewMode);
  const selectElement = useThumbnailStore((state) => state.selectElement);

  // Clear selection when entering preview
  React.useEffect(() => {
    selectElement(null);
  }, [selectElement]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPreviewMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setPreviewMode]);

  // Dummy drag callbacks for preview (no interaction needed)
  const dummyCallbacks = {
    onDragStart: () => {},
    onDragMove: () => {},
    onDragEnd: () => {},
  };

  return (
    <div className="preview-mode-fullscreen">
      <div className="preview-mode-header">
        <h2>YouTube Thumbnail Preview</h2>
        <button
          className="preview-close-button"
          onClick={() => setPreviewMode(false)}
          aria-label="Close preview"
        >
          ✕
        </button>
      </div>

      <div className="preview-grid">
        {/* Tiny and Small on same row */}
        <div className="preview-row">
          {previewSizes.slice(0, 2).map((size) => {
            const scale = size.width / 1280;
            return (
              <div key={size.label} className="preview-item">
                <div className="preview-label">{size.label}</div>
                <div
                  className="preview-thumbnail-container"
                  style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                  }}
                >
                  <div
                    className="preview-thumbnail-wrapper"
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <div style={{ width: '1280px', height: '720px' }}>
                      <ThumbnailCanvas dragCallbacks={dummyCallbacks} />
                    </div>
                  </div>
                  <div className="preview-timecode">12:34</div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Medium and Large on their own rows */}
        {previewSizes.slice(2).map((size) => {
          const scale = size.width / 1280;
          return (
            <div key={size.label} className="preview-item">
              <div className="preview-label">{size.label}</div>
              <div
                className="preview-thumbnail-container"
                style={{
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                }}
              >
                <div
                  className="preview-thumbnail-wrapper"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <div style={{ width: '1280px', height: '720px' }}>
                    <ThumbnailCanvas dragCallbacks={dummyCallbacks} />
                  </div>
                </div>
                <div className="preview-timecode">12:34</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
