import type { StorageAdapter } from './types';
import { STORAGE_BACKEND } from './config';
import { IndexedDBAdapter } from './indexeddb';
import { LocalStorageAdapter } from './local';
import { DurableObjectAdapter } from './durable-object';

let adapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (adapter) return adapter;
  if (STORAGE_BACKEND === 'durable-objects') {
    adapter = new DurableObjectAdapter();
  } else if (STORAGE_BACKEND === 'local') {
    adapter = new LocalStorageAdapter();
  } else {
    adapter = new IndexedDBAdapter();
  }
  return adapter;
}

export { STORAGE_BACKEND } from './config';
export type { StorageAdapter, StorageBackend, ThumbnailRecord, ThumbnailSummary } from './types';
