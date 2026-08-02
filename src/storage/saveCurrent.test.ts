import { describe, it, expect, beforeEach } from 'vitest';
import { useThumbnailStore, createInitialTextElements } from '../store/thumbnailStore';
import { saveCurrentThumbnail } from './saveCurrent';

const readRecords = () => JSON.parse(localStorage.getItem('thumbatic-thumbnails') || '[]');
const titleOf = (record: { elements: { id: string; properties: { content?: string } }[] }) =>
  record.elements.find(el => el.id === 'text-title')?.properties.content;

beforeEach(() => {
  localStorage.clear();
  useThumbnailStore.setState({
    thumbnailId: null,
    thumbnailName: 'Untitled Thumbnail',
    elements: createInitialTextElements(),
    lastSavedAt: null,
  });
});

describe('saveCurrentThumbnail', () => {
  it('creates the record from the current design and name on the first save', async () => {
    const store = useThumbnailStore.getState();
    store.setThumbnailName('My First Design');
    store.updateElementProperties('text-title', { content: 'CUSTOM TITLE' });

    await saveCurrentThumbnail();

    const records = readRecords();
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe('My First Design');
    expect(titleOf(records[0])).toBe('CUSTOM TITLE');
    expect(useThumbnailStore.getState().thumbnailId).toBeTruthy();
  });

  it('keeps the editor untouched by the first save', async () => {
    const store = useThumbnailStore.getState();
    store.setThumbnailName('Keep This Name');
    store.updateElementProperties('text-title', { content: 'KEEP THIS TITLE' });

    await saveCurrentThumbnail();

    const state = useThumbnailStore.getState();
    expect(state.thumbnailName).toBe('Keep This Name');
    expect(titleOf(state as never)).toBe('KEEP THIS TITLE');
  });

  it('updates the same record on later saves instead of making another', async () => {
    await saveCurrentThumbnail();
    useThumbnailStore.getState().updateElementProperties('text-title', { content: 'EDITED' });
    await saveCurrentThumbnail();

    const records = readRecords();
    expect(records).toHaveLength(1);
    expect(titleOf(records[0])).toBe('EDITED');
  });

  it('falls back to the default name when the name is empty', async () => {
    useThumbnailStore.getState().setThumbnailName('');

    await saveCurrentThumbnail();

    expect(readRecords()[0].name).toBe('Untitled Thumbnail');
  });
});
