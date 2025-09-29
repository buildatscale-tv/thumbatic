import { create } from 'zustand';
import type { ThumbnailState, ThumbnailElement, TextElementType, LogoIconElementProperties } from '../types';


// Helper function to generate safe positions outside center exclusion zone (pixel-based)
const generateSafePosition = (): { x: number; y: number } => {
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
        cornerStyle: 'rounded',
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
      position: { x: 640, y: 360 },
      zIndex: 5100,
      properties: {
        fontSize: 72,
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
        fontSize: 60,
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
    cornerStyle: 'sharp',

    // Initial logo configuration
    logoType: 'library',
    logoUrl: '',
    selectedLogos: [],
    logoSize: 128,

    // Initial decorative icons
    iconType: 'none',
    iconSize: 48,


    // Initial element management - include text elements
    elements: initialElements,
    selectedElement: null,
    editingElementId: null as string | null,

  // Actions
  setTheme: (theme) => set({ theme }),

  setCornerStyle: (cornerStyle) => set({ cornerStyle }),

  setLogoType: (logoType) => set({ logoType }),

  setLogoUrl: (logoUrl) => {
    const state = get();

    // Remove existing custom logo element if any
    const updatedElements = state.elements.filter(el => el.id !== 'logo-custom');

    // If new URL is provided, create a custom logo element
    if (logoUrl) {
      const { x, y } = generateSafePosition();
      const customLogoElement: ThumbnailElement = {
        id: 'logo-custom',
        type: 'logo',
        name: 'Custom Logo',
        position: { x, y },
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
        const { x, y } = generateSafePosition();
        return {
          id: `logo-${Date.now()}-${index}`,
          type: 'logo' as const,
          name: `Logo ${index + 1}`,
          position: { x, y },
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

  setIconType: (iconType) => set({ iconType }),

  setIconSize: (iconSize) => {
    const state = get();
    const updatedElements = state.elements.map(element =>
      element.type === 'icon'
        ? { ...element, properties: { ...element.properties, size: iconSize } }
        : element
    );

    set({ iconSize, elements: updatedElements });
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
    set({ selectedElement });
  },

  setEditingElementId: (editingElementId) => {
    set({ editingElementId });
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
      newContent: properties.content,
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
        measureEl.style.fontWeight = '900';
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
      title: { fontSize: 128, fontColor: '#ffffff', backgroundStyle: 'none' as const, backgroundColor: '#ff6b35', cornerStyle: 'rounded' as const, horizontalAlign: 'center' as const },
      subtitle: { fontSize: 76, fontColor: '#000000', backgroundStyle: 'drop-shadow' as const, backgroundColor: '#FFD700', cornerStyle: 'sharp' as const, horizontalAlign: 'center' as const },
      'accent-label': { fontSize: 48, fontColor: '#ffffff', backgroundStyle: 'none' as const, backgroundColor: '#ffffff', cornerStyle: 'rounded' as const, horizontalAlign: 'center' as const },
      custom: { fontSize: 48, fontColor: '#ffffff', backgroundStyle: 'none' as const, backgroundColor: '#ff6b35', cornerStyle: 'rounded' as const, horizontalAlign: 'center' as const },
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
            position: generateSafePosition(),
            properties: {
              ...element.properties,
              rotation: Math.random() * 30 - 15
            }
          }
        : element
    );

    set({ elements: updatedElements });
  },

  randomizeIconPositions: () => {
    const state = get();
    const updatedElements = state.elements.map(element =>
      element.type === 'icon'
        ? {
            ...element,
            position: {
              x: Math.random() * (1280 + 100) - 50, // Allow 50px protrusion on each side
              y: Math.random() * (720 + 100) - 50   // Allow 50px protrusion on each side
            },
            properties: {
              ...element.properties,
              rotation: Math.random() * 360
            }
          }
        : element
    );

    set({ elements: updatedElements });
  },
  };
});
