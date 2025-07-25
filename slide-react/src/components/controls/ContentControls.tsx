import React, { useState } from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import type { TextElementType, TextElementProperties } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

export const ContentControls: React.FC = () => {
  const {
    elements,
    updateElementProperties,
    addTextElement,
    removeElement,
    selectElement,
    selectedElement
  } = useThumbnailStore();
  const [newElementType, setNewElementType] = useState<TextElementType>('title');
  const [newElementContent, setNewElementContent] = useState('');
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState<string>('');

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
    if (editingElement === elementId) {
      setEditingElement(null);
    }
  };

  const handleElementClick = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      selectElement(element);
    }
  };

  // Inline editing handlers
  const startEditing = (elementId: string, currentContent: string) => {
    setEditingElement(elementId);
    setTempContent(currentContent);
  };

  const cancelEditing = () => {
    setEditingElement(null);
    setTempContent('');
  };

  const saveEditing = (elementId: string) => {
    if (tempContent.trim()) {
      handleContentChange(elementId, tempContent.trim());
    }
    setEditingElement(null);
    setTempContent('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, elementId: string) => {
    if (e.key === 'Enter') {
      saveEditing(elementId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Text type options with icons and descriptions
  const textTypeOptions = [
    { 
      value: 'title' as TextElementType, 
      label: 'Title', 
      icon: '📢', 
      description: 'Main heading text' 
    },
    { 
      value: 'subtitle' as TextElementType, 
      label: 'Subtitle', 
      icon: '📄', 
      description: 'Secondary text' 
    },
    { 
      value: 'accent-label' as TextElementType, 
      label: 'Accent Label', 
      icon: '🏷️', 
      description: 'Small highlighted text' 
    },
    { 
      value: 'custom' as TextElementType, 
      label: 'Custom', 
      icon: '✏️', 
      description: 'Custom styled text' 
    }
  ];

  const selectedTypeOption = textTypeOptions.find(opt => opt.value === newElementType);

  // Common text templates/presets
  const textTemplates = {
    title: [
      "Ultimate Guide to",
      "How to Master",
      "5 Tips for Better",
      "The Complete Guide",
      "Everything About"
    ],
    subtitle: [
      "Step-by-step tutorial",
      "Beginner's guide",
      "Advanced techniques",
      "Pro tips included",
      "Free course inside"
    ],
    'accent-label': [
      "NEW",
      "UPDATED",
      "FREE",
      "TUTORIAL",
      "GUIDE"
    ],
    custom: [
      "Click here!",
      "Subscribe now",
      "Learn more",
      "Get started",
      "Download free"
    ]
  };

  const handleTemplateSelect = (template: string) => {
    setNewElementContent(template);
  };

  return (
    <div className="content-controls">
      {/* Add Text Element Card */}
      <Card className="add-text-element-card">
        <CardHeader>
          <div className="add-text-header">
            <span className="add-text-icon">➕</span>
            <h3 className="add-text-title">Add Text Element</h3>
          </div>
        </CardHeader>
        <CardContent>
          {/* Text Type Selection */}
          <div className="text-type-selection">
            <label className="selection-label">Choose text type:</label>
            <div className="text-type-grid">
              {textTypeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`text-type-option ${newElementType === option.value ? 'selected' : ''}`}
                  onClick={() => setNewElementType(option.value)}
                  type="button"
                >
                  <span className="option-icon">{option.icon}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="text-content-input">
            <Input
              type="text"
              value={newElementContent}
              placeholder={`Enter ${selectedTypeOption?.label.toLowerCase()} text`}
              onChange={(e) => setNewElementContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddElement()}
              className="content-input"
            />
          </div>

          {/* Text Templates */}
          {textTemplates[newElementType]?.length > 0 && (
            <div className="text-templates">
              <label className="templates-label">Quick templates:</label>
              <div className="templates-grid">
                {textTemplates[newElementType].map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    className="template-chip"
                    onClick={() => handleTemplateSelect(template)}
                    title={`Use template: ${template}`}
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Button */}
          <Button
            onClick={handleAddElement}
            disabled={!newElementContent.trim()}
            variant="primary"
            className="add-element-button"
          >
            <span>Add {selectedTypeOption?.label}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Text Elements List */}
      {textElements.length > 0 && (
        <div className="text-elements-section">
          <h3 className="elements-section-title">Current Text Elements</h3>
          <div className="text-elements-list">
            {textElements.map((element) => {
              const props = element.properties as TextElementProperties;
              const typeOption = textTypeOptions.find(opt => opt.value === props.textType);
              
              return (
                <Card key={element.id} className="text-element-card">
                  <CardContent>
                    <div className="text-element-content">
                      {/* Element Info */}
                      <div className="element-info">
                        <div className="element-header">
                          <Badge variant="secondary" className="element-type-badge">
                            <span className="badge-icon">{typeOption?.icon}</span>
                            {typeOption?.label}
                          </Badge>
                          <Button
                            onClick={() => handleDeleteElement(element.id)}
                            variant="danger"
                            size="sm"
                            className="delete-button"
                            title="Delete element"
                          >
                            🗑️
                          </Button>
                        </div>
                        
                        {/* Content Input */}
                        <div className="element-content-input">
                          {editingElement === element.id ? (
                            <div className="inline-edit-container">
                              <Input
                                type="text"
                                value={tempContent}
                                placeholder={`Enter ${typeOption?.label.toLowerCase()} text`}
                                onChange={(e) => setTempContent(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, element.id)}
                                className="element-input editing"
                                autoFocus
                              />
                              <div className="inline-edit-actions">
                                <Button
                                  onClick={() => saveEditing(element.id)}
                                  variant="primary"
                                  size="sm"
                                  disabled={!tempContent.trim()}
                                >
                                  ✓
                                </Button>
                                <Button
                                  onClick={cancelEditing}
                                  variant="outline"
                                  size="sm"
                                >
                                  ✕
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className={`element-display ${selectedElement?.id === element.id ? 'selected' : ''}`}
                              onClick={() => startEditing(element.id, props.content || '')}
                            >
                              <span className="element-text">
                                {props.content || `Click to add ${typeOption?.label.toLowerCase()} text`}
                              </span>
                              <span className="edit-hint">Click to edit</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Element Actions */}
                        <div className="element-actions">
                          <Button
                            onClick={() => handleElementClick(element.id)}
                            variant={selectedElement?.id === element.id ? "primary" : "outline"}
                            size="sm"
                            className="select-button"
                          >
                            {selectedElement?.id === element.id ? "🎯 Selected" : "🎯 Select"}
                          </Button>
                          {editingElement !== element.id && (
                            <Button
                              onClick={() => startEditing(element.id, props.content || '')}
                              variant="outline"
                              size="sm"
                              className="edit-button"
                            >
                              ✏️ Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
