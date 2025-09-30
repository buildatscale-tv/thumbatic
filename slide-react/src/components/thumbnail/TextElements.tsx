import React from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { DraggableElement } from '../DraggableElement';
import type { TextElementProperties, ThumbnailElement } from '../../types';

// Color brightness detection - for contrasting text colors
const getContrastingColor = (hexColor: string): string => {
  // Remove # if present
  const color = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate brightness
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

  // Return opposing color
  return brightness > 186 ? '#000000' : '#ffffff';
};

// Calculate darkened color for drop shadow (50% darker)
const getDarkenedColor = (hexColor: string): string => {
  // Remove # if present
  const color = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Darken by 60% (multiply by 0.4)
  const darkenedR = Math.round(r * 0.4);
  const darkenedG = Math.round(g * 0.4);
  const darkenedB = Math.round(b * 0.4);

  // Convert to grayscale using luminance formula
  const gray = Math.round(0.299 * darkenedR + 0.587 * darkenedG + 0.114 * darkenedB);

  // Blend original color with gray (25% desaturation = 75% original, 25% gray)
  const desaturatedR = Math.round(darkenedR * 0.75 + gray * 0.25);
  const desaturatedG = Math.round(darkenedG * 0.75 + gray * 0.25);
  const desaturatedB = Math.round(darkenedB * 0.75 + gray * 0.25);

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(desaturatedR)}${toHex(desaturatedG)}${toHex(desaturatedB)}`;
};

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

// Draggable Text Component (for manual positioning)
const DraggableText: React.FC<{ element: ThumbnailElement; dragCallbacks: DragCallbacks }> = ({ element, dragCallbacks }) => {
  const { selectElement, selectedElement, setEditingElementId, editingElementId, textSelection, cursorPosition, setTextSelection, setCursorPosition } = useThumbnailStore();
  const textRef = React.useRef<HTMLDivElement>(null);

  const handleElementClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Use the element prop directly to avoid store timing issues
    selectElement(element);
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const props = element.properties as TextElementProperties;
    const content = props.content || '';

    // If already editing, select word under cursor
    if (editingElementId === element.id && textRef.current) {
      // Calculate character position from click
      const rect = textRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;

      // Measure text to find clicked character
      const measureEl = document.createElement('span');
      measureEl.style.fontSize = `${props.fontSize}px`;
      if (props.textType === 'subtitle') {
        measureEl.style.fontFamily = 'Geist, sans-serif';
        measureEl.style.fontWeight = '600';
      } else {
        measureEl.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
        measureEl.style.fontWeight = '800';
      }
      measureEl.style.visibility = 'hidden';
      measureEl.style.position = 'absolute';
      measureEl.style.whiteSpace = 'pre';

      document.body.appendChild(measureEl);

      // Find character at click position
      let charIndex = 0;
      for (let i = 0; i <= content.length; i++) {
        measureEl.textContent = content.substring(0, i);
        const width = measureEl.offsetWidth;
        if (width >= clickX) {
          charIndex = i;
          break;
        }
        charIndex = i;
      }

      document.body.removeChild(measureEl);

      // Find word boundaries
      const findWordBoundary = (text: string, pos: number, direction: 'left' | 'right') => {
        const wordRegex = /\w/;
        if (direction === 'left') {
          while (pos > 0 && !wordRegex.test(text[pos - 1])) pos--;
          while (pos > 0 && wordRegex.test(text[pos - 1])) pos--;
        } else {
          while (pos < text.length && !wordRegex.test(text[pos])) pos++;
          while (pos < text.length && wordRegex.test(text[pos])) pos++;
        }
        return pos;
      };

      const wordStart = findWordBoundary(content, charIndex, 'left');
      const wordEnd = findWordBoundary(content, charIndex, 'right');

      // Select the word
      setTextSelection({
        elementId: element.id,
        start: wordStart,
        end: wordEnd
      });
      setCursorPosition({
        elementId: element.id,
        position: wordEnd
      });
    } else {
      // Not editing yet - enter edit mode
      selectElement(element);
      setEditingElementId(element.id);
      const contentLength = content.length;
      setCursorPosition({
        elementId: element.id,
        position: contentLength
      });
    }
  };

  const props = element.properties as TextElementProperties;
  const content = props.content || '';
  const isSelected = selectedElement?.id === element.id;
  const isEditing = editingElementId === element.id;
  const hasSelection = textSelection?.elementId === element.id;
  const hasCursor = cursorPosition?.elementId === element.id;

  // Calculate cursor visual position
  const getCursorOffset = React.useMemo(() => {
    if (!hasCursor || !cursorPosition) return 0;

    const textBeforeCursor = content.substring(0, cursorPosition.position);
    if (!textBeforeCursor) return 0;

    // Create a temporary element to measure text width
    const measureEl = document.createElement('span');
    measureEl.style.fontSize = `${props.fontSize}px`;

    // Use the correct font for each text type
    if (props.textType === 'subtitle') {
      measureEl.style.fontFamily = 'Geist, sans-serif';
      measureEl.style.fontWeight = '600';
    } else {
      measureEl.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
      measureEl.style.fontWeight = '800';
    }

    measureEl.style.visibility = 'hidden';
    measureEl.style.position = 'absolute';
    measureEl.style.whiteSpace = 'pre'; // Use 'pre' to preserve spaces
    measureEl.textContent = textBeforeCursor;

    document.body.appendChild(measureEl);
    let width = measureEl.offsetWidth;
    document.body.removeChild(measureEl);

    // Fine-tune cursor position for title (slightly to the right)
    if (props.textType === 'title' && textBeforeCursor.length > 0) {
      // Scale the offset based on how far we are in the text
      const offsetPerChar = 8 / content.length;
      width += offsetPerChar * textBeforeCursor.length;
    }

    return width;
  }, [hasCursor, cursorPosition, content, props.fontSize, props.textType]);

  // Use custom font color, falling back to contrasting color for backgrounds
  const textColor = props.fontColor || (props.backgroundStyle !== 'none' ? getContrastingColor(props.backgroundColor) : '#ffffff');
  const shadowColor = props.backgroundStyle === 'drop-shadow' ? getDarkenedColor(props.backgroundColor) : undefined;

  const style = {
    fontSize: `${props.fontSize}px`,
    color: textColor,
    opacity: props.opacity / 100,
    minHeight: content ? undefined : '20px',
    minWidth: content ? undefined : '50px',
    display: 'inline-block',
    transform: `rotate(${props.rotation || 0}deg)`,
    ...(props.backgroundStyle !== 'none' && {
      '--element-bg-color': props.backgroundColor,
      '--element-text-color': textColor,
      '--element-shadow-color': shadowColor,
    }),
  };

  // Get base class from textType
  const baseClass = props.textType === 'accent-label' ? 'accent-label' :
                   props.textType === 'subtitle' ? 'subtitle' :
                   props.textType === 'title' ? 'title' : 'text-element';

  let classes = `${baseClass} selectable-element`;

  if (props.backgroundStyle !== 'none') {
    classes += ` bg-style-${props.backgroundStyle}`;
  }

  if (props.cornerStyle === 'sharp') {
    classes += ' corner-style-sharp';
  } else {
    classes += ' corner-style-rounded';
  }

  if (isSelected) {
    classes += ' selected';
  }

  return (
    <DraggableElement
      id={element.id}
      position={element.position}
      zIndex={element.zIndex}
      dragCallbacks={dragCallbacks}
      className={classes}
      style={style}
      onClick={handleElementClick}
      onDoubleClick={handleDoubleClick}
      alignment={
        props.horizontalAlign || props.verticalAlign
          ? {
              ...(props.horizontalAlign && { horizontal: props.horizontalAlign }),
              ...(props.verticalAlign && { vertical: props.verticalAlign })
            }
          : undefined
      }
    >
      <div
        data-element-type="text"
        data-element-name={element.name}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        {hasSelection && textSelection && (
          <div
            className="text-selection"
            style={{
              position: 'absolute',
              top: 0,
              left: `${(() => {
                // Calculate selection start position
                const textBeforeSelection = content.substring(0, textSelection.start);
                const measureEl = document.createElement('span');
                measureEl.style.fontSize = `${props.fontSize}px`;

                if (props.textType === 'subtitle') {
                  measureEl.style.fontFamily = 'Geist, sans-serif';
                  measureEl.style.fontWeight = '600';
                } else {
                  measureEl.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
                  measureEl.style.fontWeight = '800';
                }

                measureEl.style.visibility = 'hidden';
                measureEl.style.position = 'absolute';
                measureEl.style.whiteSpace = 'pre'; // Preserve spaces
                measureEl.textContent = textBeforeSelection;

                document.body.appendChild(measureEl);
                let startPos = measureEl.offsetWidth;
                document.body.removeChild(measureEl);

                // Apply title offset if needed
                if (props.textType === 'title' && textBeforeSelection.length > 0) {
                  const offsetPerChar = 8 / content.length;
                  startPos += offsetPerChar * textBeforeSelection.length;
                }

                return startPos;
              })()}px`,
              width: `${(() => {
                // Calculate selection width
                const selectedText = content.substring(textSelection.start, textSelection.end);
                const measureEl = document.createElement('span');
                measureEl.style.fontSize = `${props.fontSize}px`;

                if (props.textType === 'subtitle') {
                  measureEl.style.fontFamily = 'Geist, sans-serif';
                  measureEl.style.fontWeight = '600';
                } else {
                  measureEl.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
                  measureEl.style.fontWeight = '800';
                }

                measureEl.style.visibility = 'hidden';
                measureEl.style.position = 'absolute';
                measureEl.style.whiteSpace = 'pre'; // Preserve spaces
                measureEl.textContent = selectedText;

                document.body.appendChild(measureEl);
                let width = measureEl.offsetWidth;
                document.body.removeChild(measureEl);

                return width;
              })()}px`,
              bottom: 0,
              backgroundColor: textColor,
              opacity: 1,
              pointerEvents: 'none',
              borderRadius: props.cornerStyle === 'rounded' ? '2px' : '0',
              zIndex: -1
            }}
          />
        )}
        <span ref={textRef} style={{ position: 'relative', whiteSpace: 'nowrap' }}>
          {hasSelection && textSelection ? (
            <>
              {/* Text before selection */}
              <span>{content.substring(0, textSelection.start)}</span>
              {/* Selected text - use background color when text has background, otherwise use contrasting color */}
              <span style={{
                color: props.backgroundStyle !== 'none' ? props.backgroundColor : '#000000',
                position: 'relative',
                zIndex: 1
              }}>
                {content.substring(textSelection.start, textSelection.end)}
              </span>
              {/* Text after selection */}
              <span>{content.substring(textSelection.end)}</span>
            </>
          ) : (
            content || (isEditing ? '\u00A0' : '')
          )}
        </span>
        {isEditing && !hasSelection && hasCursor && (
          <span
            className="text-cursor"
            style={{
              position: 'absolute',
              left: `${getCursorOffset}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2px',
              height: '1.2em',
              backgroundColor: textColor,
              animation: 'blink 1s infinite',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    </DraggableElement>
  );
};


interface TextElementsProps {
  dragCallbacks: DragCallbacks;
}

export const TextElements: React.FC<TextElementsProps> = ({ dragCallbacks }) => {
  const { elements } = useThumbnailStore();

  // Get all text elements from store
  const textElements = elements.filter(el => el.type === 'text');

  // Always use draggable text elements with grid snapping
  return (
    <>
      {textElements.map((element) => (
        <DraggableText key={element.id} element={element} dragCallbacks={dragCallbacks} />
      ))}
    </>
  );
};
