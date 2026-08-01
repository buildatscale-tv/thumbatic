import type { StorageBackend } from './types';

const VALID_BACKENDS: StorageBackend[] = ['local', 'durable-objects'];

const envBackend = import.meta.env.VITE_STORAGE_BACKEND as string | undefined;

export const STORAGE_BACKEND: StorageBackend =
  envBackend && VALID_BACKENDS.includes(envBackend as StorageBackend)
    ? (envBackend as StorageBackend)
    : 'local';
