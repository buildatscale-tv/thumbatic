import React from 'react';
import type { LogoLibraryItem } from '../../types';
import { LogoCard } from './LogoCard';

interface LogoGridProps {
  logos: LogoLibraryItem[];
  selectedLogos: string[];
  onLogoToggle: (logoValue: string, checked: boolean) => void;
  searchTerm?: string;
}

export const LogoGrid: React.FC<LogoGridProps> = ({ 
  logos, 
  selectedLogos, 
  onLogoToggle,
  searchTerm = ''
}) => {
  if (logos.length === 0) {
    return (
      <div className="logo-grid-empty">
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>No logos found</h3>
          <p>
            {searchTerm 
              ? `No logos match "${searchTerm}". Try a different search term.`
              : 'No logos available in the library.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="logo-grid">
      {logos.map((logo) => (
        <LogoCard
          key={logo.value}
          logo={logo}
          isSelected={selectedLogos.includes(logo.value)}
          onToggle={onLogoToggle}
        />
      ))}
    </div>
  );
};