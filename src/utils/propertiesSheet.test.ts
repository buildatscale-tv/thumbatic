import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePropertiesSheetOpen } from './propertiesSheet';
import { useThumbnailStore } from '../store/thumbnailStore';

const element = {
  id: 'text-title',
  type: 'text' as const,
  name: 'Title',
  position: { x: 640, y: 188 },
  zIndex: 5000,
  properties: { content: 'TITLE' },
};

beforeEach(() => {
  useThumbnailStore.setState({ selectedElement: null, editingElementId: null });
});

describe('the properties sheet', () => {
  it('stays down when nothing is selected', () => {
    expect(renderHook(() => usePropertiesSheetOpen()).result.current).toBe(false);
  });

  it('comes up when an element is selected', () => {
    useThumbnailStore.setState({ selectedElement: element as never });
    expect(renderHook(() => usePropertiesSheetOpen()).result.current).toBe(true);
  });

  it('goes back down while a text element is being typed into', () => {
    // The text editor sheet takes the same place at the bottom of a phone screen
    useThumbnailStore.setState({ selectedElement: element as never, editingElementId: 'text-title' });
    expect(renderHook(() => usePropertiesSheetOpen()).result.current).toBe(false);
  });
});
