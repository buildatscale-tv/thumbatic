import React, { useState } from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import type { Theme, TextElementType } from '../types';

export const Toolbar: React.FC = () => {
  const {
    theme,
    showGridGuides,
    snappingEnabled,
    centerSnapMode,
    isDrawingArrow,
    setTheme,
    setShowLogoLibrary,
    setShowGridGuides,
    setSnappingEnabled,
    setCenterSnapMode,
    setDrawingArrow,
    addTextElement,
  } = useThumbnailStore();

  const [showTextDropdown, setShowTextDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTextDropdown(false);
      }
    };

    if (showTextDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTextDropdown]);

  const handleAddText = (textType: TextElementType) => {
    const defaultTexts = {
      'title': 'TITLE TEXT',
      'subtitle': 'Subtitle Text',
      'accent-label': 'Accent Label',
      'custom': 'New Text'
    };
    addTextElement(textType, defaultTexts[textType]);
    setShowTextDropdown(false);
  };

  const handleAddLogo = () => {
    setShowLogoLibrary(true);
  };

  const handleToggleDrawArrow = () => {
    setDrawingArrow(!isDrawingArrow);
  };

  return (
    <div className="toolbar">
      <div className="toolbar__section toolbar__section--add">
        <div className="toolbar__dropdown" ref={dropdownRef}>
          <button
            className="toolbar__button"
            onClick={() => setShowTextDropdown(!showTextDropdown)}
            title="Add Text Element (T)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 7 4 4 20 4 20 7"/>
              <line x1="9" y1="20" x2="15" y2="20"/>
              <line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
            <span>Add Text</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showTextDropdown && (
            <div className="toolbar__dropdown-menu">
              <button onClick={() => handleAddText('title')} className="toolbar__dropdown-item">
                Add Title
              </button>
              <button onClick={() => handleAddText('subtitle')} className="toolbar__dropdown-item">
                Add Subtitle
              </button>
              <button onClick={() => handleAddText('accent-label')} className="toolbar__dropdown-item">
                Add Accent
              </button>
              <button onClick={() => handleAddText('custom')} className="toolbar__dropdown-item">
                Custom Text
              </button>
            </div>
          )}
        </div>

        <button
          className="toolbar__button"
          onClick={handleAddLogo}
          title="Add Logo (L)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>Add Logo</span>
        </button>

        <button
          className={`toolbar__button ${isDrawingArrow ? 'toolbar__button--active' : ''}`}
          onClick={handleToggleDrawArrow}
          title={isDrawingArrow ? 'Cancel drawing (Esc)' : 'Draw Arrow (A)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12H19M19 12L14 7M19 12L14 17"/>
          </svg>
          <span>{isDrawingArrow ? 'Drawing...' : 'Add Arrow'}</span>
        </button>
      </div>

      <div className="toolbar__section toolbar__section--center">
        <div className="toolbar__title">YouTube Thumbnail Generator</div>
      </div>

      <div className="toolbar__section toolbar__section--right">
        <div className="toolbar__theme">
          <label htmlFor="theme-select" className="toolbar__label">Theme:</label>
          <select
            id="theme-select"
            className="toolbar__select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
          >
            <option value="claude">Claude Code</option>
            <option value="tech">Cloudflare</option>
            <option value="dark">Supabase</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        <div className="toolbar__divider" />

        <button
          className={`toolbar__icon-button ${snappingEnabled ? 'toolbar__icon-button--active' : ''}`}
          onClick={() => setSnappingEnabled(!snappingEnabled)}
          title="Toggle Snapping (S)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L12 22M2 12L22 12"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
        </button>

        <button
          className={`toolbar__icon-button ${centerSnapMode ? 'toolbar__icon-button--active' : ''}`}
          onClick={() => {
            if (!centerSnapMode && showGridGuides) {
              setShowGridGuides(false);
            }
            setCenterSnapMode(!centerSnapMode);
          }}
          title="Toggle Center Snap Mode (C)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
        </button>

        <button
          className={`toolbar__icon-button ${showGridGuides ? 'toolbar__icon-button--active' : ''}`}
          onClick={() => setShowGridGuides(!showGridGuides)}
          title="Toggle Grid Guides (G)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
