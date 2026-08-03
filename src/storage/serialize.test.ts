import { describe, it, expect } from 'vitest';
import { persistedToState, getStateToPersist } from './serialize';
import type { ThumbnailRecord } from './types';
import type { ThumbnailState } from '../types';

const element = {
  id: 'image-1',
  type: 'image' as const,
  name: 'Mark',
  position: { x: 200, y: 500 },
  zIndex: 5000,
  properties: { size: 128, rotation: 0, opacity: 100, src: 'https://example.com/mark.svg' },
};

const state = {
  thumbnailId: 'thumb-1',
  thumbnailName: 'A Thumbnail',
  theme: 'claude',
  elements: [element],
  activeTool: 'text',
  showImageLibrary: true,
  showGridGuides: true,
  snappingEnabled: false,
  centerSnapMode: true,
  previewMode: true,
  createdAt: 1000,
} as unknown as ThumbnailState;

describe('saving a thumbnail', () => {
  const record = getStateToPersist(state);

  it('keeps the elements, which are the whole picture', () => {
    expect(record.elements).toEqual([element]);
  });

  it('keeps the settings that belong to the thumbnail', () => {
    expect(record.theme).toBe('claude');
    expect(record.showGridGuides).toBe(true);
    expect(record.snappingEnabled).toBe(false);
    expect(record.centerSnapMode).toBe(true);
  });

  it('holds nothing that describes the images a second time', () => {
    const written = JSON.parse(JSON.stringify(record));
    for (const field of ['imageType', 'imageUrl', 'selectedImages', 'imageSize', 'showImageLibrary']) {
      expect(written).not.toHaveProperty(field);
    }
  });

  it('keeps the date it was created and stamps the date it was saved', () => {
    expect(record.createdAt).toBe(1000);
    expect(record.updatedAt).toBeGreaterThan(0);
  });

  it('gives a thumbnail an id the first time it is saved', () => {
    const fresh = getStateToPersist({ ...state, thumbnailId: null } as unknown as ThumbnailState);
    expect(fresh.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('opening a thumbnail', () => {
  const loaded = persistedToState(getStateToPersist(state) as ThumbnailRecord);

  it('puts back what was saved', () => {
    expect(loaded.elements).toEqual([element]);
    expect(loaded.theme).toBe('claude');
    expect(loaded.thumbnailName).toBe('A Thumbnail');
  });

  it('opens in the editor rather than in preview, with the picker closed', () => {
    expect(loaded.previewMode).toBe(false);
    expect(loaded.showImageLibrary).toBe(false);
  });
});
