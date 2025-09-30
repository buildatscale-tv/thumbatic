import React from 'react';
import { ThumbnailGenerator } from './components/ThumbnailGenerator';
import PreviewMode from './components/PreviewMode';
import { useThumbnailStore } from './store/thumbnailStore';
import { useSnapping } from './hooks/useSnapping';
import { snapToGrid } from './utils/gridSnapUtils';
import type { ActiveSnap } from './types/snapping';
import './styles/thumbnail.css';
import './styles/editor-layout.css';

function App() {
  // Get text elements for text-edge snapping using a stable reference
  const allElements = useThumbnailStore(state => state.elements);
  const selectedElement = useThumbnailStore(state => state.selectedElement);
  const updateElementPosition = useThumbnailStore(state => state.updateElementPosition);
  const updateElementZIndex = useThumbnailStore(state => state.updateElementZIndex);
  const removeElement = useThumbnailStore(state => state.removeElement);
  const previewMode = useThumbnailStore(state => state.previewMode);
  const showGridGuides = useThumbnailStore(state => state.showGridGuides);
  const snappingEnabled = useThumbnailStore(state => state.snappingEnabled);
  const centerSnapMode = useThumbnailStore(state => state.centerSnapMode);

  const textElements = React.useMemo(
    () => allElements.filter(el => el.type === 'text'),
    [allElements]
  );

  // Initialize snapping system - disable when snapping is off or grid is active
  const snapping = useSnapping({
    config: {
      enabled: snappingEnabled && !showGridGuides, // Disable when snapping off or grid active
      proximityThreshold: 200, // Default for text edges
      snapThreshold: 100,
      showGuides: true,
      canvasCenter: {
        enabled: centerSnapMode, // Only enable canvas center in center snap mode
        vertical: true,
        horizontal: true,
      },
      textElementEdges: {
        enabled: true,
        horizontal: true,
        vertical: true,
        proximityThreshold: 50, // Text edges appear at 50px
      },
      textElementCenters: {
        enabled: true,
        horizontal: true,
        vertical: true,
        proximityThreshold: 20, // Text centers appear at 20px (higher priority)
      },
    },
    textElements,
    centerSnapMode,
  });

  // State for active dragging element and position
  const [dragState, setDragState] = React.useState<{
    activeId: string | null;
    position?: { x: number; y: number };
    activeSnaps: ActiveSnap[];
    gridSnapPoint?: { x: number; y: number } | null;
  }>({ activeId: null, activeSnaps: [], gridSnapPoint: null });


  // Subscribe to editing state
  const editingElementId = useThumbnailStore(state => state.editingElementId);

  // Virtual inline text editing with selection
  React.useEffect(() => {
    if (!editingElementId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const store = useThumbnailStore.getState();
      const { elements, updateElementProperties, setEditingElementId, setCursorPosition, setTextSelection, selectElement } = store;

      const element = elements.find(el => el.id === editingElementId);
      if (!element || element.type !== 'text') return;

      // Handle Tab first before anything else
      if (event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();

        // Get all text elements sorted by Y position (top to bottom)
        const textElements = elements
          .filter(el => el.type === 'text')
          .sort((a, b) => {
            // Sort by Y position first, then X for same line
            const yDiff = a.position.y - b.position.y;
            if (Math.abs(yDiff) < 20) { // Consider within 20px as same line
              return a.position.x - b.position.x;
            }
            return yDiff;
          });

        const currentIndex = textElements.findIndex(el => el.id === editingElementId);

        if (currentIndex !== -1 && textElements.length > 1) {
          let nextIndex;

          if (event.shiftKey) {
            // Shift+Tab: Go to previous element
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = textElements.length - 1; // Wrap to bottom
            }
          } else {
            // Tab: Go to next element
            nextIndex = currentIndex + 1;
            if (nextIndex >= textElements.length) {
              nextIndex = 0; // Wrap to top
            }
          }

          const nextElement = textElements[nextIndex];

          // Exit current editing
          setEditingElementId(null);
          setCursorPosition(null);
          setTextSelection(null);

          // Start editing next element
          setTimeout(() => {
            const store = useThumbnailStore.getState();
            store.selectElement(nextElement);
            store.setEditingElementId(nextElement.id);

            // Position cursor at end of text
            const nextProps = nextElement.properties as any;
            const contentLength = nextProps.content?.length || 0;
            store.setCursorPosition({
              elementId: nextElement.id,
              position: contentLength
            });
          }, 10);
        }
        return;
      }

      const props = element.properties as any;
      let content = props.content || '';
      let cursor = store.cursorPosition?.position || 0;
      let selection = store.textSelection;

      // Helper to find word boundaries
      const findWordBoundary = (text: string, pos: number, direction: 'left' | 'right') => {
        const wordRegex = /\w/;
        if (direction === 'left') {
          // Skip any non-word chars first
          while (pos > 0 && !wordRegex.test(text[pos - 1])) pos--;
          // Then skip word chars
          while (pos > 0 && wordRegex.test(text[pos - 1])) pos--;
        } else {
          // Skip any non-word chars first
          while (pos < text.length && !wordRegex.test(text[pos])) pos++;
          // Then skip word chars
          while (pos < text.length && wordRegex.test(text[pos])) pos++;
        }
        return pos;
      };

      // Handle text selection first
      if (event.shiftKey && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        let newPos = cursor;

        if (event.key === 'ArrowLeft') {
          if (event.altKey || event.metaKey) {
            // Select to previous word
            newPos = findWordBoundary(content, cursor, 'left');
          } else {
            // Select one character left
            newPos = Math.max(0, cursor - 1);
          }
        } else if (event.key === 'ArrowRight') {
          if (event.altKey || event.metaKey) {
            // Select to next word
            newPos = findWordBoundary(content, cursor, 'right');
          } else {
            // Select one character right
            newPos = Math.min(content.length, cursor + 1);
          }
        } else if (event.key === 'Home') {
          newPos = 0;
        } else if (event.key === 'End') {
          newPos = content.length;
        }

        if (newPos !== cursor) {
          // Update or create selection
          if (!selection) {
            selection = { elementId: editingElementId, start: cursor, end: newPos };
          } else {
            // Determine which end is the anchor based on cursor position
            // If cursor is at the start of the normalized selection, the end is the anchor
            // If cursor is at the end of the normalized selection, the start is the anchor
            const isAnchorAtEnd = cursor === selection.start;
            const isAnchorAtStart = cursor === selection.end;

            if (isAnchorAtEnd) {
              // Anchor is at end, move start
              selection = { elementId: editingElementId, start: newPos, end: selection.end };
            } else if (isAnchorAtStart) {
              // Anchor is at start, move end
              selection = { elementId: editingElementId, start: selection.start, end: newPos };
            } else {
              // Cursor is not at either end, start new selection
              selection = { elementId: editingElementId, start: cursor, end: newPos };
            }
          }

          // Store the actual selection for proper rendering (normalized)
          setTextSelection({
            elementId: editingElementId,
            start: Math.min(selection.start, selection.end),
            end: Math.max(selection.start, selection.end)
          });
          setCursorPosition({ elementId: editingElementId, position: newPos });
        }
        return;
      }

      // Clear selection on non-shift movement
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) && !event.shiftKey) {
        setTextSelection(null);
      }

      // Handle character input
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();

        // If there's a selection, replace it
        if (selection && selection.elementId === editingElementId) {
          const start = Math.min(selection.start, selection.end);
          const end = Math.max(selection.start, selection.end);

          console.log('Replacing selection:', {
            selection,
            start,
            end,
            oldContent: content,
            selectedText: content.slice(start, end),
            key: event.key
          });

          content = content.slice(0, start) + event.key + content.slice(end);
          cursor = start + 1;
          setTextSelection(null);
        } else {
          content = content.slice(0, cursor) + event.key + content.slice(cursor);
          cursor = cursor + 1;
        }

        updateElementProperties(editingElementId, { content });
        setCursorPosition({ elementId: editingElementId, position: cursor });
      }
      // Handle backspace
      else if (event.key === 'Backspace') {
        event.preventDefault();

        if (selection) {
          const start = Math.min(selection.start, selection.end);
          const end = Math.max(selection.start, selection.end);
          content = content.slice(0, start) + content.slice(end);
          cursor = start;
          setTextSelection(null);
        } else if (cursor > 0) {
          if (event.altKey || event.metaKey) {
            // Delete to previous word
            const newPos = findWordBoundary(content, cursor, 'left');
            content = content.slice(0, newPos) + content.slice(cursor);
            cursor = newPos;
          } else {
            content = content.slice(0, cursor - 1) + content.slice(cursor);
            cursor = cursor - 1;
          }
        }

        updateElementProperties(editingElementId, { content });
        setCursorPosition({ elementId: editingElementId, position: cursor });
      }
      // Handle delete
      else if (event.key === 'Delete') {
        event.preventDefault();

        if (selection) {
          const start = Math.min(selection.start, selection.end);
          const end = Math.max(selection.start, selection.end);
          content = content.slice(0, start) + content.slice(end);
          cursor = start;
          setTextSelection(null);
        } else if (cursor < content.length) {
          if (event.altKey || event.metaKey) {
            // Delete to next word
            const newPos = findWordBoundary(content, cursor, 'right');
            content = content.slice(0, cursor) + content.slice(newPos);
          } else {
            content = content.slice(0, cursor) + content.slice(cursor + 1);
          }
        }

        updateElementProperties(editingElementId, { content });
        setCursorPosition({ elementId: editingElementId, position: cursor });
      }
      // Handle arrow keys (without shift - just movement)
      else if (event.key === 'ArrowLeft' && !event.shiftKey) {
        event.preventDefault();
        if (event.altKey || event.metaKey) {
          cursor = findWordBoundary(content, cursor, 'left');
        } else {
          cursor = Math.max(0, cursor - 1);
        }
        setCursorPosition({ elementId: editingElementId, position: cursor });
      }
      else if (event.key === 'ArrowRight' && !event.shiftKey) {
        event.preventDefault();
        if (event.altKey || event.metaKey) {
          cursor = findWordBoundary(content, cursor, 'right');
        } else {
          cursor = Math.min(content.length, cursor + 1);
        }
        setCursorPosition({ elementId: editingElementId, position: cursor });
      }
      // Handle Home/End (without shift)
      else if (event.key === 'Home' && !event.shiftKey) {
        event.preventDefault();
        setCursorPosition({ elementId: editingElementId, position: 0 });
      }
      else if (event.key === 'End' && !event.shiftKey) {
        event.preventDefault();
        setCursorPosition({ elementId: editingElementId, position: content.length });
      }
      // Handle Select All
      else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setTextSelection({
          elementId: editingElementId,
          start: 0,
          end: content.length
        });
        setCursorPosition({ elementId: editingElementId, position: content.length });
      }
      // Handle Enter/Escape - exit editing and deselect
      else if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        setEditingElementId(null);
        setCursorPosition(null);
        setTextSelection(null);
        selectElement(null);
      }
    };

    // Use capture phase to intercept Tab before other handlers
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [editingElementId]); // Only re-register when editing state changes

  // Keyboard controls for tools and element manipulation
  React.useEffect(() => {
    const {
      setShowLogoLibrary,
      setShowIconLibrary,
      setShowGridGuides,
      addTextElement,
      showGridGuides,
      setPreviewMode,
      previewMode,
      selectElement,
    } = useThumbnailStore.getState();

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts if typing in an input or editing text
      if (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          useThumbnailStore.getState().editingElementId) {
        return;
      }

      // Handle ESC to deselect
      if (event.key === 'Escape') {
        event.preventDefault();
        selectElement(null);
        return;
      }

      // Tool shortcuts (without modifiers)
      switch(event.key.toLowerCase()) {
        case 'l':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setShowLogoLibrary(true);
          }
          break;
        case 'i':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setShowIconLibrary(true);
          }
          break;
        case 'g':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const currentShowGridGuides = useThumbnailStore.getState().showGridGuides;
            setShowGridGuides(!currentShowGridGuides);
          }
          break;
        case 's':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const currentSnappingEnabled = useThumbnailStore.getState().snappingEnabled;
            const { setSnappingEnabled } = useThumbnailStore.getState();
            setSnappingEnabled(!currentSnappingEnabled);
          }
          break;
        case 'c':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const { centerSnapMode, showGridGuides, setCenterSnapMode, setShowGridGuides } = useThumbnailStore.getState();

            // If trying to enable center snap while grid is active, disable grid first
            if (!centerSnapMode && showGridGuides) {
              setShowGridGuides(false);
            }

            setCenterSnapMode(!centerSnapMode);
          }
          break;
        case 'p':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const currentPreviewMode = useThumbnailStore.getState().previewMode;
            setPreviewMode(!currentPreviewMode);
          }
          break;
        case 'd':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            // Trigger download by clicking the export button
            const exportButton = document.querySelector('.download-button--compact') as HTMLButtonElement;
            if (exportButton) {
              exportButton.click();
            }
          }
          break;
      }

      // Element-specific shortcuts
      if (!selectedElement) return;

      // Handle delete key
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Don't delete if focus is on a text input
        if (document.activeElement &&
            (document.activeElement.tagName === 'INPUT' ||
             document.activeElement.tagName === 'TEXTAREA')) {
          return;
        }

        event.preventDefault();
        removeElement(selectedElement.id);
        return;
      }

      // Only handle arrow keys
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
      }

      // Don't handle keyboard shortcuts if focus is on a text input
      if (document.activeElement &&
          (document.activeElement.tagName === 'INPUT' ||
           document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      event.preventDefault();

      // Handle Alt+Arrow for z-index changes
      if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        const currentZIndex = selectedElement.zIndex ?? 5000; // Default to 5000 baseline if no z-index
        const zIndexChange = event.shiftKey ? 500 : 100; // Shift+Alt for larger jumps

        let newZIndex;
        if (event.key === 'ArrowUp') {
          newZIndex = Math.min(10000, currentZIndex + zIndexChange); // Move forward (higher z-index, max 10000)
        } else {
          newZIndex = Math.max(0, currentZIndex - zIndexChange); // Move backward (lower z-index, minimum 0)
        }

        updateElementZIndex(selectedElement.id, newZIndex);
        return;
      }

      // Handle regular movement (only if Alt is not pressed)
      if (event.altKey) return;

      // Determine movement amount based on modifiers
      let moveAmount = 1; // Default 1px
      if (event.shiftKey && (event.metaKey || event.ctrlKey)) {
        moveAmount = 50; // Cmd/Ctrl + Shift = 50px
      } else if (event.shiftKey) {
        moveAmount = 10; // Shift = 10px
      }

      // Calculate new position
      const currentPos = selectedElement.position;
      const newPos = { ...currentPos };

      switch (event.key) {
        case 'ArrowUp':
          newPos.y = Math.max(0, currentPos.y - moveAmount);
          break;
        case 'ArrowDown':
          newPos.y = Math.min(720, currentPos.y + moveAmount);
          break;
        case 'ArrowLeft':
          newPos.x = Math.max(0, currentPos.x - moveAmount);
          break;
        case 'ArrowRight':
          newPos.x = Math.min(1280, currentPos.x + moveAmount);
          break;
      }

      // Update element position (manual adjustment via arrow keys)
      updateElementPosition(selectedElement.id, newPos, true);
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, updateElementPosition, updateElementZIndex, removeElement]);

  // Drag callbacks to be passed to draggable elements
  const dragCallbacks = {
    onDragStart: (elementId: string, position: { x: number; y: number }, anchor?: { x: number; y: number }) => {
      const currentElement = useThumbnailStore.getState().elements.find(el => el.id === elementId);

      if (currentElement) {
        // Start snapping session for all element types
        snapping.startSnapping(elementId, position);

        setDragState({
          activeId: elementId,
          position: position,
          activeSnaps: [],
          gridSnapPoint: null
        });
      }
    },

    onDragMove: (elementId: string, position: { x: number; y: number }, anchor?: { x: number; y: number }) => {
      const currentElement = useThumbnailStore.getState().elements.find(el => el.id === elementId);
      const gridEnabled = useThumbnailStore.getState().showGridGuides;
      const snappingEnabled = useThumbnailStore.getState().snappingEnabled;

      if (currentElement) {
        let finalPosition = position;
        let gridSnapPoint: { x: number; y: number } | null = null;

        if (snappingEnabled && gridEnabled && anchor) {
          // Calculate the anchor point in canvas space (element center + anchor offset)
          const anchorPoint = {
            x: position.x + anchor.x,
            y: position.y + anchor.y
          };

          // Snap the anchor point to grid
          const gridSnap = snapToGrid(anchorPoint);
          gridSnapPoint = { x: gridSnap.x, y: gridSnap.y };

          if (gridSnap.snapped) {
            // Calculate new element center by subtracting anchor offset from snapped point
            finalPosition = {
              x: gridSnap.x - anchor.x,
              y: gridSnap.y - anchor.y
            };
          }
        } else if (snappingEnabled && gridEnabled) {
          // Fallback: snap center if no anchor provided
          const gridSnap = snapToGrid(position);
          gridSnapPoint = { x: gridSnap.x, y: gridSnap.y };

          if (gridSnap.snapped) {
            finalPosition = { x: gridSnap.x, y: gridSnap.y };
          }
        } else if (snappingEnabled) {
          // Update snapping system for regular snapping
          if (snapping.isSnapping) {
            snapping.updateDrag(position);
          }
        }

        // Update position in store immediately for visual feedback (manual drag)
        useThumbnailStore.getState().updateElementPosition(elementId, finalPosition, true);

        setDragState(prev => ({
          ...prev,
          position: finalPosition,
          activeSnaps: gridEnabled ? [] : snapping.activeSnapTargets,
          gridSnapPoint: gridSnapPoint
        }));
      }
    },

    onDragEnd: (elementId: string, finalPosition: { x: number; y: number }, anchor?: { x: number; y: number }) => {
      const currentElement = useThumbnailStore.getState().elements.find(el => el.id === elementId);
      const gridEnabled = useThumbnailStore.getState().showGridGuides;
      const snappingEnabled = useThumbnailStore.getState().snappingEnabled;

      if (snappingEnabled && gridEnabled && anchor) {
        // Use grid snapping with anchor when grid is enabled
        const anchorPoint = {
          x: finalPosition.x + anchor.x,
          y: finalPosition.y + anchor.y
        };
        const gridSnap = snapToGrid(anchorPoint);
        const snappedPosition = {
          x: gridSnap.x - anchor.x,
          y: gridSnap.y - anchor.y
        };
        useThumbnailStore.getState().updateElementPosition(elementId, snappedPosition, true);
      } else if (snappingEnabled && gridEnabled) {
        // Fallback: snap center if no anchor provided
        const gridSnap = snapToGrid(finalPosition);
        useThumbnailStore.getState().updateElementPosition(elementId, { x: gridSnap.x, y: gridSnap.y }, true);
      } else if (snappingEnabled && currentElement && snapping.isSnapping) {
        // Use regular snapping system when grid is disabled
        const snappedPosition = snapping.finalizeDrag();

        if (snappedPosition) {
          // Snapping occurred - use snapped position (manual drag)
          useThumbnailStore.getState().updateElementPosition(elementId, snappedPosition, true);
        } else {
          // No snapping - use the final constrained position from DraggableElement (manual drag)
          useThumbnailStore.getState().updateElementPosition(elementId, finalPosition, true);
        }
      } else {
        // No snapping active - use the final constrained position from DraggableElement (manual drag)
        useThumbnailStore.getState().updateElementPosition(elementId, finalPosition, true);
      }

      // Clean up snapping session and reset drag state
      snapping.stopSnapping();
      setDragState({ activeId: null, activeSnaps: [], gridSnapPoint: null });
    }
  };

  return (
    <div className="thumbnail-generator">
      <ThumbnailGenerator
        dragState={{
          isDragging: !!dragState.activeId,
          position: dragState.position,
          activeSnaps: dragState.activeSnaps,
          gridSnapPoint: dragState.gridSnapPoint
        }}
        dragCallbacks={dragCallbacks}
        snapThreshold={snapping.config.snapThreshold}
      />
      {previewMode && <PreviewMode />}
    </div>
  );
}

export default App;
