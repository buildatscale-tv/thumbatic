import { afterEach } from 'vitest';

// jsdom keeps localStorage between tests, and the storage tests depend on a clean start
afterEach(() => {
  localStorage.clear();
});
