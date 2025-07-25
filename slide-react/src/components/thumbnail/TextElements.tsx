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
  const { selectElement, selectedElement } = useThumbnailStore();

  const handleElementClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Use the element prop directly to avoid store timing issues
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
    minHeight: content ? undefined : '20px',
    minWidth: content ? undefined : '50px',
    display: 'inline-block',
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
      dragCallbacks={dragCallbacks}
      className={classes}
      style={style}
      alignment={{
        horizontal: props.horizontalAlign,
        vertical: props.verticalAlign
      }}
    >
      <div
        data-element-type="text"
        data-element-name={element.name}
        onClick={handleElementClick}
      >
        {content || `[${element.name}]`}
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
