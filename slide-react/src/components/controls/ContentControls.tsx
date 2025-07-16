import React from 'react';
import { useSlideStore } from '../../store/slideStore';

export const ContentControls: React.FC = () => {
  const { content, updateContent } = useSlideStore();

  return (
    <>
      <div className="input-group">
        <label htmlFor="titleBefore">Title Before:</label>
        <input
          type="text"
          id="titleBefore"
          value={content.titleBefore}
          placeholder="Text before highlight"
          onChange={(e) => updateContent({ titleBefore: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label htmlFor="titleHighlight">Title Highlight:</label>
        <input
          type="text"
          id="titleHighlight"
          value={content.titleHighlight}
          placeholder="Highlighted text"
          onChange={(e) => updateContent({ titleHighlight: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label htmlFor="titleAfter">Title After:</label>
        <input
          type="text"
          id="titleAfter"
          value={content.titleAfter}
          placeholder="Text after highlight"
          onChange={(e) => updateContent({ titleAfter: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label htmlFor="subtitle">Subtitle:</label>
        <input
          type="text"
          id="subtitle"
          value={content.subtitle}
          placeholder="Enter subtitle"
          onChange={(e) => updateContent({ subtitle: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label htmlFor="accentLabel">Accent Label:</label>
        <input
          type="text"
          id="accentLabel"
          value={content.accentLabel}
          placeholder="e.g., NEW, v2.1, BETA"
          onChange={(e) => updateContent({ accentLabel: e.target.value })}
        />
      </div>
    </>
  );
};