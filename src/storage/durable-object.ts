import type { ThumbnailState } from '../types';
import type { StorageAdapter, ThumbnailRecord, ThumbnailSummary } from './types';
import { thumbnailApi } from '../api/thumbnails';

export class DurableObjectAdapter implements StorageAdapter {
  async list(): Promise<ThumbnailSummary[]> {
    return thumbnailApi.list();
  }

  async get(id: string): Promise<ThumbnailRecord> {
    return thumbnailApi.get(id);
  }

  async create(name: string, state: ThumbnailState): Promise<ThumbnailRecord> {
    return thumbnailApi.create(name, state);
  }

  async save(id: string, state: ThumbnailState): Promise<ThumbnailRecord> {
    return thumbnailApi.save(id, state);
  }

  async delete(id: string): Promise<void> {
    return thumbnailApi.delete(id);
  }
}
