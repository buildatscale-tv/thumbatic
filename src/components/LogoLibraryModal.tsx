import React, { useState, useMemo, useRef } from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { LOGO_LIBRARY } from '../constants/logos';
import { Input } from './ui/Input';
import { prepareImageForStorage, formatBytes } from '../utils/imageStorage';
import {
  deleteImage,
  findImageForSource,
  hashBlob,
  idToImageRef,
  isImageRef,
  listImages,
  putImage,
  rememberSource,
} from '../storage/imageStore';
import type { StoredImage } from '../storage/imageStore';
import { forgetImageUrl, useImageSrc } from '../utils/imageUrls';
import type { PreparedImage } from '../utils/imageStorage';

/** Shows one stored upload, resolving its blob to a URL. */
const UploadPreview: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const src = useImageSrc(idToImageRef(id));
  return src ? <img src={src} alt={name} /> : null;
};

export const LogoLibraryModal: React.FC = () => {
  const {
    showLogoLibrary,
    setShowLogoLibrary,
    logoUrl,
    setLogoUrl,
    selectedLogos,
    setSelectedLogos,
    addElement,
  } = useThumbnailStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tempSelectedLogos, setTempSelectedLogos] = useState<string[]>(selectedLogos);
  const [customUrl, setCustomUrl] = useState(logoUrl);
  const [customAspectRatio, setCustomAspectRatio] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'library' | 'uploads' | 'url'>('library');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<PreparedImage | null>(null);
  const [uploads, setUploads] = useState<StoredImage[]>([]);
  const [reusedExisting, setReusedExisting] = useState(false);
  const dragDepth = useRef(0);

  const isStoredImage = (url: string) => isImageRef(url);
  const previewSrc = useImageSrc(customUrl);
  const fileSizeLabel = imageInfo
    ? `, ${imageInfo.width}x${imageInfo.height}, ${formatBytes(imageInfo.storedBytes)}` +
      (reusedExisting
        ? ' (already in your uploads, stored once)'
        : imageInfo.recompressed
          ? ` (compressed from ${formatBytes(imageInfo.originalBytes)})`
          : '')
    : '';

  // Shared by the file picker and the drop zone
  const readImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError(`"${file.name}" is not an image. Use PNG, JPG, SVG, GIF, or WebP.`);
      return;
    }

    setUploadError(null);

    try {
      // The same file uploaded again is recognised by its hash, so it is neither
      // compressed a second time nor stored a second time.
      const sourceId = await hashBlob(file);
      const knownId = await findImageForSource(sourceId);
      if (knownId) {
        setCustomUrl(idToImageRef(knownId));
        const known = (await listImages()).find(image => image.id === knownId);
        if (known) {
          setCustomAspectRatio(known.height ? known.width / known.height : 1);
          setImageInfo({
            blob: new Blob(),
            aspectRatio: known.height ? known.width / known.height : 1,
            originalBytes: known.bytes,
            storedBytes: known.bytes,
            width: known.width,
            height: known.height,
            recompressed: false,
          });
        }
        setReusedExisting(true);
        await refreshUploads();
        return;
      }

      const prepared = await prepareImageForStorage(file);
      const stored = await putImage(prepared.blob, {
        name: file.name,
        width: prepared.width,
        height: prepared.height,
      });
      await rememberSource(sourceId, stored.id);

      setCustomUrl(idToImageRef(stored.id));
      setCustomAspectRatio(prepared.aspectRatio);
      setImageInfo(prepared);
      setReusedExisting(false);
      await refreshUploads();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : `"${file.name}" could not be read.`);
    }
  };

  const refreshUploads = async () => {
    try {
      setUploads(await listImages());
    } catch {
      setUploads([]);
    }
  };

  const handleDeleteUpload = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteImage(id);
    forgetImageUrl(id);
    if (customUrl === idToImageRef(id)) handleRemoveImage();
    await refreshUploads();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readImageFile(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  };

  // Clears the image everywhere at once: the field, the canvas element, and the
  // saved record. An uploaded file is a data URL, so leaving it behind would keep
  // the whole image in storage.
  const handleRemoveImage = () => {
    setCustomUrl('');
    setCustomAspectRatio(1);
    setUploadError(null);
    setImageInfo(null);
    if (logoUrl) setLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  // Child elements fire dragleave too, so count enters and leaves
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      readImageFile(file);
      return;
    }

    // Some sources drop a URL instead of a file, for example an image in a browser tab
    const droppedUrl = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
    if (droppedUrl) {
      setUploadError(null);
      setImageInfo(null);
      setCustomUrl(droppedUrl.trim());
    }
  };

  React.useEffect(() => {
    if (showLogoLibrary) refreshUploads();
  }, [showLogoLibrary]);

  // Get unique categories and their counts
  const { categories, logoCounts } = useMemo(() => {
    const categorySet = new Set<string>();
    const counts: Record<string, number> = {};

    LOGO_LIBRARY.forEach(logo => {
      categorySet.add(logo.category);
      counts[logo.category] = (counts[logo.category] || 0) + 1;
    });

    return {
      categories: Array.from(categorySet),
      logoCounts: counts
    };
  }, []);

  const filteredLogos = useMemo(() => {
    let filtered = LOGO_LIBRARY;

    if (selectedCategory) {
      filtered = filtered.filter(logo => logo.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(logo =>
        logo.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const handleLogoToggle = (logoValue: string) => {
    setTempSelectedLogos(prev =>
      prev.includes(logoValue)
        ? prev.filter(url => url !== logoValue)
        : [...prev, logoValue]
    );
  };

  const handleAddLogos = () => {
    if (activeTab === 'library') {
      // Add multiple library logos
      tempSelectedLogos.forEach((logoUrl, index) => {
        const logoItem = LOGO_LIBRARY.find(l => l.value === logoUrl);
        if (logoItem) {
          const position = {
            x: 175 + (index * 30), // Stack horizontally with small offset
            y: 550
          };

          addElement({
            id: `logo-${Date.now()}-${index}`,
            type: 'logo',
            name: logoItem.label,
            position,
            zIndex: 5000 + index * 10,
            properties: {
              size: 128,
              rotation: 0,
              opacity: 100,
              src: logoUrl,
            },
          });
        }
      });
      setSelectedLogos(tempSelectedLogos);
    } else {
      // Add custom URL logo
      if (customUrl) {
        addElement({
          id: `logo-custom-${Date.now()}`,
          type: 'logo',
          name: 'Custom Logo',
          position: { x: 175, y: 550 },
          zIndex: 5000,
          properties: {
            size: 128,
            rotation: 0,
            opacity: 100,
            src: customUrl,
            aspectRatio: customAspectRatio,
          },
        });
        setLogoUrl(customUrl);
      }
    }

    setShowLogoLibrary(false);
  };

  const handleCancel = React.useCallback(() => {
    setTempSelectedLogos(selectedLogos);
    setCustomUrl(logoUrl);
    setShowLogoLibrary(false);
  }, [selectedLogos, logoUrl, setShowLogoLibrary]);

  // Handle ESC key to close modal
  React.useEffect(() => {
    if (!showLogoLibrary) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLogoLibrary, handleCancel]);

  if (!showLogoLibrary) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Add Logo</h2>
          <button className="modal__close" onClick={handleCancel}>×</button>
        </div>

        <div className="modal__tabs">
          <button
            className={`modal__tab ${activeTab === 'library' ? 'modal__tab--active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            Logo Library
          </button>
          <button
            className={`modal__tab ${activeTab === 'uploads' ? 'modal__tab--active' : ''}`}
            onClick={() => setActiveTab('uploads')}
          >
            Your Uploads{uploads.length > 0 ? ` (${uploads.length})` : ''}
          </button>
          <button
            className={`modal__tab ${activeTab === 'url' ? 'modal__tab--active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            Custom URL
          </button>
        </div>

        <div className="modal__content">
          {activeTab === 'uploads' ? (
            <div className="modal__uploads">
              {uploads.length === 0 ? (
                <div className="modal__empty">
                  <p>Nothing here yet.</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>
                    Images you upload on the Custom URL tab are kept here, stored once each,
                    ready to reuse in any thumbnail.
                  </p>
                </div>
              ) : (
                <div className="modal__logo-grid">
                  {uploads.map(image => {
                    const reference = idToImageRef(image.id);
                    const isSelected = customUrl === reference;
                    return (
                      <div
                        key={image.id}
                        className={`modal__logo-item ${isSelected ? 'modal__logo-item--selected' : ''}`}
                        onClick={() => {
                          setCustomUrl(reference);
                          setCustomAspectRatio(image.height ? image.width / image.height : 1);
                          setUploadError(null);
                          setImageInfo(null);
                          setReusedExisting(false);
                        }}
                        title={`${image.name}, ${image.width}x${image.height}, ${formatBytes(image.bytes)}`}
                      >
                        <div className="modal__logo-preview">
                          <UploadPreview id={image.id} name={image.name} />
                        </div>
                        <div className="modal__logo-label">{image.name}</div>
                        <div className="modal__upload-meta">{formatBytes(image.bytes)}</div>
                        <button
                          type="button"
                          className="modal__upload-delete"
                          onClick={event => handleDeleteUpload(image.id, event)}
                          title="Delete this upload"
                          aria-label={`Delete ${image.name}`}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'library' ? (
            <>
              <div className="modal__filters">
                <div className="modal__search">
                  <Input
                    type="text"
                    placeholder="Search logos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                    }
                  />
                </div>

                <div className="modal__categories">
                  <button
                    className={`modal__category ${!selectedCategory ? 'modal__category--active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All ({LOGO_LIBRARY.length})
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`modal__category ${selectedCategory === category ? 'modal__category--active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category} ({logoCounts[category]})
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal__selection-info">
                <span>{tempSelectedLogos.length} selected</span>
                {tempSelectedLogos.length > 0 && (
                  <button
                    className="modal__clear"
                    onClick={() => setTempSelectedLogos([])}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="modal__logo-grid">
                {filteredLogos.map(logo => (
                  <div
                    key={logo.value}
                    className={`modal__logo-item ${tempSelectedLogos.includes(logo.value) ? 'modal__logo-item--selected' : ''}`}
                    onClick={() => handleLogoToggle(logo.value)}
                  >
                    <div className="modal__logo-preview">
                      <img
                        src={logo.value}
                        alt={logo.label}
                        style={{ filter: logo.invert ? 'invert(1)' : 'none' }}
                      />
                    </div>
                    <div className="modal__logo-label">{logo.label}</div>
                    {tempSelectedLogos.includes(logo.value) && (
                      <div className="modal__logo-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredLogos.length === 0 && (
                <div className="modal__empty">
                  <p>No logos found matching "{searchTerm}"</p>
                </div>
              )}
            </>
          ) : (
            <div className="modal__url-section">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div
                className={`modal__dropzone ${isDragging ? 'modal__dropzone--active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <svg className="modal__dropzone-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="modal__dropzone-title">
                  {isDragging ? 'Drop the image to use it' : 'Drag an image here, or click to choose a file'}
                </p>
                <p className="modal__dropzone-hint">PNG, JPG, SVG, GIF, or WebP</p>
              </div>

              {uploadError && (
                <p className="modal__dropzone-error" role="alert">{uploadError}</p>
              )}

              <div className="modal__upload-or">
                <span>or</span>
              </div>

              <Input
                type="url"
                label="Logo URL"
                value={customUrl}
                placeholder="Enter logo URL (SVG or PNG recommended)"
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setImageInfo(null);
                  setUploadError(null);
                }}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                }
              />

              {customUrl && (
                <div className="modal__url-preview">
                  <div className="modal__url-preview-header">
                    <p>{isStoredImage(customUrl) ? `Uploaded image${fileSizeLabel}` : 'Preview:'}</p>
                    <button
                      type="button"
                      className="modal__remove-image"
                      onClick={handleRemoveImage}
                      title="Remove this image and clear it from storage"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      Remove
                    </button>
                  </div>
                  <div className="modal__url-image">
                    <img
                      src={previewSrc}
                      alt="Custom logo preview"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'block';
                        target.nextElementSibling?.classList.add('hidden');
                        // Capture aspect ratio from loaded image
                        if (target.naturalWidth && target.naturalHeight) {
                          setCustomAspectRatio(target.naturalWidth / target.naturalHeight);
                        }
                      }}
                    />
                    <div className="modal__url-error hidden">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Failed to load image</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button className="modal__button modal__button--cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="modal__button modal__button--primary"
            onClick={handleAddLogos}
            disabled={activeTab === 'library' ? tempSelectedLogos.length === 0 : !customUrl}
          >
            Add {activeTab === 'library' && tempSelectedLogos.length > 0 && `(${tempSelectedLogos.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
