import React from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { DraggableElement } from '../DraggableElement';
import { LOGO_LIBRARY } from '../../constants/logos';
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
    // Use the element prop directly to avoid store timing issues
    selectElement(element);
  };

  const logoSize = props.size || 64;

  // Check if this logo should be inverted
  const logoInfo = LOGO_LIBRARY.find(logo => logo.value === props.src);
  const shouldInvert = logoInfo?.invert || false;

  return (
    <DraggableElement
      id={element.id}
      position={element.position}
      zIndex={element.zIndex}
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
          src={props.src?.replace('#inverted', '')}
          alt={element.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            transform: `rotate(${props.rotation}deg)`,
            filter: shouldInvert ? 'invert(1)' : 'none',
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
  const { logoType, elements } = useThumbnailStore();
  const logoElements = elements.filter(el => el.type === 'logo');

  return (
    <>
      {/* Custom URL Logo - now draggable */}
      {logoType === 'url' && (
        <div className="multiple-logos">
          {logoElements.filter(el => el.id === 'logo-custom').map((element) => (
            <DraggableLogo
              key={element.id}
              element={element}
              dragCallbacks={dragCallbacks}
            />
          ))}
        </div>
      )}

      {/* Multiple Library Logos */}
      {logoType === 'library' && (
        <div className="multiple-logos">
          {logoElements.filter(el => el.id !== 'logo-custom').map((element) => (
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
