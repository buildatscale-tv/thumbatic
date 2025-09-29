import React, { useState } from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import type { Theme, TextElementType } from '../types';

export const Toolbar: React.FC = () => {
  const {
    theme,
    showGridGuides,
    setTheme,
    setShowLogoLibrary,
    setShowGridGuides,
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

  const handleAddIcon = () => {
    // This will open icon selector in the future
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
          className="toolbar__button"
          onClick={handleAddIcon}
          title="Add Icon (I)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>Add Icon</span>
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
            <option value="tech">Tech Blue</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        <div className="toolbar__divider" />

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