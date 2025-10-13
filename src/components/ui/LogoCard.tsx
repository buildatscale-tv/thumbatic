import React, { useState } from 'react';
import type { LogoLibraryItem } from '../../types';

interface LogoCardProps {
  logo: LogoLibraryItem;
  isSelected: boolean;
  onToggle: (logoValue: string, checked: boolean) => void;
}

export const LogoCard: React.FC<LogoCardProps> = ({ logo, isSelected, onToggle }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleClick = () => {
    onToggle(logo.value, !isSelected);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div 
      className={`logo-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${logo.label} logo`}
    >
      <div className="logo-preview">
        {imageLoading && !imageError && (
          <div className="logo-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        {!imageError ? (
          <img
            src={logo.value}
            alt={logo.label}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        ) : (
          <div className="logo-error">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </div>
        )}
      </div>
      <div className="logo-info">
        <span className="logo-name">{logo.label}</span>
        {isSelected && (
          <div className="selection-indicator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};