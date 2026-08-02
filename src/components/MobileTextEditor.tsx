import React from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';
import type { TextElementProperties } from '../types';
import { registerMobileTextField } from '../utils/mobileTextField';

/**
 * Text editing for touch screens.
 *
 * The canvas editor is a virtual cursor with no editable element, which a phone keyboard
 * cannot reach. This sheet gives a real, visible textarea instead, so selection, the
 * caret, select all, and the space bar cursor gesture all behave the way the phone
 * already does them. The canvas is the preview and updates as you type.
 *
 * The field is uncontrolled on purpose. A controlled value rewrites the DOM on every
 * keystroke and drops the caret back to the start.
 */
export const MobileTextEditor: React.FC = () => {
  const selectedElement = useThumbnailStore(state => state.selectedElement);
  const editingElementId = useThumbnailStore(state => state.editingElementId);
  const updateElementProperties = useThumbnailStore(state => state.updateElementProperties);
  const setEditingElementId = useThumbnailStore(state => state.setEditingElementId);
  const fieldRef = React.useRef<HTMLTextAreaElement>(null);

  const element = selectedElement?.type === 'text' ? selectedElement : null;
  const isOpen = Boolean(element) && editingElementId === element?.id;

  // Keep the shared reference current, so a tap on the canvas can focus this field
  React.useEffect(() => {
    registerMobileTextField(fieldRef.current);
    return () => registerMobileTextField(null);
  }, [element?.id]);

  if (!element) return null;

  const content = (element.properties as TextElementProperties).content || '';

  const close = () => {
    fieldRef.current?.blur();
    setEditingElementId(null);
  };

  return (
    <div className={`mobile-text-editor ${isOpen ? 'mobile-text-editor--open' : ''}`}>
      <div className="mobile-text-editor__header">
        <span className="mobile-text-editor__label">{element.name}</span>
        <button type="button" className="mobile-text-editor__done" onClick={close}>
          Done
        </button>
      </div>
      <textarea
        ref={fieldRef}
        key={element.id}
        className="mobile-text-editor__field"
        defaultValue={content}
        rows={2}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label={`Edit ${element.name} text`}
        onChange={event => updateElementProperties(element.id, { content: event.target.value })}
        onFocus={() => setEditingElementId(element.id)}
      />
    </div>
  );
};
