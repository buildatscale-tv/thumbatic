import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { ContentControls } from './controls/ContentControls';
import { LogoControls } from './controls/LogoControls';
import { ThemeControls } from './controls/ThemeControls';
import { IconControls } from './controls/IconControls';
import { ElementPropertiesPanel } from './controls/ElementPropertiesPanel';
import { ExportButton } from './controls/ExportButton';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="control-section">
      <CardHeader className="control-section__header">
        <button
          className="control-section__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className="control-section__icon">{icon}</span>
          <h3 className="control-section__title">{title}</h3>
          <span className={`control-section__arrow ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export const ControlPanel: React.FC = () => {
  return (
    <div className="controls">
      <header className="controls__header">
        <h1 className="controls__title">YouTube Thumbnail Generator</h1>
        <p className="controls__subtitle">Create professional thumbnails in seconds</p>
      </header>

      <div className="controls__sections">
        <CollapsibleSection title="Content & Text" icon="📝">
          <ContentControls />
        </CollapsibleSection>

        <CollapsibleSection title="Themes & Style" icon="🎨">
          <ThemeControls />
        </CollapsibleSection>

        <CollapsibleSection title="Logos & Branding" icon="🖼️">
          <LogoControls />
        </CollapsibleSection>

        <CollapsibleSection title="Icons & Decorations" icon="✨">
          <IconControls />
        </CollapsibleSection>

        <CollapsibleSection title="Element Properties" icon="🔧" defaultExpanded={false}>
          <ElementPropertiesPanel />
        </CollapsibleSection>

        <div className="controls__export">
          <ExportButton />
        </div>
      </div>
    </div>
  );
};
