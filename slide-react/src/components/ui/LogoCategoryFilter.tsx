import React from 'react';
import { Badge } from './Badge';

interface LogoCategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  logoCounts: Record<string, number>;
}

export const LogoCategoryFilter: React.FC<LogoCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  logoCounts
}) => {
  const sortedCategories = [...categories].sort();

  return (
    <div className="logo-category-filter">
      <div className="category-header">
        <span className="category-label">Filter by Category:</span>
      </div>
      
      <div className="category-chips">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
        >
          All Categories
          <Badge variant="secondary" className="category-count">
            {Object.values(logoCounts).reduce((sum, count) => sum + count, 0)}
          </Badge>
        </button>
        
        {sortedCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
            <Badge variant="secondary" className="category-count">
              {logoCounts[category] || 0}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
};