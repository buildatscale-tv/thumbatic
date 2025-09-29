import React, { useState } from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { ICON_LIBRARY } from '../constants/icons';

interface IconOption {
  value: string;
  label: string;
  svg: string;
  category: 'tech' | 'shapes' | 'arrows';
}

// Convert icon library to selectable options
const iconOptions: IconOption[] = [
  ...ICON_LIBRARY.tech.map((svg, index) => ({
    value: `tech-${index}`,
    label: `Tech Icon ${index + 1}`,
    svg,
    category: 'tech' as const
  })),
  ...ICON_LIBRARY.arrows.map((svg, index) => ({
    value: `arrow-${index}`,
    label: `Arrow ${index + 1}`,
    svg,
    category: 'arrows' as const
  }))
  // Shapes are divs, not SVGs, so we'll skip them for now
];

export const IconLibraryModal: React.FC = () => {
  const {
    showIconLibrary,
    setShowIconLibrary,
    addElement,
  } = useThumbnailStore();

  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!showIconLibrary) return null;

  const filteredIcons = selectedCategory
    ? iconOptions.filter(icon => icon.category === selectedCategory)
    : iconOptions;

  const handleConfirm = () => {
    if (selectedIcon) {
      const icon = iconOptions.find(i => i.value === selectedIcon);
      if (icon) {
        // Add icon at a visible position
        addElement({
          id: `icon-${Date.now()}`,
          type: 'icon',
          name: icon.label,
          position: { x: 175, y: 550 },
          zIndex: 5000,
          properties: {
            size: 64,
            rotation: 0,
            opacity: 100,
            src: icon.svg,
            color: '#ffffff'
          },
        });
      }
    }
    setShowIconLibrary(false);
    setSelectedIcon('');
  };

  const handleCancel = () => {
    setShowIconLibrary(false);
    setSelectedIcon('');
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Icon Library</h2>
          <button className="modal__close" onClick={handleCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <div className="icon-library">
            <div className="icon-library__filters">
              <button
                className={`filter-button ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All Icons
              </button>
              <button
                className={`filter-button ${selectedCategory === 'tech' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('tech')}
              >
                Tech
              </button>
              <button
                className={`filter-button ${selectedCategory === 'arrows' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('arrows')}
              >
                Arrows
              </button>
            </div>

            <div className="icon-library__grid">
              {filteredIcons.map((icon) => (
                <div
                  key={icon.value}
                  className={`icon-card ${selectedIcon === icon.value ? 'selected' : ''}`}
                  onClick={() => setSelectedIcon(icon.value)}
                >
                  <div
                    className="icon-card__preview"
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                  />
                  <div className="icon-card__name">{icon.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button className="modal__button modal__button--cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="modal__button modal__button--primary"
            onClick={handleConfirm}
            disabled={!selectedIcon}
          >
            Add Icon
          </button>
        </div>
      </div>
    </div>
  );
};