import React from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { ExportButton } from './controls/ExportButton';

export const StatusBar: React.FC = () => {
  const {
    elements,
    selectedElement,
  } = useThumbnailStore();

  const textElements = elements.filter(el => el.type === 'text').length;
  const logoElements = elements.filter(el => el.type === 'logo').length;
  const iconElements = elements.filter(el => el.type === 'icon').length;

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
            {textElements} text, {logoElements} logos, {iconElements} icons
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
      </div>

      <div className="status-bar__center">
        <div className="status-bar__hints">
          <span className="status-bar__hint">
            <kbd>L</kbd> Add Logo
          </span>
          <span className="status-bar__hint">
            <kbd>G</kbd> Grid
          </span>
          <span className="status-bar__hint">
            <kbd>Del</kbd> Remove
          </span>
        </div>
      </div>

      <div className="status-bar__right">
        <ExportButton compact />
      </div>
    </div>
  );
};