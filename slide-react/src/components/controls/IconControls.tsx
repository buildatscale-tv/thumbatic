import React from 'react';
import { useSlideStore } from '../../store/slideStore';
import type { IconType } from '../../types';

export const IconControls: React.FC = () => {
  const { 
    iconType, 
    iconSize, 
    setIconType, 
    setIconSize, 
    randomizeIconPositions 
  } = useSlideStore();

  return (
    <div className="input-group">
      <label htmlFor="decorativeIcons">Decorative Icons:</label>
      <select
        id="decorativeIcons"
        value={iconType}
        onChange={(e) => setIconType(e.target.value as IconType)}
      >
        <option value="none">None</option>
        <option value="tech">Tech Icons</option>
        <option value="shapes">Geometric Shapes</option>
        <option value="arrows">Arrows & Lines</option>
        <option value="mixed">Mixed</option>
      </select>
      
      {iconType !== 'none' && (
        <>
          <button 
            type="button" 
            className="randomize-button"
            onClick={randomizeIconPositions}
          >
            Randomize Icons
          </button>
          <div className="slider-group">
            <label htmlFor="iconSize">Icon Size:</label>
            <input
              type="range"
              id="iconSize"
              min="64"
              max="256"
              step="8"
              value={iconSize}
              onChange={(e) => setIconSize(parseInt(e.target.value))}
            />
            <span>{iconSize}px</span>
          </div>
        </>
      )}
    </div>
  );
};