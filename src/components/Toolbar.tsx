import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useThumbnailStore, createInitialTextElements } from '../store/thumbnailStore';
import type { Theme, TextElementType } from '../types';
import { getStorageAdapter } from '../storage';
import { persistedToState } from '../storage/serialize';
import type { ThumbnailSummary } from '../storage/types';

export const Toolbar: React.FC = () => {
  const {
    theme,
    showGridGuides,
    snappingEnabled,
    centerSnapMode,
    isDrawingArrow,
    thumbnailId,
    thumbnailName,
    setTheme,
    setShowLogoLibrary,
    setShowGridGuides,
    setSnappingEnabled,
    setCenterSnapMode,
    setDrawingArrow,
    addTextElement,
    setThumbnailName,
    setThumbnailId,
    loadPersistedState,
  } = useThumbnailStore();

  const [showTextDropdown, setShowTextDropdown] = useState(false);
  const [showThumbDropdown, setShowThumbDropdown] = useState(false);
  const [thumbnails, setThumbnails] = useState<ThumbnailSummary[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const thumbDropdownRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTextDropdown(false);
      }
      if (thumbDropdownRef.current && !thumbDropdownRef.current.contains(event.target as Node)) {
        setShowThumbDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load thumbnail list when dropdown opens
  const loadThumbnails = useCallback(async () => {
    try {
      const list = await getStorageAdapter().list();
      setThumbnails(list);
    } catch (err) {
      console.error('Failed to load thumbnails:', err);
    }
  }, []);

  const handleShowThumbDropdown = () => {
    if (!showThumbDropdown) {
      loadThumbnails();
    }
    setShowThumbDropdown(!showThumbDropdown);
  };

  const handleCreateNew = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Reset to default state before creating
      loadPersistedState({
        elements: createInitialTextElements(),
        theme: 'claude',
        logoType: 'library',
        logoUrl: '',
        selectedLogos: [],
        logoSize: 256,
        activeTool: 'text',
        showLogoLibrary: false,
        showGridGuides: false,
        snappingEnabled: true,
        centerSnapMode: false,
        previewMode: false,
        thumbnailId: null,
        thumbnailName: 'Untitled Thumbnail',
      });

      const state = useThumbnailStore.getState();
      const newThumb = await getStorageAdapter().create('Untitled Thumbnail', state);
      loadPersistedState(persistedToState(newThumb));
      setShowThumbDropdown(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to create thumbnail');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadThumbnail = async (id: string) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      const thumb = await getStorageAdapter().get(id);
      loadPersistedState(persistedToState(thumb));
      setShowThumbDropdown(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to load thumbnail');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!thumbnailId) {
      // Create new if no ID
      await handleCreateNew();
      return;
    }
    try {
      setIsSaving(true);
      setSaveError(null);
      const state = useThumbnailStore.getState();
      const saved = await getStorageAdapter().save(thumbnailId, state);
      useThumbnailStore.getState().setLastSavedAt(saved.updatedAt);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save thumbnail');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteThumbnail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this thumbnail?')) return;
    try {
      await getStorageAdapter().delete(id);
      setThumbnails(prev => prev.filter(t => t.id !== id));
      if (thumbnailId === id) {
        setThumbnailId(null);
        setThumbnailName('Untitled Thumbnail');
      }
    } catch (err) {
      console.error('Failed to delete thumbnail:', err);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailName(e.target.value);
  };

  const handleNameBlur = () => {
    if (thumbnailId) {
      handleSave();
    }
  };

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
        {/* Thumbnail management */}
        <div className="toolbar__thumbnail-mgmt" ref={thumbDropdownRef} style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              ref={nameInputRef}
              type="text"
              value={thumbnailName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              className="toolbar__name-input"
              placeholder="Thumbnail name..."
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#ddd',
                fontSize: '13px',
                width: '140px',
                outline: 'none',
              }}
            />
            <button
              className="toolbar__icon-button"
              onClick={handleSave}
              disabled={isSaving}
              title="Save thumbnail"
              style={{ opacity: isSaving ? 0.5 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            </button>
            <button
              className="toolbar__icon-button"
              onClick={handleShowThumbDropdown}
              title="Open thumbnail"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </button>
            <button
              className="toolbar__icon-button"
              onClick={handleCreateNew}
              title="New thumbnail"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          {showThumbDropdown && (
            <div
              className="toolbar__dropdown-menu"
              style={{
                right: '0',
                left: 'auto',
                minWidth: '240px',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {thumbnails.length === 0 ? (
                <div className="toolbar__dropdown-item" style={{ opacity: 0.6, cursor: 'default' }}>
                  No saved thumbnails
                </div>
              ) : (
                thumbnails.map(thumb => (
                  <div
                    key={thumb.id}
                    className="toolbar__dropdown-item"
                    onClick={() => handleLoadThumbnail(thumb.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {thumb.name}
                    </span>
                    <button
                      onClick={(e) => handleDeleteThumbnail(thumb.id, e)}
                      className="toolbar__icon-button"
                      style={{ padding: '2px', minWidth: 'auto' }}
                      title="Delete"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          {saveError && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              padding: '4px 8px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              zIndex: 100,
            }}>
              {saveError}
            </div>
          )}
        </div>

        <div className="toolbar__divider" />

        <div className="toolbar__theme">
          <label htmlFor="theme-select" className="toolbar__label">Theme:</label>
          <select
            id="theme-select"
            className="toolbar__select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
          >
            <option value="claude">Claude Code</option>
            <option value="cloudflare">Cloudflare</option>
            <option value="codex">Codex</option>
            <option value="gemini">Gemini</option>
            <option value="pencil">Pencil</option>
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
