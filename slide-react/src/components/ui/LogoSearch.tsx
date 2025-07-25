import React from 'react';
import { Input } from './Input';

interface LogoSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  resultCount: number;
  totalCount: number;
  placeholder?: string;
}

export const LogoSearch: React.FC<LogoSearchProps> = ({
  searchTerm,
  onSearchChange,
  resultCount,
  totalCount,
  placeholder = "Search logos..."
}) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="logo-search">
      <div className="search-input-wrapper">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          }
          className="search-input"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="clear-search-button"
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="search-results-info">
        {searchTerm ? (
          <span className="results-text">
            {resultCount === 0 ? (
              <span className="no-results">
                No logos found for "{searchTerm}"
              </span>
            ) : (
              <span className="results-count">
                {resultCount} of {totalCount} logos
                {resultCount !== totalCount && (
                  <span className="filtered-indicator"> • Filtered</span>
                )}
              </span>
            )}
          </span>
        ) : (
          <span className="total-count">
            {totalCount} logos available
          </span>
        )}
      </div>
    </div>
  );
};