import React from 'react';
import { useSlideStore } from '../../store/slideStore';
import type { Theme, CornerStyle } from '../../types';

export const ThemeControls: React.FC = () => {
  const { theme, cornerStyle, setTheme, setCornerStyle } = useSlideStore();

  return (
    <>
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
          <option value="blueprint">Blueprint Build</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="cornerStyle">Corner Style:</label>
        <select
          id="cornerStyle"
          value={cornerStyle}
          onChange={(e) => setCornerStyle(e.target.value as CornerStyle)}
        >
          <option value="rounded">Rounded</option>
          <option value="sharp">Sharp</option>
        </select>
      </div>
    </>
  );
};