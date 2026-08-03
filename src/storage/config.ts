import type { StorageBackend } from './types';

const VALID_BACKENDS: StorageBackend[] = ['indexeddb', 'local', 'durable-objects'];

const envBackend = import.meta.env.VITE_STORAGE_BACKEND as string | undefined;

/**
 * IndexedDB is the default. It holds far more than localStorage and stores uploaded
 * images as blobs, so a custom logo costs its own size rather than base64 in UTF-16.
 * There is no automatic fallback on purpose: a silent downgrade to a 5 MB store would
 * hide the failure. Set the variable to `local` to choose that explicitly.
 */
export const STORAGE_BACKEND: StorageBackend =
  envBackend && VALID_BACKENDS.includes(envBackend as StorageBackend)
    ? (envBackend as StorageBackend)
    : 'indexeddb';
