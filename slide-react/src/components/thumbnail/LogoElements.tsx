import React from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { DraggableElement } from '../DraggableElement';
import type { LogoIconElementProperties, ThumbnailElement } from '../../types';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

const DraggableLogo: React.FC<{ element: ThumbnailElement; dragCallbacks: DragCallbacks }> = ({ element, dragCallbacks }) => {
  const { selectElement } = useThumbnailStore();
  const props = element.properties as LogoIconElementProperties;

  const handleLogoClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectElement(element);
  };

  const logoSize = props.size || 64;

  return (
    <DraggableElement
      id={element.id}
      position={element.position}
      dragCallbacks={dragCallbacks}
      className="random-logo selectable-element"
      style={{
        width: `${logoSize}px`,
        height: `${logoSize}px`,
        opacity: props.opacity / 100,
        touchAction: 'none',
      }}
    >
      <div
        data-element-type="logo"
        data-element-name={element.name}
        onClick={handleLogoClick}
      >
        <img
          src={props.src}
          alt={element.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            transform: `rotate(${props.rotation}deg)`,
          }}
        />
      </div>
    </DraggableElement>
  );
};

interface LogoElementsProps {
  dragCallbacks: DragCallbacks;
}

export const LogoElements: React.FC<LogoElementsProps> = ({ dragCallbacks }) => {
  const { logoType, logoUrl, elements } = useThumbnailStore();
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
              dragCallbacks={dragCallbacks}
            />
          ))}
        </div>
      )}
    </>
  );
};
