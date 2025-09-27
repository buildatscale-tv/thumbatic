import React from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import type { TextElementProperties, LogoIconElementProperties } from '../../types';
import { Slider } from '../ui/Slider';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const ElementPropertiesPanel: React.FC = () => {
  const { selectedElement, selectElement, updateElementProperties } = useThumbnailStore();

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
      <Card>
        <CardHeader>
          <div className="element-header">
            <h3>Selected Element: {selectedElement.name}</h3>
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isTextElement && (
            <div className="text-element-properties">
              <Input
                label="Content"
                type="text"
                value={(selectedElement.properties as TextElementProperties).content || ''}
                placeholder="Enter text content"
                onChange={(e) => updateElementProperties(selectedElement.id, {
                  content: e.target.value
                })}
              />

              <Slider
                label="Font Size"
                value={(selectedElement.properties as TextElementProperties).fontSize}
                min={20}
                max={120}
                step={2}
                unit="px"
                onChange={(value) => updateElementProperties(selectedElement.id, {
                  fontSize: value
                })}
              />

              <Input
                label="Font Color"
                type="color"
                value={(selectedElement.properties as TextElementProperties).fontColor}
                onChange={(e) => updateElementProperties(selectedElement.id, {
                  fontColor: e.target.value
                })}
              />

              <Input
                label="Background Color"
                type="color"
                value={(selectedElement.properties as TextElementProperties).backgroundColor}
                onChange={(e) => updateElementProperties(selectedElement.id, {
                  backgroundColor: e.target.value
                })}
              />

              <Select
                label="Background Style"
                value={(selectedElement.properties as TextElementProperties).backgroundStyle}
                onChange={(value) => updateElementProperties(selectedElement.id, {
                  backgroundStyle: value as 'none' | 'highlight' | 'drop-shadow'
                })}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'highlight', label: 'Highlight' },
                  { value: 'drop-shadow', label: 'Drop Shadow' }
                ]}
              />

              <Select
                label="Corner Style"
                value={(selectedElement.properties as TextElementProperties).cornerStyle}
                onChange={(value) => updateElementProperties(selectedElement.id, {
                  cornerStyle: value as 'rounded' | 'sharp'
                })}
                options={[
                  { value: 'rounded', label: 'Rounded' },
                  { value: 'sharp', label: 'Sharp' }
                ]}
              />

              <Slider
                label="Rotation"
                value={(selectedElement.properties as TextElementProperties).rotation || 0}
                min={-180}
                max={180}
                step={1}
                unit="°"
                onChange={(value) => updateElementProperties(selectedElement.id, {
                  rotation: value
                })}
              />

              <Slider
                label="Opacity"
                value={(selectedElement.properties as TextElementProperties).opacity}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={(value) => updateElementProperties(selectedElement.id, {
                  opacity: value
                })}
              />

          <div className="input-group">
            <label>Horizontal Alignment:</label>
            <div className="button-group">
              <button
                type="button"
                className={`button-group-item ${(selectedElement.properties as TextElementProperties).horizontalAlign === 'left' ? 'active' : ''}`}
                onClick={() => updateElementProperties(selectedElement.id, { horizontalAlign: 'left' })}
              >
                Left
              </button>
              <button
                type="button"
                className={`button-group-item ${(selectedElement.properties as TextElementProperties).horizontalAlign === 'center' ? 'active' : ''}`}
                onClick={() => updateElementProperties(selectedElement.id, { horizontalAlign: 'center' })}
              >
                Center
              </button>
              <button
                type="button"
                className={`button-group-item ${(selectedElement.properties as TextElementProperties).horizontalAlign === 'right' ? 'active' : ''}`}
                onClick={() => updateElementProperties(selectedElement.id, { horizontalAlign: 'right' })}
              >
                Right
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Vertical Alignment:</label>
            <div className="button-group">
              <button
                type="button"
                className={`button-group-item ${(selectedElement.properties as TextElementProperties).verticalAlign === 'top' ? 'active' : ''}`}
                onClick={() => updateElementProperties(selectedElement.id, { verticalAlign: 'top' })}
              >
                Top
              </button>
              <button
                type="button"
                className={`button-group-item ${(selectedElement.properties as TextElementProperties).verticalAlign === 'middle' ? 'active' : ''}`}
                onClick={() => updateElementProperties(selectedElement.id, { verticalAlign: 'middle' })}
              >
                Middle
              </button>
              <button
                type="button"
                className={`button-group-item ${(selectedElement.properties as TextElementProperties).verticalAlign === 'bottom' ? 'active' : ''}`}
                onClick={() => updateElementProperties(selectedElement.id, { verticalAlign: 'bottom' })}
              >
                Bottom
              </button>
            </div>
          </div>
        </div>
      )}

          {isLogoIconElement && (
            <div className="logo-element-properties">
              <Slider
                label="Size"
                value={(selectedElement.properties as LogoIconElementProperties).size}
                min={32}
                max={512}
                step={8}
                unit="px"
                onChange={(value) => updateElementProperties(selectedElement.id, {
                  size: value
                })}
              />

              <Slider
                label="Rotation"
                value={(selectedElement.properties as LogoIconElementProperties).rotation}
                min={-180}
                max={180}
                step={1}
                unit="°"
                onChange={(value) => updateElementProperties(selectedElement.id, {
                  rotation: value
                })}
              />

              <Slider
                label="Opacity"
                value={(selectedElement.properties as LogoIconElementProperties).opacity}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={(value) => updateElementProperties(selectedElement.id, {
                  opacity: value
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
