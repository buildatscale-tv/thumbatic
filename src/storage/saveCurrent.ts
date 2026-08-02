import { useThumbnailStore } from '../store/thumbnailStore';
import { getStorageAdapter } from './index';
import { persistedToState } from './serialize';

type SaveListener = () => void;

const saveListeners = new Set<SaveListener>();

/**
 * Subscribes to successful explicit saves, for example to flash a confirmation in the UI.
 * The debounced auto-save does not notify, because it must stay silent.
 * Returns a function that removes the listener.
 */
export function onSaveSuccess(listener: SaveListener): () => void {
  saveListeners.add(listener);
  return () => {
    saveListeners.delete(listener);
  };
}

/**
 * Saves the editor state as it is now.
 *
 * On the first save there is no thumbnail id yet, so this creates the record from the
 * current design and the name in the toolbar. It must not reset the editor to the
 * defaults, because that would discard the work the user is trying to save.
 */
export async function saveCurrentThumbnail(): Promise<void> {
  const state = useThumbnailStore.getState();

  if (!state.thumbnailId) {
    const created = await getStorageAdapter().create(
      state.thumbnailName || 'Untitled Thumbnail',
      state
    );
    state.loadPersistedState(persistedToState(created));
    saveListeners.forEach(listener => listener());
    return;
  }

  const saved = await getStorageAdapter().save(state.thumbnailId, state);
  state.setLastSavedAt(saved.updatedAt);
  saveListeners.forEach(listener => listener());
}
