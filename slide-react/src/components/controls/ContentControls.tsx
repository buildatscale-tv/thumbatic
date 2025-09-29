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
    selectedElement,
    editingElementId,
    setEditingElementId,
    textSelection,
    setTextSelection,
    setCursorPosition
  } = useThumbnailStore();
  const [newElementType, setNewElementType] = useState<TextElementType>('title');
  const [newElementContent, setNewElementContent] = useState('');
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
    if (editingElementId === elementId) {
      setEditingElementId(null);
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
    setEditingElementId(elementId);
    setTempContent(currentContent);
    // Set initial cursor at end
    setCursorPosition({ elementId, position: currentContent.length });
  };

  const cancelEditing = () => {
    setEditingElementId(null);
    setTempContent('');
    setTextSelection(null); // Clear selection when canceling
    setCursorPosition(null); // Clear cursor position
  };

  const saveEditing = (elementId: string) => {
    if (tempContent.trim()) {
      handleContentChange(elementId, tempContent.trim());
    }
    setEditingElementId(null);
    setTempContent('');
    setTextSelection(null); // Clear selection when saving
    setCursorPosition(null); // Clear cursor position
  };

  // Effect to handle external editing trigger
  React.useEffect(() => {
    if (editingElementId) {
      const element = elements.find(el => el.id === editingElementId);
      if (element && element.type === 'text') {
        const props = element.properties as TextElementProperties;
        setTempContent(props.content || '');
        // Set cursor at end when starting to edit
        setCursorPosition({ elementId: editingElementId, position: props.content?.length || 0 });
      }
    }
  }, [editingElementId, elements, setCursorPosition]);

  const handleKeyPress = (e: React.KeyboardEvent, elementId: string) => {
    if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
      // Cmd+A or Ctrl+A - Select all text
      e.preventDefault();
      setTextSelection({
        elementId,
        start: 0,
        end: tempContent.length
      });
      // Also select the text in the input field
      const input = e.target as HTMLInputElement;
      input.setSelectionRange(0, tempContent.length);
    } else if (e.key === 'Enter') {
      saveEditing(elementId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior

      // Get all text elements sorted by their position (top to bottom)
      const sortedTextElements = textElements.sort((a, b) => {
        // Sort by Y position first, then X position for elements on same line
        const yDiff = a.position.y - b.position.y;
        if (Math.abs(yDiff) < 20) { // Consider elements within 20px as same line
          return a.position.x - b.position.x;
        }
        return yDiff;
      });

      // Find current element index
      const currentIndex = sortedTextElements.findIndex(el => el.id === elementId);

      if (currentIndex !== -1) {
        let nextIndex;
        if (e.shiftKey) {
          // Shift+Tab: Go to previous element
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = sortedTextElements.length - 1; // Wrap to last
          }
        } else {
          // Tab: Go to next element
          nextIndex = currentIndex + 1;
          if (nextIndex >= sortedTextElements.length) {
            nextIndex = 0; // Wrap to first
          }
        }

        // Save current element and start editing the next one
        saveEditing(elementId);
        const nextElement = sortedTextElements[nextIndex];
        const nextProps = nextElement.properties as TextElementProperties;

        // Select and start editing the next element
        selectElement(nextElement);
        setEditingElementId(nextElement.id);
        setTempContent(nextProps.content || '');
        // Set cursor at end of new element
        setCursorPosition({ elementId: nextElement.id, position: nextProps.content?.length || 0 });
      }
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
                            variant="outline"
                            size="sm"
                            className="delete-button"
                            title="Delete element"
                          >
                            ✕
                          </Button>
                        </div>
                        
                        {/* Content Input */}
                        <div className="element-content-input">
                          {editingElementId === element.id ? (
                            <div className="inline-edit-container">
                              <Input
                                type="text"
                                value={tempContent}
                                placeholder={`Enter ${typeOption?.label.toLowerCase()} text`}
                                onChange={(e) => {
                                  setTempContent(e.target.value);
                                  // Clear selection when typing
                                  setTextSelection(null);
                                  // Update properties on every keystroke for live alignment
                                  handleContentChange(element.id, e.target.value);
                                }}
                                onSelect={(e) => {
                                  const input = e.target as HTMLInputElement;
                                  if (input.selectionStart !== input.selectionEnd) {
                                    setTextSelection({
                                      elementId: element.id,
                                      start: input.selectionStart || 0,
                                      end: input.selectionEnd || 0
                                    });
                                  } else {
                                    setTextSelection(null);
                                    // Track cursor position when no selection
                                    setCursorPosition({
                                      elementId: element.id,
                                      position: input.selectionStart || 0
                                    });
                                  }
                                }}
                                onClick={(e) => {
                                  // Track cursor position on click
                                  const input = e.target as HTMLInputElement;
                                  setCursorPosition({
                                    elementId: element.id,
                                    position: input.selectionStart || 0
                                  });
                                }}
                                onKeyUp={(e) => {
                                  // Track cursor position and selection after key events
                                  const input = e.target as HTMLInputElement;

                                  // Check for selection changes (including shift+arrow keys)
                                  if (input.selectionStart !== input.selectionEnd) {
                                    setTextSelection({
                                      elementId: element.id,
                                      start: input.selectionStart || 0,
                                      end: input.selectionEnd || 0
                                    });
                                  } else {
                                    // No selection, just cursor position
                                    setTextSelection(null);
                                    setCursorPosition({
                                      elementId: element.id,
                                      position: input.selectionStart || 0
                                    });
                                  }
                                }}
                                onKeyDown={(e) => handleKeyPress(e, element.id)}
                                className="element-input editing"
                                autoFocus
                              />
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
