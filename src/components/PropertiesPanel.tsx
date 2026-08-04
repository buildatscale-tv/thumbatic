import React from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import { usePropertiesSheetOpen } from '../utils/propertiesSheet';
import { Slider } from './ui/Slider';
import { Select } from './ui/Select';
import type { TextElementProperties, ImageElementProperties, ArrowElementProperties } from '../types';

export const PropertiesPanel: React.FC = () => {
  const {
    selectedElement,
    updateElementProperties,
    removeElement,
  } = useThumbnailStore();
  // On a narrow screen this panel is a sheet at the bottom, and the class raises it
  const isOpen = usePropertiesSheetOpen();

  if (!selectedElement) {
    return (
      <div className="properties-panel">
        <div className="properties-panel__header">
          <h3>Properties</h3>
        </div>
        <div className="properties-panel__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: string | number | boolean) => {
    updateElementProperties(selectedElement.id, { [property]: value });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this element?')) {
      removeElement(selectedElement.id);
    }
  };

  return (
    <div className={`properties-panel ${isOpen ? 'properties-panel--open' : ''}`}>
      <div className="properties-panel__header">
        <h3>Properties</h3>
        <button
          className="properties-panel__close"
          onClick={() => useThumbnailStore.getState().selectElement(null)}
          title="Deselect"
        >
          ×
        </button>
      </div>

      <div className="properties-panel__content">
        <div className="properties-panel__section">
          <div className="properties-panel__field">
            <label>Element Type</label>
            <div className="properties-panel__type">
              {selectedElement.type === 'text' && '📝 Text'}
              {selectedElement.type === 'image' && '🖼️ Image'}
              {selectedElement.type === 'arrow' && '➡️ Arrow'}
            </div>
          </div>

          <div className="properties-panel__field">
            <label>Name</label>
            <div className="properties-panel__name">{selectedElement.name}</div>
          </div>
        </div>

        {selectedElement.type === 'text' && (
          <TextProperties
            properties={selectedElement.properties as TextElementProperties}
            onChange={handlePropertyChange}
          />
        )}

        {selectedElement.type === 'image' && (
          <ImageProperties
            properties={selectedElement.properties as ImageElementProperties}
            onChange={handlePropertyChange}
          />
        )}

        {selectedElement.type === 'arrow' && (
          <ArrowProperties
            properties={selectedElement.properties as ArrowElementProperties}
            onChange={handlePropertyChange}
          />
        )}

        <div className="properties-panel__section">
          <div className="properties-panel__field">
            <label>Position</label>
            <div className="properties-panel__position">
              <div className="properties-panel__coord">
                <span>X:</span>
                <input
                  type="number"
                  value={Math.round(selectedElement.position.x)}
                  onChange={(e) => {
                    const newX = parseInt(e.target.value) || 0;
                    useThumbnailStore.getState().updateElementPosition(
                      selectedElement.id,
                      { x: newX, y: selectedElement.position.y }
                    );
                  }}
                />
              </div>
              <div className="properties-panel__coord">
                <span>Y:</span>
                <input
                  type="number"
                  value={Math.round(selectedElement.position.y)}
                  onChange={(e) => {
                    const newY = parseInt(e.target.value) || 0;
                    useThumbnailStore.getState().updateElementPosition(
                      selectedElement.id,
                      { x: selectedElement.position.x, y: newY }
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <div className="properties-panel__field">
            <label>Z-Index</label>
            <input
              type="number"
              className="properties-panel__input"
              value={selectedElement.zIndex}
              onChange={(e) => {
                const newZ = parseInt(e.target.value) || 0;
                useThumbnailStore.getState().updateElementZIndex(selectedElement.id, newZ);
              }}
            />
          </div>
        </div>

        <div className="properties-panel__actions">
          <button
            className="properties-panel__delete"
            onClick={handleDelete}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete Element
          </button>
        </div>
      </div>
    </div>
  );
};

interface TextPropertiesProps {
  properties: TextElementProperties;
  onChange: (property: string, value: string | number | boolean) => void;
}

const TextProperties: React.FC<TextPropertiesProps> = ({ properties, onChange }) => {
  return (
    <>
      <div className="properties-panel__section">
        <h4>Text Properties</h4>

        <div className="properties-panel__field">
          <label>Content</label>
          <textarea
            className="properties-panel__textarea"
            value={properties.content}
            onChange={(e) => onChange('content', e.target.value)}
            rows={3}
          />
        </div>

        <div className="properties-panel__field">
          <Slider
            label="Font Size"
            value={properties.fontSize}
            min={20}
            max={200}
            step={4}
            unit="px"
            onChange={(value) => onChange('fontSize', value)}
          />
        </div>

        {/* Line spacing - only show for multi-line text */}
        {properties.content.includes('\n') && (
          <div className="properties-panel__field">
            <Slider
              label="Line Spacing"
              value={properties.lineSpacing ?? -15}
              min={-30}
              max={20}
              step={1}
              unit="px"
              onChange={(value) => onChange('lineSpacing', value)}
            />
          </div>
        )}

        <div className="properties-panel__field">
          <label>Font Color</label>
          <div className="properties-panel__color-input">
            <input
              type="color"
              value={properties.fontColor}
              onChange={(e) => onChange('fontColor', e.target.value)}
            />
            <input
              type="text"
              value={properties.fontColor}
              onChange={(e) => onChange('fontColor', e.target.value)}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        <div className="properties-panel__field">
          <label>Background Color</label>
          <div className="properties-panel__color-input">
            <input
              type="color"
              value={properties.backgroundColor}
              onChange={(e) => onChange('backgroundColor', e.target.value)}
            />
            <input
              type="text"
              value={properties.backgroundColor}
              onChange={(e) => onChange('backgroundColor', e.target.value)}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        <div className="properties-panel__field">
          <Select
            label="Background Style"
            value={properties.backgroundStyle}
            onChange={(value) => onChange('backgroundStyle', value)}
            options={[
              { value: 'none', label: 'None' },
              { value: 'highlight', label: 'Highlight' },
              { value: 'drop-shadow', label: 'Drop Shadow' },
            ]}
          />
        </div>

        <div className="properties-panel__field">
          <Select
            label="Corner Style"
            value={properties.cornerStyle}
            onChange={(value) => onChange('cornerStyle', value)}
            options={[
              { value: 'rounded', label: 'Rounded' },
              { value: 'sharp', label: 'Sharp' },
            ]}
          />
        </div>

        <div className="properties-panel__field">
          <Select
            label="Alignment"
            value={properties.horizontalAlign || 'center'}
            onChange={(value) => onChange('horizontalAlign', value)}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </div>
      </div>

      <div className="properties-panel__section">
        <h4>Transform</h4>

        <div className="properties-panel__field">
          <Slider
            label="Rotation"
            value={properties.rotation}
            min={-45}
            max={45}
            step={1}
            unit="°"
            onChange={(value) => onChange('rotation', value)}
          />
        </div>

        <div className="properties-panel__field">
          <Slider
            label="Opacity"
            value={properties.opacity}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(value) => onChange('opacity', value)}
          />
        </div>
      </div>
    </>
  );
};

interface ImagePropertiesProps {
  properties: ImageElementProperties;
  onChange: (property: string, value: string | number | boolean) => void;
}

const ImageProperties: React.FC<ImagePropertiesProps> = ({ properties, onChange }) => {
  return (
    <>
      <div className="properties-panel__section">
        <h4>Appearance</h4>

        <div className="properties-panel__field">
          <Slider
            label="Size"
            value={properties.size}
            min={32}
            max={1024}
            step={8}
            unit="px"
            onChange={(value) => onChange('size', value)}
          />
        </div>

        <div className="properties-panel__field">
          <Slider
            label="Rotation"
            value={properties.rotation}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(value) => onChange('rotation', value)}
          />
        </div>

        <div className="properties-panel__field">
          <Slider
            label="Opacity"
            value={properties.opacity}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(value) => onChange('opacity', value)}
          />
        </div>

        {properties.src && (
          <div className="properties-panel__field">
            <label>Source</label>
            <div className="properties-panel__preview">
              <img src={properties.src} alt="Element preview" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

interface ArrowPropertiesProps {
  properties: ArrowElementProperties;
  onChange: (property: string, value: string | number | boolean) => void;
}

const ArrowProperties: React.FC<ArrowPropertiesProps> = ({ properties, onChange }) => {
  return (
    <>
      <div className="properties-panel__section">
        <h4>Arrow Style</h4>

        <div className="properties-panel__field">
          <label>Color</label>
          <div className="properties-panel__color-input">
            <input
              type="color"
              value={properties.color}
              onChange={(e) => onChange('color', e.target.value)}
            />
            <input
              type="text"
              value={properties.color}
              onChange={(e) => onChange('color', e.target.value)}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        <div className="properties-panel__field">
          <Slider
            label="Stroke Width"
            value={properties.strokeWidth}
            min={36}
            max={48}
            step={2}
            unit="px"
            onChange={(value) => onChange('strokeWidth', value)}
          />
        </div>

        <div className="properties-panel__field">
          <Slider
            label="Opacity"
            value={properties.opacity}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(value) => onChange('opacity', value)}
          />
        </div>
      </div>

      <div className="properties-panel__section">
        <h4>Arrowheads</h4>

        <div className="properties-panel__field">
          <div className="properties-panel__checkbox-row">
            <label className="properties-panel__checkbox-label">
              <input
                type="checkbox"
                checked={properties.arrowheadStart}
                onChange={(e) => onChange('arrowheadStart', e.target.checked)}
              />
              <span>Start</span>
            </label>
            <label className="properties-panel__checkbox-label">
              <input
                type="checkbox"
                checked={properties.arrowheadEnd}
                onChange={(e) => onChange('arrowheadEnd', e.target.checked)}
              />
              <span>End</span>
            </label>
          </div>
        </div>

        <div className="properties-panel__field">
          <label>Style</label>
          <div className="properties-panel__button-group">
            {(['filled', 'sharp', 'rounded'] as const).map((style) => (
              <button
                key={style}
                className={`properties-panel__style-btn ${properties.arrowheadStyle === style ? 'active' : ''}`}
                onClick={() => onChange('arrowheadStyle', style)}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
