import React from 'react';
import { ContentControls } from './controls/ContentControls';
import { LogoControls } from './controls/LogoControls';
import { ThemeControls } from './controls/ThemeControls';
import { IconControls } from './controls/IconControls';
import { ElementPropertiesPanel } from './controls/ElementPropertiesPanel';
import { ExportButton } from './controls/ExportButton';

export const ControlPanel: React.FC = () => {
  return (
    <div className="controls">
      <h1>YouTube Thumbnail Generator</h1>

      <ContentControls />
      <LogoControls />
      <ThemeControls />
      <IconControls />
      <ElementPropertiesPanel />
      <ExportButton />
    </div>
  );
};
