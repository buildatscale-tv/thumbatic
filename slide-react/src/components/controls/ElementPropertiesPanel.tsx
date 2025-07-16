import React from 'react';
import { useSlideStore } from '../../store/slideStore';
import type { TextElementProperties, LogoIconElementProperties } from '../../types';

export const ElementPropertiesPanel: React.FC = () => {
  const { selectedElement, selectElement, updateElementProperties } = useSlideStore();

  if (!selectedElement) {
    return null;
  }

  const handleClearSelection = () => {
    selectElement(null);
  };

  const isTextElement = selectedElement.type === 'text';
  const isLogoIconElement = selectedElement.type === 'logo' || selectedElement.type === 'icon';

  return (
    <div className="element-selection-panel">
      <h3>Selected Element: {selectedElement.name}</h3>
      <button type="button" onClick={handleClearSelection}>
        Clear Selection
      </button>

      {isTextElement && (
        <div className="text-element-properties">
          <div className="slider-group">
            <label htmlFor="elementFontSize">Font Size:</label>
            <input
              type="range"
              id="elementFontSize"
              min="20"
              max="120"
              step="2"
              value={(selectedElement.properties as TextElementProperties).fontSize}
              onChange={(e) => updateElementProperties(selectedElement.id, { 
                fontSize: parseInt(e.target.value) 
              })}
            />
            <span>{(selectedElement.properties as TextElementProperties).fontSize}px</span>
          </div>

          <div className="input-group">
            <label htmlFor="elementBgColor">Background Color:</label>
            <input
              type="color"
              id="elementBgColor"
              value={(selectedElement.properties as TextElementProperties).backgroundColor}
              onChange={(e) => updateElementProperties(selectedElement.id, { 
                backgroundColor: e.target.value 
              })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="elementBgStyle">Background Style:</label>
            <select
              id="elementBgStyle"
              value={(selectedElement.properties as TextElementProperties).backgroundStyle}
              onChange={(e) => updateElementProperties(selectedElement.id, { 
                backgroundStyle: e.target.value as 'none' | 'highlight' | 'drop-shadow'
              })}
            >
              <option value="none">None</option>
              <option value="highlight">Highlight</option>
              <option value="drop-shadow">Drop Shadow</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="elementCornerStyle">Corner Style:</label>
            <select
              id="elementCornerStyle"
              value={(selectedElement.properties as TextElementProperties).cornerStyle}
              onChange={(e) => updateElementProperties(selectedElement.id, { 
                cornerStyle: e.target.value as 'rounded' | 'sharp'
              })}
            >
              <option value="rounded">Rounded</option>
              <option value="sharp">Sharp</option>
            </select>
          </div>

          <div className="slider-group">
            <label htmlFor="elementOpacity">Opacity:</label>
            <input
              type="range"
              id="elementOpacity"
              min="0"
              max="100"
              step="5"
              value={(selectedElement.properties as TextElementProperties).opacity}
              onChange={(e) => updateElementProperties(selectedElement.id, { 
                opacity: parseInt(e.target.value) 
              })}
            />
            <span>{(selectedElement.properties as TextElementProperties).opacity}%</span>
          </div>
        </div>
      )}

      {isLogoIconElement && (
        <div className="logo-element-properties">
          <div className="slider-group">
            <label htmlFor="elementSize">Size:</label>
            <input
              type="range"
              id="elementSize"
              min="32"
              max="512"
              step="8"
              value={(selectedElement.properties as LogoIconElementProperties).size}
              onChange={(e) => updateElementProperties(selectedElement.id, { 
                size: parseInt(e.target.value) 
              })}
            />
            <span>{(selectedElement.properties as LogoIconElementProperties).size}px</span>
          </div>

          <div className="slider-group">
            <label htmlFor="elementRotation">Rotation:</label>
            <input
              type="range"
              id="elementRotation"
              min="-180"
              max="180"
              step="1"
              value={(selectedElement.properties as LogoIconElementProperties).rotation}
              onChange={(e) => updateElementProperties(selectedElement.id, { 
                rotation: parseInt(e.target.value) 
              })}
            />
            <span>{(selectedElement.properties as LogoIconElementProperties).rotation}°</span>
          </div>

          <div className="slider-group">
            <label htmlFor="elementOpacityLogo">Opacity:</label>
            <input
              type="range"
              id="elementOpacityLogo"
              min="0"
              max="100"
              step="5"
              value={(selectedElement.properties as LogoIconElementProperties).opacity}
              onChange={(e) => updateElementProperties(selectedElement.id, { 
                opacity: parseInt(e.target.value) 
              })}
            />
            <span>{(selectedElement.properties as LogoIconElementProperties).opacity}%</span>
          </div>
        </div>
      )}
    </div>
  );
};