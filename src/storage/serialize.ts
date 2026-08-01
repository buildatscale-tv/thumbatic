import type { ThumbnailState } from '../types';
import type { ThumbnailRecord } from './types';

export function getStateToPersist(state: ThumbnailState): ThumbnailRecord {
  const persistedState = state as ThumbnailState & { createdAt?: number };
  return {
    id: state.thumbnailId || crypto.randomUUID(),
    name: state.thumbnailName || 'Untitled Thumbnail',
    theme: state.theme,
    logoType: state.logoType,
    logoUrl: state.logoUrl,
    selectedLogos: state.selectedLogos,
    logoSize: state.logoSize,
    elements: state.elements,
    activeTool: state.activeTool,
    showLogoLibrary: state.showLogoLibrary,
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
    logoType: record.logoType,
    logoUrl: record.logoUrl,
    selectedLogos: record.selectedLogos,
    logoSize: record.logoSize,
    activeTool: record.activeTool,
    showLogoLibrary: record.showLogoLibrary,
    showGridGuides: record.showGridGuides,
    snappingEnabled: record.snappingEnabled,
    centerSnapMode: record.centerSnapMode,
    previewMode: record.previewMode,
    lastSavedAt: record.updatedAt,
  };
}
