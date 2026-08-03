// jsdom has no IndexedDB, so the storage tests run against a real implementation of the
// API rather than a stub. That keeps transaction and key behaviour honest.
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';

// Object URLs are stubbed for every test. jsdom does not implement them, and the version
// Node provides rejects the plain objects that fake-indexeddb returns in place of blobs.
// Real blob round trips are a browser behaviour, so they are not what these tests check.
URL.createObjectURL = () => 'blob:test-object-url';
URL.revokeObjectURL = () => {};

afterEach(() => {
  localStorage.clear();
});
