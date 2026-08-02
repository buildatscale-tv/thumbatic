import { describe, it, expect, beforeEach } from 'vitest';
import { useThumbnailStore, createInitialTextElements, DEFAULT_THUMBNAIL_NAME } from './thumbnailStore';

const setTitle = (content: string) =>
  useThumbnailStore.getState().updateElementProperties('text-title', { content });

beforeEach(() => {
  useThumbnailStore.setState({
    thumbnailId: null,
    thumbnailName: DEFAULT_THUMBNAIL_NAME,
    elements: createInitialTextElements(),
    selectedElement: null,
  });
});

describe('thumbnail name follows the canvas title', () => {
  it('takes the title while the name is still the default', () => {
    setTitle('SHIP IT FASTER');
    expect(useThumbnailStore.getState().thumbnailName).toBe('SHIP IT FASTER');
  });

  it('keeps following while the name still matches the title', () => {
    setTitle('SHIP');
    setTitle('SHIP IT');
    expect(useThumbnailStore.getState().thumbnailName).toBe('SHIP IT');
  });

  it('stops following once the name is typed by hand', () => {
    setTitle('FIRST TITLE');
    useThumbnailStore.getState().setThumbnailName('My Own Name');
    setTitle('SECOND TITLE');
    expect(useThumbnailStore.getState().thumbnailName).toBe('My Own Name');
  });

  it('returns to the default name when the title is cleared', () => {
    setTitle('SOMETHING');
    setTitle('');
    expect(useThumbnailStore.getState().thumbnailName).toBe(DEFAULT_THUMBNAIL_NAME);
  });

  it('collapses newlines so a multi-line title stays a single line name', () => {
    setTitle('TWO\nLINES');
    expect(useThumbnailStore.getState().thumbnailName).toBe('TWO LINES');
  });

  it('ignores changes to other text elements', () => {
    useThumbnailStore.getState().updateElementProperties('text-subtitle', { content: 'NEW SUBTITLE' });
    expect(useThumbnailStore.getState().thumbnailName).toBe(DEFAULT_THUMBNAIL_NAME);
  });
});

describe('setTheme', () => {
  it('switches the title to black on a light theme and white on a dark theme', () => {
    useThumbnailStore.getState().setTheme('pencil');
    const light = useThumbnailStore.getState().elements.find(el => el.id === 'text-title');
    expect((light?.properties as { fontColor: string }).fontColor).toBe('#000000');

    useThumbnailStore.getState().setTheme('claude');
    const dark = useThumbnailStore.getState().elements.find(el => el.id === 'text-title');
    expect((dark?.properties as { fontColor: string }).fontColor).toBe('#ffffff');
  });
});
