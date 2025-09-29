import React from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import type { Theme } from '../../types';

export const ThemeControls: React.FC = () => {
  const { theme, setTheme } = useThumbnailStore();

  return (
    <div className="input-group">
      <label htmlFor="theme">Theme:</label>
      <select
        id="theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
      >
        <option value="claude">Claude Code</option>
        <option value="tech">Tech Blue</option>
        <option value="dark">Dark Mode</option>
      </select>
    </div>
  );
};