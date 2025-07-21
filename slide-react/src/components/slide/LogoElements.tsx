import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSlideStore } from '../../store/slideStore';
import type { LogoIconElementProperties } from '../../types';

const DraggableLogo: React.FC<{ element: any }> = ({ element }) => {
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
  });

  const handleLogoClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectElement(element);
  };

  return (
    <div
      ref={setNodeRef}
      className="random-logo selectable-element"
      data-element-type="logo"
      data-element-name={element.name}
      data-element-id={element.id}
      style={{
        position: 'absolute',
        left: element.position.x || 0,
        top: element.position.y || 0,
        width: `${props.size}px`,
        height: `${props.size}px`,
        opacity: isDragging ? 0.5 : props.opacity / 100,
        transform: CSS.Translate.toString(transform),
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 1,
        touchAction: 'none',
      }}
      onClick={handleLogoClick}
      {...listeners}
      {...attributes}
    >
      <img
        src={props.src}
        alt={element.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export const LogoElements: React.FC = () => {
  const { logoType, logoUrl, elements } = useSlideStore();
  const logoElements = elements.filter(el => el.type === 'logo');

  return (
    <>
      {/* Custom URL Logo */}
      {logoType === 'url' && logoUrl && (
        <div className="logo-section">
          <div className="custom-logo">
            <img
              src={logoUrl}
              alt="Logo"
              width="80"
              height="80"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* Multiple Library Logos */}
      {logoType === 'library' && (
        <div className="multiple-logos">
          {logoElements.map((element) => (
            <DraggableLogo 
              key={element.id} 
              element={element}
            />
          ))}
        </div>
      )}
    </>
  );
};
