import React, { useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSlideStore } from '../../store/slideStore';
import { ICON_LIBRARY } from '../../constants/icons';
import type { LogoIconElementProperties, SlideElement } from '../../types';

const DraggableIcon: React.FC<{ element: any }> = ({ element }) => {
  const { selectElement } = useSlideStore();
  const props = element.properties as LogoIconElementProperties;

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

  const handleIconClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectElement(element);
  };

  const style = {
    position: 'absolute' as const,
    left: element.position.x,
    top: element.position.y,
    width: `${props.size}px`,
    height: `${props.size}px`,
    opacity: props.opacity / 100,
    transform: `translate(-50%, -50%) rotate(${props.rotation}deg) ${CSS.Translate.toString(transform)}`,
    zIndex: isDragging ? 1000 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      className="decorative-icon random-icon selectable-element"
      data-element-type="icon"
      data-element-name={element.name}
      data-element-id={element.id}
      style={style}
      onClick={handleIconClick}
      {...listeners}
      {...attributes}
      dangerouslySetInnerHTML={{ __html: props.src || '' }}
    />
  );
};

export const IconElements: React.FC = () => {
  const { iconType, iconSize, elements, selectElement, addElement, removeElement } = useSlideStore();

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
      const scale = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
      const size = iconSize + Math.floor(Math.random() * 16) - 8; // ±8px variation

      const iconElement: SlideElement = {
        id: `icon-${Date.now()}-${i}`,
        type: 'icon',
        name: `Icon ${i + 1}`,
        position: { x, y },
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
        <DraggableIcon key={element.id} element={element} />
      ))}
    </div>
  );
};