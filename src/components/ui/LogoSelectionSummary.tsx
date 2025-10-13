import React from 'react';
import { Button } from './Button';

interface LogoSelectionSummaryProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
}

export const LogoSelectionSummary: React.FC<LogoSelectionSummaryProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll
}) => {
  const isAllSelected = selectedCount === totalCount;
  const hasSelection = selectedCount > 0;

  if (!hasSelection && !isAllSelected) {
    return null;
  }

  return (
    <div className="logo-selection-summary">
      <div className="selection-count">
        {selectedCount} of {totalCount} logos selected
      </div>
      
      <div className="selection-actions">
        {hasSelection && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="clear-selection-button"
          >
            Clear Selection
          </Button>
        )}
        
        {!isAllSelected && (
          <Button
            variant="primary"
            size="sm"
            onClick={onSelectAll}
            className="select-all-button"
          >
            Select All
          </Button>
        )}
      </div>
    </div>
  );
};