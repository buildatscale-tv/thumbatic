/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Storage backend for thumbnail persistence.
   * 'local' (default) uses the browser's localStorage.
   * 'durable-objects' uses the Cloudflare Durable Object API.
   */
  readonly VITE_STORAGE_BACKEND?: 'local' | 'durable-objects';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
