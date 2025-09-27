import React, { useEffect } from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { DraggableElement } from '../DraggableElement';
import { ICON_LIBRARY } from '../../constants/icons';
import type { LogoIconElementProperties, ThumbnailElement } from '../../types';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

const DraggableIcon: React.FC<{ element: ThumbnailElement; dragCallbacks: DragCallbacks }> = ({ element, dragCallbacks }) => {
  const { selectElement } = useThumbnailStore();
  const props = element.properties as LogoIconElementProperties;

  const handleIconClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Use the element prop directly to avoid store timing issues
    selectElement(element);
  };

  const iconSize = props.size || 48;

  return (
    <DraggableElement
      id={element.id}
      position={element.position}
      zIndex={element.zIndex}
      dragCallbacks={dragCallbacks}
      className="decorative-icon random-icon selectable-element"
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        opacity: props.opacity / 100,
        // Apply rotation only, no translate transforms
        transform: `rotate(${props.rotation}deg)`,
        transformOrigin: '50% 50%', // Rotate around center
      }}
    >
      <div
        data-element-type="icon"
        data-element-name={element.name}
        onClick={handleIconClick}
        dangerouslySetInnerHTML={{ __html: props.src || '' }}
      />
    </DraggableElement>
  );
};

interface IconElementsProps {
  dragCallbacks: DragCallbacks;
}

export const IconElements: React.FC<IconElementsProps> = ({ dragCallbacks }) => {
  const { iconType, iconSize, elements, addElement, removeElement } = useThumbnailStore();

  const iconElements = elements.filter(el => el.type === 'icon');

  // Generate icons when iconType changes
  useEffect(() => {
    // Remove all existing icon elements
    iconElements.forEach(el => removeElement(el.id));

    if (iconType === 'none') return;

    let iconsToUse: string[] = [];

    if (iconType === 'mixed') {
      iconsToUse = [
        ...ICON_LIBRARY.tech.slice(0, 2),
        ...ICON_LIBRARY.shapes.slice(0, 2),
        ...ICON_LIBRARY.arrows.slice(0, 2)
      ];
    } else if (ICON_LIBRARY[iconType]) {
      iconsToUse = ICON_LIBRARY[iconType];
    }

    // Create 4-6 random icons
    const numIcons = Math.floor(Math.random() * 3) + 4; // 4-6 icons

    for (let i = 0; i < numIcons; i++) {
      const randomIcon = iconsToUse[Math.floor(Math.random() * iconsToUse.length)];
      const x = Math.random() * (1280 * 0.9) + (1280 * 0.05); // 5-95% of slide width
      const y = Math.random() * (720 * 0.9) + (720 * 0.05); // 5-95% of slide height
      const rotation = Math.random() * 360; // 0-360 degrees
      const size = iconSize + Math.floor(Math.random() * 16) - 8; // ±8px variation

      const iconElement: ThumbnailElement = {
        id: `icon-${Date.now()}-${i}`,
        type: 'icon',
        name: `Icon ${i + 1}`,
        position: { x, y },
        zIndex: 5000 + i, // Icons start at z-index 5000, increment by 1
        properties: {
          size: size,
          rotation: rotation,
          opacity: 50, // 0.5 opacity for decorative icons
          src: randomIcon,
        }
      };

      addElement(iconElement);
    }
  }, [iconType, iconSize]);

  return (
    <div className="decorative-icons">
      {iconElements.map((element) => (
        <DraggableIcon key={element.id} element={element} dragCallbacks={dragCallbacks} />
      ))}
    </div>
  );
};
