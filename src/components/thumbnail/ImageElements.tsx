import React from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { DraggableElement } from '../DraggableElement';
import { IMAGE_LIBRARY } from '../../constants/images';
import type { ImageElementProperties, ThumbnailElement } from '../../types';
import { useImageSrc } from '../../utils/imageUrls';

interface DragCallbacks {
  onDragStart: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd: (elementId: string, position: { x: number; y: number }) => void;
}

const DraggableImage: React.FC<{ element: ThumbnailElement; dragCallbacks: DragCallbacks }> = ({ element, dragCallbacks }) => {
  const { selectElement, updateElementProperties } = useThumbnailStore();
  const props = element.properties as ImageElementProperties;
  // An uploaded image is stored once and referenced by hash, so resolve it for display
  const resolvedSrc = useImageSrc(props.src?.replace('#inverted', ''));

  const handleImageClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Use the element prop directly to avoid store timing issues
    selectElement(element);
  };

  const imageSize = props.size || 64;
  const aspectRatio = props.aspectRatio || 1;

  // Calculate dimensions based on aspect ratio
  // size is used as the height, width is calculated from aspect ratio
  const imageHeight = imageSize;
  const imageWidth = imageSize * aspectRatio;

  // Auto-detect aspect ratio from loaded image
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const naturalAspectRatio = img.naturalWidth / img.naturalHeight;
      // Only update if aspect ratio differs meaningfully from current
      if (Math.abs(naturalAspectRatio - aspectRatio) > 0.05) {
        updateElementProperties(element.id, { aspectRatio: naturalAspectRatio });
      }
    }
  };

  // Check if this image should be inverted
  const imageInfo = IMAGE_LIBRARY.find(image => image.value === props.src);
  const shouldInvert = imageInfo?.invert || false;

  return (
    <DraggableElement
      id={element.id}
      position={element.position}
      zIndex={element.zIndex}
      dragCallbacks={dragCallbacks}
      className="random-image selectable-element"
      style={{
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        opacity: props.opacity / 100,
        touchAction: 'none',
      }}
    >
      <div
        data-element-type="image"
        data-element-name={element.name}
        onClick={handleImageClick}
      >
        <img
          src={resolvedSrc}
          alt={element.name}
          onLoad={handleImageLoad}
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

interface ImageElementsProps {
  dragCallbacks: DragCallbacks;
}

export const ImageElements: React.FC<ImageElementsProps> = ({ dragCallbacks }) => {
  const elements = useThumbnailStore(state => state.elements);
  const imageElements = elements.filter(el => el.type === 'image');

  // Every image element on the canvas is drawn. This used to be gated on a stored mode
  // field, which meant a record missing that field rendered no images at all even though
  // the elements were right there. The elements are the truth about what is on the canvas.
  return (
    <div className="multiple-images">
      {imageElements.map(element => (
        <DraggableImage
          key={element.id}
          element={element}
          dragCallbacks={dragCallbacks}
        />
      ))}
    </div>
  );
};
