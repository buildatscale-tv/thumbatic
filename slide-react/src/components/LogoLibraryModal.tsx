import React, { useState, useMemo } from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { LOGO_LIBRARY } from '../constants/logos';
import { Input } from './ui/Input';

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
  const [activeTab, setActiveTab] = useState<'library' | 'url'>('library');

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
            x: 640 + (index % 3 - 1) * 150,
            y: 360 + Math.floor(index / 3) * 150
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
          position: { x: 640, y: 360 },
          zIndex: 5000,
          properties: {
            size: 128,
            rotation: 0,
            opacity: 100,
            src: customUrl,
          },
        });
        setLogoUrl(customUrl);
      }
    }

    setShowLogoLibrary(false);
  };

  const handleCancel = () => {
    setTempSelectedLogos(selectedLogos);
    setCustomUrl(logoUrl);
    setShowLogoLibrary(false);
  };

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
            className={`modal__tab ${activeTab === 'url' ? 'modal__tab--active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            Custom URL
          </button>
        </div>

        <div className="modal__content">
          {activeTab === 'library' ? (
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
              <Input
                type="url"
                label="Logo URL"
                value={customUrl}
                placeholder="Enter logo URL (SVG or PNG recommended)"
                onChange={(e) => setCustomUrl(e.target.value)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                }
              />

              {customUrl && (
                <div className="modal__url-preview">
                  <p>Preview:</p>
                  <div className="modal__url-image">
                    <img
                      src={customUrl}
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