import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSlideStore } from '../../store/slideStore';
import type { TextElementProperties, SlideElement } from '../../types';

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

  // Darken by 50% (multiply by 0.5)
  const darkenedR = Math.round(r * 0.5);
  const darkenedG = Math.round(g * 0.5);
  const darkenedB = Math.round(b * 0.5);

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`;
};

// Draggable Text Component (for manual positioning)
const DraggableText: React.FC<{ element: SlideElement }> = ({ element }) => {
  const { selectElement, selectedElement } = useSlideStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: element.id,
    data: element,
  });

  const handleElementClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectElement(element);
  };

  const props = element.properties as TextElementProperties;
  const content = props.content || '';
  const isSelected = selectedElement?.id === element.id;

  // Calculate contrasting text color and shadow color
  const textColor = props.backgroundStyle !== 'none' ? getContrastingColor(props.backgroundColor) : undefined;
  const shadowColor = props.backgroundStyle === 'drop-shadow' ? getDarkenedColor(props.backgroundColor) : undefined;

  const style = {
    position: 'absolute' as const,
    left: `${element.position.x}%`,
    top: `${element.position.y}%`,
    transform: `translate(-50%, -50%) ${CSS.Translate.toString(transform)}`,
    fontSize: `${props.fontSize}px`,
    opacity: props.opacity / 100,
    zIndex: isDragging ? 1000 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
    minHeight: content ? undefined : '20px',
    minWidth: content ? undefined : '50px',
    display: 'inline-block',
    padding: props.backgroundStyle !== 'none' ? '8px 12px' : '4px',
    userSelect: 'none' as const,
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

  if (isDragging) {
    classes += ' dragging';
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={classes}
      data-element-type="text"
      data-element-name={element.name}
      data-element-id={element.id}
      onClick={handleElementClick}
      style={style}
    >
      {content || `[${element.name}]`}
    </div>
  );
};

// Static Text Component (for layout modes)
const StaticText: React.FC<{ element: SlideElement }> = ({ element }) => {
  const { selectElement, selectedElement } = useSlideStore();

  const handleElementClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectElement(element);
  };

  const props = element.properties as TextElementProperties;
  const content = props.content || '';
  const isSelected = selectedElement?.id === element.id;

  // Calculate contrasting text color and shadow color
  const textColor = props.backgroundStyle !== 'none' ? getContrastingColor(props.backgroundColor) : undefined;
  const shadowColor = props.backgroundStyle === 'drop-shadow' ? getDarkenedColor(props.backgroundColor) : undefined;

  const style = {
    fontSize: `${props.fontSize}px`,
    opacity: props.opacity / 100,
    cursor: 'pointer',
    minHeight: content ? undefined : '20px',
    minWidth: content ? undefined : '50px',
    display: 'inline-block',
    padding: props.backgroundStyle !== 'none' ? '8px 12px' : '4px',
    userSelect: 'none' as const,
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
    <span
      className={classes}
      data-element-type="text"
      data-element-name={element.name}
      onClick={handleElementClick}
      style={style}
    >
      {content || `[${element.name}]`}
    </span>
  );
};

export const TextElements: React.FC = () => {
  const { elements, textLayoutMode, gridElementsPerRow } = useSlideStore();

  // Get all text elements from store
  const textElements = elements.filter(el => el.type === 'text');

  // If no layout mode is set, use the old drag-and-drop system
  if (!textLayoutMode) {
    return (
      <>
        {textElements.map((element) => (
          <DraggableText key={element.id} element={element} />
        ))}
      </>
    );
  }

  // Render based on layout mode
  switch (textLayoutMode) {
    case 'inline':
      return (
        <div className="text-section" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          maxWidth: '50%'
        }}>
          {textElements.map((element) => (
            <StaticText key={element.id} element={element} />
          ))}
        </div>
      );

    case 'lines':
      return (
        <div className="text-section" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          maxWidth: '95%'
        }}>
          {textElements.map((element) => (
            <div key={element.id} style={{ textAlign: 'center' }}>
              <StaticText element={element} />
            </div>
          ))}
        </div>
      );

    case 'grid':
      return (
        <div className="text-section" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridElementsPerRow}, 1fr)`,
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          maxWidth: '95%'
        }}>
          {textElements.map((element) => (
            <div key={element.id} style={{ textAlign: 'center' }}>
              <StaticText element={element} />
            </div>
          ))}
        </div>
      );

    default:
      // Fallback to drag-and-drop
      return (
        <>
          {textElements.map((element) => (
            <DraggableText key={element.id} element={element} />
          ))}
        </>
      );
  }
};
