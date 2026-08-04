import { useThumbnailStore } from '../store/thumbnailStore';

/**
 * Whether the properties panel is showing as a sheet over the canvas.
 *
 * True whenever an element is selected and the text editor sheet is not up, since both
 * sheets take the same place and typing is the more immediate job. The panel uses this
 * to raise itself, and the layout uses it to keep the canvas clear of the sheet.
 *
 * Below 900 px only. On a wider screen the panel is a column beside the canvas and the
 * class this drives does nothing.
 */
export function usePropertiesSheetOpen(): boolean {
  const selectedElement = useThumbnailStore(state => state.selectedElement);
  const editingElementId = useThumbnailStore(state => state.editingElementId);
  return Boolean(selectedElement) && !editingElementId;
}
