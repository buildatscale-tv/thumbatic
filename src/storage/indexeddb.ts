import type { ThumbnailState } from '../types';
import type { StorageAdapter, ThumbnailRecord, ThumbnailSummary } from './types';
import { getStateToPersist } from './serialize';
import { THUMBNAILS_STORE, getAllFrom, withStore } from './idb';

/**
 * Default backend. IndexedDB holds far more than localStorage, and it stores uploaded
 * images as blobs rather than base64, which costs about a third as much.
 */
export class IndexedDBAdapter implements StorageAdapter {
  async list(): Promise<ThumbnailSummary[]> {
    const records = await getAllFrom<ThumbnailRecord>(THUMBNAILS_STORE);
    return records
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(record => ({ id: record.id, name: record.name, updatedAt: record.updatedAt }));
  }

  async get(id: string): Promise<ThumbnailRecord> {
    const record = await withStore<ThumbnailRecord | undefined>(
      THUMBNAILS_STORE,
      'readonly',
      store => store.get(id)
    );
    if (!record) throw new Error('Thumbnail not found');
    return record;
  }

  async create(name: string, state: ThumbnailState): Promise<ThumbnailRecord> {
    const now = Date.now();
    const record: ThumbnailRecord = {
      ...getStateToPersist(state),
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now,
    };
    await withStore(THUMBNAILS_STORE, 'readwrite', store => store.put(record));
    return record;
  }

  async save(id: string, state: ThumbnailState): Promise<ThumbnailRecord> {
    const existing = await this.get(id);
    const record: ThumbnailRecord = {
      ...getStateToPersist(state),
      id,
      createdAt: existing.createdAt,
    };
    await withStore(THUMBNAILS_STORE, 'readwrite', store => store.put(record));
    return record;
  }

  async delete(id: string): Promise<void> {
    await withStore(THUMBNAILS_STORE, 'readwrite', store => store.delete(id));
  }
}
