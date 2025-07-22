import React, { useState, useMemo } from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { LOGO_LIBRARY } from '../../constants/logos';

export const LogoControls: React.FC = () => {
  const { 
    logoType, 
    logoUrl, 
    selectedLogos, 
    logoSize,
    setLogoType, 
    setLogoUrl, 
    setSelectedLogos, 
    setLogoSize,
    randomizeLogoPositions 
  } = useThumbnailStore();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogos = useMemo(() => {
    if (!searchTerm.trim()) {
      return LOGO_LIBRARY;
    }
    return LOGO_LIBRARY.filter(logo => 
      logo.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleLogoSelection = (logoValue: string, checked: boolean) => {
    if (checked) {
      setSelectedLogos([...selectedLogos, logoValue]);
    } else {
      setSelectedLogos(selectedLogos.filter(url => url !== logoValue));
    }
  };

  return (
    <>
      <div className="input-group">
        <label htmlFor="logoType">Logo Type:</label>
        <select
          id="logoType"
          value={logoType}
          onChange={(e) => setLogoType(e.target.value as 'url' | 'library')}
        >
          <option value="url">Custom URL</option>
          <option value="library">Logo Library</option>
        </select>
      </div>

      {logoType === 'url' && (
        <div className="input-group">
          <label htmlFor="logoUrl">Logo URL:</label>
          <input
            type="url"
            id="logoUrl"
            value={logoUrl}
            placeholder="Enter logo URL (SVG or PNG)"
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>
      )}

      {logoType === 'library' && (
        <div className="input-group">
          <label htmlFor="logoLibrary">
            Select Logos: 
            <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
              {selectedLogos.length} selected, {filteredLogos.length} shown
            </span>
          </label>
          <input
            type="text"
            placeholder="Search logos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <div className="logo-checkboxes">
            {filteredLogos.length > 0 ? (
              filteredLogos.map((logo) => (
                <label key={logo.value}>
                  <input
                    type="checkbox"
                    value={logo.value}
                    checked={selectedLogos.includes(logo.value)}
                    onChange={(e) => handleLogoSelection(logo.value, e.target.checked)}
                  />
                  {logo.label}
                </label>
              ))
            ) : (
              <div style={{ padding: '12px', color: '#666', fontStyle: 'italic' }}>
                No logos found matching "{searchTerm}"
              </div>
            )}
          </div>
          <button 
            type="button" 
            className="randomize-button"
            onClick={randomizeLogoPositions}
          >
            Randomize Positions
          </button>
          <div className="slider-group">
            <label htmlFor="logoSize">Logo Size:</label>
            <input
              type="range"
              id="logoSize"
              min="64"
              max="256"
              step="8"
              value={logoSize}
              onChange={(e) => setLogoSize(parseInt(e.target.value))}
            />
            <span>{logoSize}px</span>
          </div>
        </div>
      )}
    </>
  );
};