// Low level IndexedDB helpers shared by the thumbnail adapter and the image store.
// Both live in one database so a single upgrade path covers them.

const DATABASE_NAME = 'thumbatic';
const DATABASE_VERSION = 1;

export const THUMBNAILS_STORE = 'thumbnails';
export const IMAGES_STORE = 'images';
export const SOURCES_STORE = 'sources';

let databasePromise: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser has no IndexedDB, so thumbnails cannot be saved.'));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(THUMBNAILS_STORE)) {
        database.createObjectStore(THUMBNAILS_STORE, { keyPath: 'id' });
      }
      // Uploaded images, keyed by the SHA-256 of their bytes
      if (!database.objectStoreNames.contains(IMAGES_STORE)) {
        database.createObjectStore(IMAGES_STORE, { keyPath: 'id' });
      }
      // Maps the hash of an original file to the hash of its processed image, so the
      // same upload is recognised without compressing it again
      if (!database.objectStoreNames.contains(SOURCES_STORE)) {
        database.createObjectStore(SOURCES_STORE, { keyPath: 'sourceId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'));
  });

  return databasePromise;
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

/** Runs one operation against a store and waits for the transaction to commit. */
export async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    let result: T;

    request.onsuccess = () => {
      result = request.result;
    };
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
  });
}

export async function getAllFrom<T>(storeName: string): Promise<T[]> {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, 'readonly');
  return promisify(transaction.objectStore(storeName).getAll() as IDBRequest<T[]>);
}
