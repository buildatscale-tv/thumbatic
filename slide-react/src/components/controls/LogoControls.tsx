import React, { useState, useMemo } from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { LOGO_LIBRARY } from '../../constants/logos';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LogoGrid } from '../ui/LogoGrid';
import { LogoSearch } from '../ui/LogoSearch';
import { LogoSelectionSummary } from '../ui/LogoSelectionSummary';
import { LogoCategoryFilter } from '../ui/LogoCategoryFilter';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories and their counts
  const { categories, logoCounts } = useMemo(() => {
    const categorySet = new Set<string>();
    const counts: Record<string, number> = {};
    
    LOGO_LIBRARY.forEach(logo => {
      categorySet.add(logo.category);
      counts[logo.category] = (counts[logo.category] || 0) + 1;
    });
    
    return {
      categories: Array.from(categorySet),
      logoCounts: counts
    };
  }, []);

  const filteredLogos = useMemo(() => {
    let filtered = LOGO_LIBRARY;
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(logo => logo.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(logo => 
        logo.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchTerm, selectedCategory]);

  const handleLogoSelection = (logoValue: string, checked: boolean) => {
    if (checked) {
      setSelectedLogos([...selectedLogos, logoValue]);
    } else {
      setSelectedLogos(selectedLogos.filter(url => url !== logoValue));
    }
  };

  const handleClearSelection = () => {
    setSelectedLogos([]);
  };

  const handleSelectAll = () => {
    const allFilteredLogos = filteredLogos.map(logo => logo.value);
    const newSelection = [...new Set([...selectedLogos, ...allFilteredLogos])];
    setSelectedLogos(newSelection);
  };

  const handleSelectVisible = () => {
    const visibleLogos = filteredLogos.map(logo => logo.value);
    setSelectedLogos(visibleLogos);
  };

  return (
    <div className="logo-controls">
      <Card>
        <CardHeader>
          <div className="logo-type-header">
            <h3>Logo Configuration</h3>
            <Select
              value={logoType}
              onChange={(value) => setLogoType(value as 'url' | 'library')}
              options={[
                { value: 'url', label: 'Custom URL' },
                { value: 'library', label: 'Logo Library' }
              ]}
            />
          </div>
        </CardHeader>

        <CardContent>
          {logoType === 'url' && (
            <div className="custom-logo-section">
              <Input
                type="url"
                label="Logo URL"
                value={logoUrl}
                placeholder="Enter logo URL (SVG or PNG recommended)"
                onChange={(e) => setLogoUrl(e.target.value)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                }
              />
              {logoUrl && (
                <div className="custom-logo-preview">
                  <div className="preview-label">Preview:</div>
                  <div className="preview-container">
                    <img 
                      src={logoUrl} 
                      alt="Custom logo preview" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'block';
                        target.nextElementSibling?.classList.add('hidden');
                      }}
                    />
                    <div className="preview-error">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                      <span>Failed to load image</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {logoType === 'library' && (
            <div className="logo-library-section">
              <LogoCategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                logoCounts={logoCounts}
              />

              <LogoSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                resultCount={filteredLogos.length}
                totalCount={selectedCategory ? logoCounts[selectedCategory] || 0 : LOGO_LIBRARY.length}
              />

              <LogoSelectionSummary
                selectedCount={selectedLogos.length}
                totalCount={filteredLogos.length}
                onClearSelection={handleClearSelection}
                onSelectAll={searchTerm || selectedCategory ? handleSelectVisible : handleSelectAll}
              />

              <LogoGrid
                logos={filteredLogos}
                selectedLogos={selectedLogos}
                onLogoToggle={handleLogoSelection}
                searchTerm={searchTerm}
              />

              <div className="logo-actions">
                <Button
                  variant="outline"
                  onClick={randomizeLogoPositions}
                  disabled={selectedLogos.length === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M16 3h5v5"/>
                    <path d="m21 3-5 5"/>
                    <path d="M8 21H3v-5"/>
                    <path d="m3 21 5-5"/>
                    <path d="m21 8-5 5"/>
                    <path d="m8 3 5 5"/>
                  </svg>
                  Randomize Positions
                </Button>
              </div>

              <div className="logo-size-control">
                <label className="size-label">
                  Logo Size: <span className="size-value">{logoSize}px</span>
                </label>
                <input
                  type="range"
                  min="64"
                  max="256"
                  step="8"
                  value={logoSize}
                  onChange={(e) => setLogoSize(parseInt(e.target.value))}
                  className="size-slider"
                />
                <div className="size-range">
                  <span>64px</span>
                  <span>256px</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};