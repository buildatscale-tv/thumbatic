import React from 'react';
import { useSlideStore } from '../../store/slideStore';
import type { TextElementProperties } from '../../types';

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

export const TextElements: React.FC = () => {
  const { content, selectElement, selectedElement, elements } = useSlideStore();

  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (element) {
      selectElement(element);
    }
  };

  // Get text elements from store
  const getTextElement = (id: string) => elements.find(el => el.id === id);
  
  const titleBeforeElement = getTextElement('text-title-before');
  const titleHighlightElement = getTextElement('text-title-highlight');
  const titleAfterElement = getTextElement('text-title-after');
  const subtitleElement = getTextElement('text-subtitle');
  const accentLabelElement = getTextElement('text-accent-label');

  const getElementStyle = (element: any) => {
    if (!element) return {};
    
    const props = element.properties as TextElementProperties;
    const isSelected = selectedElement?.id === element.id;
    
    // Special handling for subtitle - don't apply fontSize to wrapper
    const isSubtitle = element.id === 'text-subtitle';
    
    // Calculate contrasting text color
    const textColor = props.backgroundStyle !== 'none' ? getContrastingColor(props.backgroundColor) : undefined;
    
    return {
      ...(!isSubtitle && { fontSize: `${props.fontSize}px` }),
      opacity: props.opacity / 100,
      ...(props.backgroundStyle !== 'none' && {
        '--element-bg-color': props.backgroundColor,
        '--element-text-color': textColor,
        backgroundColor: `${props.backgroundColor} !important`,
        color: `${textColor} !important`,
      }),
      ...(isSelected && {
        outline: '2px solid #007bff',
        outlineOffset: '2px',
      })
    };
  };

  const getSubtitleTextStyle = (element: any) => {
    if (!element) return {};
    
    const props = element.properties as TextElementProperties;
    
    // Calculate contrasting text color for subtitle
    const textColor = props.backgroundStyle !== 'none' ? getContrastingColor(props.backgroundColor) : 'white';
    
    return {
      fontSize: `${props.fontSize}px !important`,
      color: `${textColor} !important`,
      fontWeight: '600',
      display: 'inline-block',
    };
  };

  const getElementClasses = (element: any, baseClass: string) => {
    if (!element) return baseClass;
    
    const props = element.properties as TextElementProperties;
    const isSelected = selectedElement?.id === element.id;
    
    // Debug log for subtitle
    if (element.id === 'text-subtitle') {
      console.log('Subtitle element props:', props);
    }
    
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
    
    return classes;
  };

  return (
    <div className="text-section">
      <div className="title-section">
        <span 
          className={getElementClasses(titleBeforeElement, 'title-before')}
          data-element-type="text" 
          data-element-name="Title Before"
          onClick={(e) => handleElementClick('text-title-before', e)}
          style={{
            ...getElementStyle(titleBeforeElement),
            minHeight: content.titleBefore ? undefined : '20px',
            minWidth: content.titleBefore ? undefined : '20px',
            display: content.titleBefore ? undefined : 'inline-block'
          }}
        >
          {content.titleBefore}
        </span>
        
        <span 
          className={getElementClasses(titleHighlightElement, 'title-highlight')}
          data-element-type="text" 
          data-element-name="Title Highlight"
          onClick={(e) => handleElementClick('text-title-highlight', e)}
          style={getElementStyle(titleHighlightElement)}
        >
          {content.titleHighlight}
        </span>
        
        <span 
          className={getElementClasses(titleAfterElement, 'title-after')}
          data-element-type="text" 
          data-element-name="Title After"
          onClick={(e) => handleElementClick('text-title-after', e)}
          style={{
            ...getElementStyle(titleAfterElement),
            minHeight: content.titleAfter ? undefined : '20px',
            minWidth: content.titleAfter ? undefined : '20px',
            display: content.titleAfter ? undefined : 'inline-block'
          }}
        >
          {content.titleAfter}
        </span>
      </div>
      
      <div 
        className={getElementClasses(subtitleElement, 'subtitle-wrapper')}
        data-element-type="text" 
        data-element-name="Subtitle"
        onClick={(e) => handleElementClick('text-subtitle', e)}
        style={getElementStyle(subtitleElement)}
      >
        <span 
          className="subtitle-text"
          style={getSubtitleTextStyle(subtitleElement)}
        >
          {content.subtitle || 'AI-Powered Development Tool'}
        </span>
      </div>
      
      {content.accentLabel && (
        <div 
          className={getElementClasses(accentLabelElement, 'accent-label')}
          data-element-type="text" 
          data-element-name="Accent Label"
          onClick={(e) => handleElementClick('text-accent-label', e)}
          style={getElementStyle(accentLabelElement)}
        >
          {content.accentLabel}
        </div>
      )}
    </div>
  );
};