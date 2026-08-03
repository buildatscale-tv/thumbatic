import type { ThumbnailState } from '../types';

export type StorageBackend = 'indexeddb' | 'local' | 'durable-objects';

export interface ThumbnailRecord {
  id: string;
  name: string;
  theme: ThumbnailState['theme'];
  logoType: ThumbnailState['logoType'];
  logoUrl: string;
  selectedLogos: string[];
  logoSize: number;
  elements: ThumbnailState['elements'];
  activeTool: ThumbnailState['activeTool'];
  showLogoLibrary: boolean;
  showGridGuides: boolean;
  snappingEnabled: boolean;
  centerSnapMode: boolean;
  previewMode: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ThumbnailSummary {
  id: string;
  name: string;
  updatedAt: number;
}

export interface StorageAdapter {
  list(): Promise<ThumbnailSummary[]>;
  get(id: string): Promise<ThumbnailRecord>;
  create(name: string, state: ThumbnailState): Promise<ThumbnailRecord>;
  save(id: string, state: ThumbnailState): Promise<ThumbnailRecord>;
  delete(id: string): Promise<void>;
}
