import type { StorageAdapter } from './types';
import { STORAGE_BACKEND } from './config';
import { LocalStorageAdapter } from './local';
import { DurableObjectAdapter } from './durable-object';

let adapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (adapter) return adapter;
  adapter = STORAGE_BACKEND === 'durable-objects'
    ? new DurableObjectAdapter()
    : new LocalStorageAdapter();
  return adapter;
}

export { STORAGE_BACKEND } from './config';
export type { StorageAdapter, StorageBackend, ThumbnailRecord, ThumbnailSummary } from './types';
