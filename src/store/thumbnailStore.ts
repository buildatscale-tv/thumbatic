import { create } from 'zustand';
import type { ThumbnailState, ThumbnailElement, TextElementType, LogoIconElementProperties, ArrowElementProperties } from '../types';


// Helper function to generate safe positions outside center exclusion zone (pixel-based)
const generateSafePosition = (forLogo: boolean = false): { x: number; y: number } => {
  // Use fixed position for logos - lower left area where they're always visible
  if (forLogo) {
    return { x: 175, y: 550 };
  }

  // For icons and randomization, use random positions
  const thumbnailWidth = 1280;
  const thumbnailHeight = 720;
  const exclusionWidth = 900;
  const exclusionHeight = 400;

  const exclusionLeft = (thumbnailWidth - exclusionWidth) / 2;
  const exclusionTop = (thumbnailHeight - exclusionHeight) / 2;
  const exclusionRight = exclusionLeft + exclusionWidth;
  const exclusionBottom = exclusionTop + exclusionHeight;

  let x, y;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    // Allow 50px protrusion for logos and icons by extending the possible range
    const protrusionAllowance = 50;
    x = Math.random() * (thumbnailWidth + 2 * protrusionAllowance) - protrusionAllowance;
    y = Math.random() * (thumbnailHeight + 2 * protrusionAllowance) - protrusionAllowance;

    const isInExclusion = x >= exclusionLeft && x <= exclusionRight &&
                         y >= exclusionTop && y <= exclusionBottom;

    if (!isInExclusion) break;
    attempts++;
  } while (attempts < maxAttempts);

  return { x, y };
};

// Create initial text elements positioned centered on canvas
const createInitialTextElements = (): ThumbnailElement[] => {
  return [
    {
      id: 'text-title',
      type: 'text',
      name: 'Title',
      position: { x: 640, y: 200 },
      zIndex: 5000,
      properties: {
        fontSize: 128,
        fontColor: '#ffffff',
        backgroundColor: '#ff6b35',
        backgroundStyle: 'none',
        cornerStyle: 'sharp',
        opacity: 100,
        rotation: 0,
        content: 'CLAUDE CODE',
        textType: 'title' as TextElementType,
        horizontalAlign: 'center' as const,
      }
    },
    {
      id: 'text-subtitle',
      type: 'text',
      name: 'Subtitle',
      position: { x: 640, y: 380 },
      zIndex: 5100,
      properties: {
        fontSize: 80,
        fontColor: '#000000',
        backgroundColor: '#FEBC0A',
        backgroundStyle: 'drop-shadow',
        cornerStyle: 'rounded',
        opacity: 100,
        rotation: 0,
        content: 'SLASH COMMANDS',
        textType: 'subtitle' as TextElementType,
        horizontalAlign: 'center' as const,
      }
    },
    {
      id: 'text-accent-label',
      type: 'text',
      name: 'Accent Label',
      position: { x: 640, y: 520 },
      zIndex: 5200,
      properties: {
        fontSize: 52,
        fontColor: '#ffffff',
        backgroundColor: '#017cff',
        backgroundStyle: 'drop-shadow',
        cornerStyle: 'sharp',
        opacity: 100,
        rotation: -1,
        content: 'In 5 minutes',
        textType: 'accent-label' as TextElementType,
        horizontalAlign: 'center' as const,
      }
    }
  ];
};

