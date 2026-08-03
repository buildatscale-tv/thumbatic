import type { ThumbnailState } from '../types';
import type { ThumbnailRecord } from './types';

/**
 * A record holds what a thumbnail is, not how the editor looked while making it. The
 * elements are the whole picture, including every image on the canvas. The store used to
 * keep a second description of the images beside them, which is what let a thumbnail
 * disagree with itself.
 */
export function getStateToPersist(state: ThumbnailState): ThumbnailRecord {
  const persistedState = state as ThumbnailState & { createdAt?: number };
  return {
    id: state.thumbnailId || crypto.randomUUID(),
    name: state.thumbnailName || 'Untitled Thumbnail',
    theme: state.theme,
    elements: state.elements,
    activeTool: state.activeTool,
    showGridGuides: state.showGridGuides,
    snappingEnabled: state.snappingEnabled,
    centerSnapMode: state.centerSnapMode,
    previewMode: state.previewMode,
    createdAt: persistedState.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
}

export function persistedToState(record: ThumbnailRecord): Partial<ThumbnailState> {
  return {
    thumbnailId: record.id,
    thumbnailName: record.name,
    elements: record.elements,
    theme: record.theme,
    activeTool: record.activeTool,
    showImageLibrary: false,
    showGridGuides: record.showGridGuides,
    snappingEnabled: record.snappingEnabled,
    centerSnapMode: record.centerSnapMode,
    previewMode: false,
    lastSavedAt: record.updatedAt,
  };
}
