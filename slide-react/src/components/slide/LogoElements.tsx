import React from 'react';
import { useDraggable } from '@dnd-kit/core';
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
    data: element,
  });

  const handleLogoClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectElement(element);
  };

  const style = {
    left: `${element.position.x}%`,
    top: `${element.position.y}%`,
    width: `${props.size}px`,
    height: `${props.size}px`,
    opacity: props.opacity / 100,
    transform: `translate(-50%, -50%) rotate(${props.rotation}deg)${
      transform ? ` translate3d(${transform.x}px, ${transform.y}px, 0)` : ''
    }`,
    zIndex: isDragging ? 1000 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      className="random-logo selectable-element"
      data-element-type="logo"
      data-element-name={element.name}
      style={style}
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
          pointerEvents: 'none', // Prevent image from interfering with drag
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
            <DraggableLogo key={element.id} element={element} />
          ))}
        </div>
      )}
    </>
  );
};