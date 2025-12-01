import React from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { ExportButton } from './controls/ExportButton';

export const StatusBar: React.FC = () => {
  const {
    elements,
    selectedElement,
    snappingEnabled,
    centerSnapMode,
    showGridGuides,
  } = useThumbnailStore();

  const textElements = elements.filter(el => el.type === 'text').length;
  const logoElements = elements.filter(el => el.type === 'logo').length;
  const arrowElements = elements.filter(el => el.type === 'arrow').length;

  return (
    <div className="status-bar">
      <div className="status-bar__left">
        <div className="status-bar__info">
          <span className="status-bar__label">Canvas:</span>
          <span className="status-bar__value">1280 × 720</span>
        </div>
        <div className="status-bar__divider" />
        <div className="status-bar__info">
          <span className="status-bar__label">Elements:</span>
          <span className="status-bar__value">
            {textElements} text, {logoElements} logos, {arrowElements} arrows
          </span>
        </div>
        {selectedElement && (
          <>
            <div className="status-bar__divider" />
            <div className="status-bar__info">
              <span className="status-bar__label">Selected:</span>
              <span className="status-bar__value">{selectedElement.name}</span>
            </div>
          </>
        )}
        <div className="status-bar__divider" />
        <div className="status-bar__info">
          <span className="status-bar__label">Snap:</span>
          <span className="status-bar__value">
            {!snappingEnabled ? 'Disabled' : showGridGuides ? 'Grid' : centerSnapMode ? 'Center' : 'Neighbor'}
          </span>
        </div>
      </div>

      <div className="status-bar__center">
        <div className="status-bar__hints">
          <div className="status-bar__hint-group">
            <span className="status-bar__hint">
              <kbd>L</kbd> Logo
            </span>
            <span className="status-bar__hint">
              <kbd>I</kbd> Icon
            </span>
          </div>
          <div className="status-bar__hint-group">
            <span className="status-bar__hint">
              <kbd>S</kbd> Snap
            </span>
            <span className="status-bar__hint">
              <kbd>C</kbd> Center
            </span>
            <span className="status-bar__hint">
              <kbd>G</kbd> Grid
            </span>
          </div>
          <div className="status-bar__hint-group">
            <span className="status-bar__hint">
              <kbd>Del</kbd> Remove
            </span>
          </div>
          <div className="status-bar__hint-group">
            <span className="status-bar__hint">
              <kbd>P</kbd> Preview
            </span>
            <span className="status-bar__hint">
              <kbd>D</kbd> Download
            </span>
          </div>
        </div>
      </div>

      <div className="status-bar__right">
        <button
          className="status-bar__button"
          onClick={() => useThumbnailStore.getState().setPreviewMode(true)}
          title="Preview thumbnail at YouTube sizes"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Preview</span>
        </button>
        <ExportButton compact />
      </div>
    </div>
  );
};
