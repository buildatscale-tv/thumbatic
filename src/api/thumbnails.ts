import type { ThumbnailState } from '../types';
import type { ThumbnailRecord, ThumbnailSummary } from '../storage/types';
import { getStateToPersist } from '../storage/serialize';

const API_BASE = '/api';

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((error as { error?: string }).error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const thumbnailApi = {
  async list(): Promise<ThumbnailSummary[]> {
    return apiRequest('/thumbnails');
  },

  async get(id: string): Promise<ThumbnailRecord> {
    return apiRequest(`/thumbnails/${id}`);
  },

  async create(name: string, state: ThumbnailState): Promise<ThumbnailRecord> {
    const data = getStateToPersist(state);
    data.name = name;
    data.id = crypto.randomUUID();
    return apiRequest('/thumbnails', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async save(id: string, state: ThumbnailState): Promise<ThumbnailRecord> {
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
