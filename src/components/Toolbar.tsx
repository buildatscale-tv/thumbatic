import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useThumbnailStore, createInitialTextElements } from '../store/thumbnailStore';
import type { Theme, TextElementType, TextElementProperties } from '../types';
import { getStorageAdapter } from '../storage';
import { saveCurrentThumbnail, onSaveSuccess } from '../storage/saveCurrent';
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
  const [justSaved, setJustSaved] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const thumbDropdownRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameAtFocusRef = useRef<string>('');

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

  // Flash a green check on the save button after an explicit save
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = onSaveSuccess(() => {
      setJustSaved(true);
      clearTimeout(timer);
      timer = setTimeout(() => setJustSaved(false), 1600);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Drop a pending delete confirmation when the list closes
  useEffect(() => {
    if (!showThumbDropdown) setConfirmDeleteId(null);
  }, [showThumbDropdown]);

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

  // Select the canvas title and highlight its text, so a new thumbnail is visibly
  // created and the next keystroke starts the title.
  const startEditingTitle = () => {
    // Release the button that was clicked. Otherwise Space or Enter presses it again.
    (document.activeElement as HTMLElement | null)?.blur();

    const store = useThumbnailStore.getState();
    const titleElement = store.elements.find(
      el => el.type === 'text' && (el.properties as TextElementProperties).textType === 'title'
    );
    if (!titleElement) return;

    const content = (titleElement.properties as TextElementProperties).content || '';
    store.selectElement(titleElement);
    store.setEditingElementId(titleElement.id);
    store.setTextSelection({ elementId: titleElement.id, start: 0, end: content.length });
    store.setCursorPosition({ elementId: titleElement.id, position: content.length });
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
      startEditingTitle();
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
    try {
      setIsSaving(true);
      setSaveError(null);
      await saveCurrentThumbnail();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save thumbnail');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const handleDeleteThumbnail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
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

  const handleNameFocus = () => {
    nameAtFocusRef.current = thumbnailName;
  };

  const handleNameBlur = () => {
    // Only save when the name really changed. A focus and blur with no edit
    // must not save, because that flashes the save confirmation for nothing.
    if (thumbnailId && thumbnailName !== nameAtFocusRef.current) {
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
            <div className="toolbar__name-field">
              <input
                ref={nameInputRef}
                type="text"
                value={thumbnailName}
                onChange={handleNameChange}
                onFocus={handleNameFocus}
                onBlur={handleNameBlur}
                className="toolbar__name-input"
                placeholder="Thumbnail name..."
              />
              <button
                className={`toolbar__name-caret ${showThumbDropdown ? 'toolbar__name-caret--open' : ''}`}
                onClick={handleShowThumbDropdown}
                title="Show saved thumbnails"
                aria-label="Show saved thumbnails"
                aria-expanded={showThumbDropdown}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
            <button
              className={`toolbar__icon-button ${justSaved ? 'toolbar__icon-button--saved' : ''}`}
              onClick={handleSave}
              disabled={isSaving}
              title={justSaved ? 'Saved' : 'Save thumbnail'}
              style={{ opacity: isSaving ? 0.5 : 1 }}
            >
              {justSaved ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              )}
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
                left: '0',
                right: 'auto',
                minWidth: '280px',
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
                    {confirmDeleteId === thumb.id ? (
                      <span className="toolbar__delete-confirm">
                        <button
                          className="toolbar__delete-confirm-yes"
                          onClick={(e) => handleDeleteThumbnail(thumb.id, e)}
                          title="Confirm delete"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Delete
                        </button>
                        <button
                          className="toolbar__delete-confirm-no"
                          onClick={handleCancelDelete}
                          title="Keep this thumbnail"
                          aria-label="Cancel delete"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleRequestDelete(thumb.id, e)}
                        className="toolbar__icon-button toolbar__delete-button"
                        style={{ padding: '2px', minWidth: 'auto' }}
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
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
