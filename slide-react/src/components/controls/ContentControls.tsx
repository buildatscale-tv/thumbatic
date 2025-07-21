import React, { useState } from 'react';
import { useSlideStore } from '../../store/slideStore';
import type { TextElementType, TextElementProperties } from '../../types';

export const ContentControls: React.FC = () => {
  const {
    elements,
    updateElementProperties,
    addTextElement,
    removeElement,
    selectElement
  } = useSlideStore();
  const [newElementType, setNewElementType] = useState<TextElementType>('title');
  const [newElementContent, setNewElementContent] = useState('');

  // Get all text elements
  const textElements = elements.filter(el => el.type === 'text');

  const handleContentChange = (elementId: string, content: string) => {
    updateElementProperties(elementId, { content });
  };

  const handleAddElement = () => {
    if (newElementContent.trim()) {
      addTextElement(newElementType, newElementContent.trim());
      setNewElementContent('');
    }
  };

  const handleDeleteElement = (elementId: string) => {
    removeElement(elementId);
  };

  const handleElementClick = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      selectElement(element);
    }
  };

  return (
    <>
      <div className="section-header">
        <h3>Text Elements</h3>
      </div>

      {/* Add new text element */}
      <div className="input-group">
        <label>Add Text Element:</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <select
            value={newElementType}
            onChange={(e) => setNewElementType(e.target.value as TextElementType)}
            style={{ flex: '0 0 120px' }}
          >
            <option value="title">Title</option>
            <option value="subtitle">Subtitle</option>
            <option value="accent-label">Accent Label</option>
            <option value="custom">Custom</option>
          </select>
          <input
            type="text"
            value={newElementContent}
            placeholder="Enter text content"
            onChange={(e) => setNewElementContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddElement()}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleAddElement}
            disabled={!newElementContent.trim()}
            style={{ flex: '0 0 60px' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* List of existing text elements */}
      {textElements.length > 0 && (
        <div className="text-elements-list">
          <label>Current Text Elements:</label>
          {textElements.map((element) => {
            const props = element.properties as TextElementProperties;
            return (
              <div
                key={element.id}
                className="text-element-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <span
                  style={{
                    flex: '0 0 80px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#666',
                    textTransform: 'capitalize'
                  }}
                >
                  {props.textType.replace('-', ' ')}
                </span>
                <input
                  type="text"
                  value={props.content || ''}
                  placeholder="Enter text content"
                  onChange={(e) => handleContentChange(element.id, e.target.value)}
                  onFocus={() => handleElementClick(element.id)}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => handleDeleteElement(element.id)}
                  style={{
                    flex: '0 0 60px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
