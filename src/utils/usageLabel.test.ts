import { describe, it, expect } from 'vitest';
import { usageLabel } from './usageLabel';

describe('what deleting an upload costs', () => {
  it('says so plainly when nothing uses it', () => {
    expect(usageLabel([])).toBe('Not used anywhere');
  });

  it('names the one thumbnail that would lose it', () => {
    expect(usageLabel(['Kombai'])).toBe('Kombai will lose this image');
  });

  it('names both when there are two', () => {
    expect(usageLabel(['Open Code', 'Kombai'])).toBe('Kombai and Open Code will lose this image');
  });

  it('counts the rest in thumbnails, singular for one', () => {
    expect(usageLabel(['Open Code', 'Kombai', 'Namespace']))
      .toBe('Kombai, Namespace and 1 more thumbnail will lose this image');
  });

  it('counts the rest in thumbnails, plural beyond one', () => {
    expect(usageLabel(['Open Code', 'Kombai', 'Namespace', 'Zed']))
      .toBe('Kombai, Namespace and 2 more thumbnails will lose this image');
  });

  it('shortens a name that would push the sentence off the tile', () => {
    expect(usageLabel(['A Very Long Thumbnail Name Indeed']))
      .toBe('A Very Long Thumbnail\u2026 will lose this image');
  });

  it('sorts the names, so the same image always names the same two', () => {
    const names = ['Zed', 'Kombai', 'Namespace'];
    expect(usageLabel(names)).toBe(usageLabel([...names].reverse()));
  });
});