export const useThumbnailStore = create<ThumbnailState>((set, get) => {
  const initialElements = createInitialTextElements();
  console.log('🚀 Store initialized with elements:', initialElements.map(el => ({
    id: el.id,
    type: el.type,
    horizontalAlign: (el.properties as any).horizontalAlign
  })));

  return {
    // Initial theme and styling
    theme: 'claude',

    // Initial logo configuration
    logoType: 'library',
    logoUrl: '',
    selectedLogos: [],
    logoSize: 256,

    // Arrow draw mode
    isDrawingArrow: false,
    arrowDrawStart: null,

    // Initial element management - include text elements
    elements: initialElements,
    selectedElement: null,
    editingElementId: null as string | null,
    textSelection: null,
    cursorPosition: null,

    // UI states
    activeTool: 'text' as const,
    showLogoLibrary: false,
    showGridGuides: false,
    snappingEnabled: true,
    centerSnapMode: false, // False = neighbor snapping (default), True = center snapping
    previewMode: false,

  // Actions
  setTheme: (theme) => set({ theme }),

  setLogoType: (logoType) => set({ logoType }),

  setLogoUrl: (logoUrl) => {
    const state = get();

    // Remove existing custom logo element if any
    const updatedElements = state.elements.filter(el => el.id !== 'logo-custom');

    // If new URL is provided, create a custom logo element
    if (logoUrl) {
      const customLogoElement: ThumbnailElement = {
        id: 'logo-custom',
        type: 'logo',
        name: 'Custom Logo',
        position: { x: 175, y: 550 },
        zIndex: 5000,
        properties: {
          size: state.logoSize,
          rotation: 0,
          opacity: 100,
          src: logoUrl,
        },
      };
      updatedElements.push(customLogoElement);
    }

    set({ logoUrl, elements: updatedElements });
  },

  setSelectedLogos: (selectedLogos) => {
    const state = get();

    // Remove logos that are no longer selected
    const updatedElements = state.elements.filter(element =>
      element.type !== 'logo' || selectedLogos.some(url =>
        (element.properties as LogoIconElementProperties).src === url
      )
    );

    // Add new logo elements for newly selected logos
    const existingLogoUrls = state.elements
      .filter(el => el.type === 'logo')
      .map(el => (el.properties as LogoIconElementProperties).src);

    const newLogoElements: ThumbnailElement[] = selectedLogos
      .filter(url => !existingLogoUrls.includes(url))
      .map((url, index) => {
        return {
          id: `logo-${Date.now()}-${index}`,
          type: 'logo' as const,
          name: `Logo ${index + 1}`,
          position: { x: 175, y: 550 },
          zIndex: 5000 + index * 10, // Start at 5000, increment by 10 for each logo
          properties: {
            size: state.logoSize,
            rotation: Math.random() * 30 - 15, // -15 to 15 degrees
            opacity: 100,
            src: url,
          },
        };
      });

    set({
      selectedLogos,
      elements: [...updatedElements, ...newLogoElements],
    });
  },

  setLogoSize: (logoSize) => {
    const state = get();
    const updatedElements = state.elements.map(element =>
      element.type === 'logo'
        ? { ...element, properties: { ...element.properties, size: logoSize } }
        : element
    );

    set({ logoSize, elements: updatedElements });
  },

  selectElement: (selectedElement) => {
    // Ensure the selected element has a zIndex if it doesn't already
    if (selectedElement && selectedElement.zIndex === undefined) {
      selectedElement = { ...selectedElement, zIndex: 5000 };
    }
    console.log('📌 Element selected:', {
      id: selectedElement?.id,
      type: selectedElement?.type,
      horizontalAlign: selectedElement?.type === 'text' ? (selectedElement?.properties as any)?.horizontalAlign : null
    });

    const state = get();
    // Clear text selection if selecting a different element or deselecting
    if (!selectedElement || selectedElement.id !== state.textSelection?.elementId) {
      set({ selectedElement, textSelection: null });
    } else {
      set({ selectedElement });
    }
  },

  setEditingElementId: (editingElementId) => {
    set({
      editingElementId,
      textSelection: null,
      cursorPosition: null // Clear cursor, will be set properly by ContentControls
    });
  },

  setTextSelection: (textSelection) => {
    set({ textSelection });
  },

  setCursorPosition: (cursorPosition) => {
    set({ cursorPosition });
  },

  updateElementProperties: (elementId, properties) => {
    const state = get();
    const element = state.elements.find(el => el.id === elementId);

    if (!element) return;

    // Check if content is changing and element has alignment
    const isContentChanging = 'content' in properties;
    const hasAlignment = element.type === 'text' &&
      ((element.properties as any).horizontalAlign || (element.properties as any).verticalAlign);

    console.log('🔍 updateElementProperties:', {
      elementId,
      isContentChanging,
      hasAlignment,
      horizontalAlign: element.type === 'text' ? (element.properties as any).horizontalAlign : null,
      newContent: (properties as any).content,
      oldContent: (element.properties as any).content
    });

    let updatedPosition = element.position;

    // If content is changing and element has horizontal alignment, calculate new position
    if (isContentChanging && hasAlignment && element.type === 'text') {
      const textProps = element.properties as any;
      const horizontalAlign = textProps.horizontalAlign;

      console.log('📏 Measuring new text for alignment:', horizontalAlign);

      if (horizontalAlign) {
        // Create a temporary element to measure the new text size
        const measureEl = document.createElement('div');
        measureEl.style.position = 'absolute';
        measureEl.style.visibility = 'hidden';
        measureEl.style.fontSize = `${textProps.fontSize}px`;
        measureEl.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
        measureEl.style.fontWeight = '800';
        measureEl.style.whiteSpace = 'nowrap';
        measureEl.textContent = properties.content as string || '';

        document.body.appendChild(measureEl);
        const newWidth = measureEl.offsetWidth;
        document.body.removeChild(measureEl);

        // Calculate new center position based on alignment
        const canvasWidth = 1280;
        const padding = textProps.backgroundStyle !== 'none' ? 40 : 0; // Account for padding
        const totalWidth = newWidth + padding;

        const oldX = updatedPosition.x;

        switch (horizontalAlign) {
          case 'left':
            updatedPosition = { ...updatedPosition, x: totalWidth / 2 + 8 }; // 8px for drop shadow
            break;
          case 'right':
            updatedPosition = { ...updatedPosition, x: canvasWidth - totalWidth / 2 };
            break;
          case 'center':
            updatedPosition = { ...updatedPosition, x: canvasWidth / 2 };
            break;
        }

        console.log('📍 Position update:', {
          alignment: horizontalAlign,
          oldX,
          newX: updatedPosition.x,
          textWidth: newWidth,
          totalWidth,
          padding
        });
      }
    } else if (isContentChanging) {
      console.log('⚠️ Content changing but no alignment to update');
    }

    const updatedElements = state.elements.map(el =>
      el.id === elementId
        ? {
            ...el,
            position: updatedPosition,
            properties: { ...el.properties, ...properties }
          }
        : el
    );

    set({ elements: updatedElements });

    // Update selected element if it's the one being modified
    if (state.selectedElement?.id === elementId) {
      const updatedElement = updatedElements.find(el => el.id === elementId);
      set({ selectedElement: updatedElement || null });
    }
  },

  updateElementPosition: (elementId, position, isManual = false) => {
    const state = get();

    console.log('🚀 updateElementPosition called:', {
      elementId,
      position,
      isManual,
      currentAlignment: state.elements.find(el => el.id === elementId)?.type === 'text' ?
        (state.elements.find(el => el.id === elementId)?.properties as any)?.horizontalAlign : null
    });

    // Position is used directly (snapping handled in App component for text elements)
    const updatedElements = state.elements.map(element => {
      if (element.id === elementId) {
        // Only clear alignment if this is a manual position update (drag or arrow keys)
        if (isManual && element.type === 'text') {
          const textProps = element.properties as any;
          if (textProps.horizontalAlign || textProps.verticalAlign) {
            console.log('🔴 Clearing alignment due to manual position update');
            return {
              ...element,
              position,
              properties: {
                ...element.properties,
                horizontalAlign: undefined,
                verticalAlign: undefined
              }
            };
          }
        }
        return { ...element, position };
      }
      return element;
    });

    set({ elements: updatedElements });

    // Update selected element if it's the one being moved
    if (state.selectedElement?.id === elementId) {
      const updatedElement = updatedElements.find(el => el.id === elementId);
      set({ selectedElement: updatedElement || null });
    }
  },

  updateElementZIndex: (elementId: string, zIndex: number) => {
    set((state) => {
      const updatedElements = state.elements.map(element =>
        element.id === elementId ? { ...element, zIndex } : element
      );

      return {
        elements: updatedElements,
        selectedElement: state.selectedElement?.id === elementId
          ? { ...state.selectedElement, zIndex }
          : state.selectedElement
      };
    });
  },

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
    })),

  addTextElement: (textType: TextElementType, content: string, position?: { x: number; y: number }) => {
    const defaultPositions = {
      title: { x: 640, y: 208 },
      subtitle: { x: 640, y: 396 },
      'accent-label': { x: 640, y: 676 },
      custom: { x: 640, y: 360 },
    };

    const defaultStyles = {
      title: { fontSize: 128, fontColor: '#ffffff', backgroundStyle: 'none' as const, backgroundColor: '#ff6b35', cornerStyle: 'sharp' as const, horizontalAlign: 'center' as const },
      subtitle: { fontSize: 76, fontColor: '#000000', backgroundStyle: 'drop-shadow' as const, backgroundColor: '#FEBC0A', cornerStyle: 'rounded' as const, horizontalAlign: 'center' as const },
      'accent-label': { fontSize: 52, fontColor: '#ffffff', backgroundStyle: 'drop-shadow' as const, backgroundColor: '#017cff', cornerStyle: 'sharp' as const, horizontalAlign: 'center' as const },
      custom: { fontSize: 48, fontColor: '#ffffff', backgroundStyle: 'none' as const, backgroundColor: '#ff6b35', cornerStyle: 'sharp' as const, horizontalAlign: 'center' as const },
    };

    const newElement: ThumbnailElement = {
      id: `text-${textType}-${Date.now()}`,
      type: 'text',
      name: `${textType.charAt(0).toUpperCase() + textType.slice(1).replace('-', ' ')}`,
      position: position || defaultPositions[textType],
      zIndex: 5000 + get().elements.filter(el => el.type === 'text').length * 100, // Increment by 100 for each text element
      properties: {
        fontSize: defaultStyles[textType].fontSize,
        fontColor: defaultStyles[textType].fontColor,
        backgroundColor: defaultStyles[textType].backgroundColor,
        backgroundStyle: defaultStyles[textType].backgroundStyle,
        cornerStyle: defaultStyles[textType].cornerStyle,
        opacity: 100,
        rotation: 0,
        content,
        textType,
        horizontalAlign: defaultStyles[textType].horizontalAlign,
      },
    };

    set((state) => ({
      elements: [...state.elements, newElement],
    }));
  },

  removeElement: (elementId) =>
    set((state) => ({
      elements: state.elements.filter(el => el.id !== elementId),
      selectedElement: state.selectedElement?.id === elementId ? null : state.selectedElement,
    })),

  reorderElements: (elementIds: string[]) =>
    set((state) => {
      const elementMap = new Map(state.elements.map(el => [el.id, el]));
      const reorderedElements = elementIds.map(id => elementMap.get(id)).filter(Boolean) as ThumbnailElement[];

      // Add any elements that weren't in the reorder list (shouldn't happen, but safety)
      const missingElements = state.elements.filter(el => !elementIds.includes(el.id));

      return {
        elements: [...reorderedElements, ...missingElements],
      };
    }),

  randomizeLogoPositions: () => {
    const state = get();
    const updatedElements = state.elements.map(element =>
      element.type === 'logo'
        ? {
            ...element,
            position: generateSafePosition(false), // Use random position for randomization
            properties: {
              ...element.properties,
              rotation: Math.random() * 30 - 15
            }
          }
        : element
    );

    set({ elements: updatedElements });
  },

  // Arrow actions
  setDrawingArrow: (drawing) => set({ isDrawingArrow: drawing }),

  setArrowDrawStart: (point) => set({ arrowDrawStart: point }),

  addArrowElement: (start, end) => {
    const state = get();
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Get next z-index
    const maxZIndex = Math.max(...state.elements.map(el => el.zIndex), 5000);

    const arrow: ThumbnailElement = {
      id: `arrow-${Date.now()}`,
      type: 'arrow',
      name: 'Arrow',
      position: { x: midX, y: midY },  // Center for selection purposes
      zIndex: maxZIndex + 100,
      properties: {
        startPoint: start,
        endPoint: end,
        controlPoint: { x: midX, y: midY },  // Starts straight
        color: '#FF0000',
        strokeWidth: 24,  // Bold marker style
        opacity: 100,
        arrowheadStart: false,
        arrowheadEnd: true,
        arrowheadStyle: 'filled',
      } as ArrowElementProperties,
    };

    set({
      elements: [...state.elements, arrow],
      selectedElement: arrow,
      isDrawingArrow: false,
      arrowDrawStart: null,
    });
  },

  updateArrowPoint: (elementId, pointType, point) => {
    const state = get();

    const updatedElements = state.elements.map(element => {
      if (element.id === elementId && element.type === 'arrow') {
        const props = element.properties as ArrowElementProperties;
        const updatedProps = { ...props };

        switch (pointType) {
          case 'start':
            updatedProps.startPoint = point;
            break;
          case 'end':
            updatedProps.endPoint = point;
            break;
          case 'control':
            updatedProps.controlPoint = point;
            break;
        }

        // Update the element's center position too
        const newMidX = (updatedProps.startPoint.x + updatedProps.endPoint.x) / 2;
        const newMidY = (updatedProps.startPoint.y + updatedProps.endPoint.y) / 2;

        return {
          ...element,
          position: { x: newMidX, y: newMidY },
          properties: updatedProps,
        };
      }
      return element;
    });

    set({ elements: updatedElements });

    // Update selected element if it's the one being modified
    if (state.selectedElement?.id === elementId) {
      const updatedElement = updatedElements.find(el => el.id === elementId);
      set({ selectedElement: updatedElement || null });
    }
  },

  moveArrow: (elementId, delta) => {
    const state = get();

    const updatedElements = state.elements.map(element => {
      if (element.id === elementId && element.type === 'arrow') {
        const props = element.properties as ArrowElementProperties;

        // Move all three points by the delta
        const updatedProps = {
          ...props,
          startPoint: {
            x: Math.max(0, Math.min(1280, props.startPoint.x + delta.x)),
            y: Math.max(0, Math.min(720, props.startPoint.y + delta.y)),
          },
          endPoint: {
            x: Math.max(0, Math.min(1280, props.endPoint.x + delta.x)),
            y: Math.max(0, Math.min(720, props.endPoint.y + delta.y)),
          },
          controlPoint: {
            x: Math.max(0, Math.min(1280, props.controlPoint.x + delta.x)),
            y: Math.max(0, Math.min(720, props.controlPoint.y + delta.y)),
          },
        };

        // Update center position
        const newMidX = (updatedProps.startPoint.x + updatedProps.endPoint.x) / 2;
        const newMidY = (updatedProps.startPoint.y + updatedProps.endPoint.y) / 2;

        return {
          ...element,
          position: { x: newMidX, y: newMidY },
          properties: updatedProps,
        };
      }
      return element;
    });

    set({ elements: updatedElements });

    // Update selected element if it's the one being modified
    if (state.selectedElement?.id === elementId) {
      const updatedElement = updatedElements.find(el => el.id === elementId);
      set({ selectedElement: updatedElement || null });
    }
  },

  // UI actions
  setActiveTool: (tool) => set({ activeTool: tool }),

  setShowLogoLibrary: (show) => set({ showLogoLibrary: show }),

  setShowGridGuides: (show) => set({ showGridGuides: show, centerSnapMode: show ? false : get().centerSnapMode }),

  setSnappingEnabled: (enabled) => set({ snappingEnabled: enabled, centerSnapMode: enabled ? get().centerSnapMode : false }),

  setCenterSnapMode: (enabled) => set({ centerSnapMode: enabled }),

  setPreviewMode: (previewMode) => set({ previewMode }),
  };
});
