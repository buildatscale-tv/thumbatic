import type { ThumbnailState } from '../types';

const API_BASE = '/api';

export interface ThumbnailSummary {
  id: string;
  name: string;
  updatedAt: number;
}

export interface PersistedThumbnail {
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

function getStateToPersist(state: ThumbnailState): PersistedThumbnail {
  return {
    id: (state as any).thumbnailId || crypto.randomUUID(),
    name: (state as any).thumbnailName || 'Untitled Thumbnail',
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
    createdAt: (state as any).createdAt || Date.now(),
    updatedAt: Date.now(),
  };
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((error as any).error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const thumbnailApi = {
  async list(): Promise<ThumbnailSummary[]> {
    return apiRequest('/thumbnails');
  },

  async get(id: string): Promise<PersistedThumbnail> {
    return apiRequest(`/thumbnails/${id}`);
  },

  async create(name: string, state: ThumbnailState): Promise<PersistedThumbnail> {
    const data = getStateToPersist(state);
    data.name = name;
    data.id = crypto.randomUUID();
    return apiRequest('/thumbnails', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async save(id: string, state: ThumbnailState): Promise<PersistedThumbnail> {
    const data = getStateToPersist(state);
    data.id = id;
    return apiRequest(`/thumbnails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/thumbnails/${id}`, { method: 'DELETE' });
  },
};
