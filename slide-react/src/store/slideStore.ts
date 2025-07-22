import { create } from 'zustand';
import type { SlideState, SlideElement, TextElementType, LogoIconElementProperties } from '../types';

// Grid utility function for initial positioning
// Now returns center coordinates that will be converted to top-left for rendering
const gridToPixel = (gridX: number, gridY: number, gridCols: number, gridRows: number): { x: number; y: number } => {
  const SLIDE_WIDTH = 1280;
  const SLIDE_HEIGHT = 720;
  const cellWidth = SLIDE_WIDTH / gridCols;
  const cellHeight = SLIDE_HEIGHT / gridRows;

  return {
    x: gridX * cellWidth + cellWidth / 2, // Center of grid cell
    y: gridY * cellHeight + cellHeight / 2 // Center of grid cell
  };
};

// Helper function to generate safe positions outside center exclusion zone (pixel-based)
const generateSafePosition = (): { x: number; y: number } => {
  const slideWidth = 1280;
  const slideHeight = 720;
  const exclusionWidth = 900;
  const exclusionHeight = 400;

  const exclusionLeft = (slideWidth - exclusionWidth) / 2;
  const exclusionTop = (slideHeight - exclusionHeight) / 2;
  const exclusionRight = exclusionLeft + exclusionWidth;
  const exclusionBottom = exclusionTop + exclusionHeight;

  let x, y;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    // Generate pixel positions directly
    x = Math.random() * (slideWidth * 0.8) + (slideWidth * 0.1); // 10-90% of slide width
    y = Math.random() * (slideHeight * 0.8) + (slideHeight * 0.1); // 10-90% of slide height

    const isInExclusion = x >= exclusionLeft && x <= exclusionRight &&
                         y >= exclusionTop && y <= exclusionBottom;

    if (!isInExclusion) break;
    attempts++;
  } while (attempts < maxAttempts);

  return { x, y };
};

// Create initial text elements positioned centered on canvas
const createInitialTextElements = (): SlideElement[] => {
  return [
    {
      id: 'text-title',
      type: 'text',
      name: 'Title',
      position: { x: 640, y: 200 },
      properties: {
        fontSize: 128,
        backgroundColor: '#ff6b35',
        backgroundStyle: 'none',
        cornerStyle: 'rounded',
        opacity: 100,
        content: 'CLAUDE CODE',
        textType: 'title' as TextElementType,
      }
    },
    {
      id: 'text-subtitle',
      type: 'text',
      name: 'Subtitle',
      position: { x: 640, y: 380 },
      properties: {
        fontSize: 84,
        backgroundColor: '#FFD700',
        backgroundStyle: 'drop-shadow',
        cornerStyle: 'sharp',
        opacity: 100,
        content: 'AGENT',
        textType: 'subtitle' as TextElementType,
      }
    },
    {
      id: 'text-accent-label',
      type: 'text',
      name: 'Accent Label',
      position: { x: 640, y: 520 },
      properties: {
        fontSize: 72,
        backgroundColor: '#ffffff',
        backgroundStyle: 'none',
        cornerStyle: 'rounded',
        opacity: 100,
        content: '2.0',
        textType: 'accent-label' as TextElementType,
      }
    }
  ];
};

export const useSlideStore = create<SlideState>((set, get) => ({
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
  elements: createInitialTextElements(),
  selectedElement: null,

  // Actions
  setTheme: (theme) => set({ theme }),

  setCornerStyle: (cornerStyle) => set({ cornerStyle }),

  setLogoType: (logoType) => set({ logoType }),

  setLogoUrl: (logoUrl) => set({ logoUrl }),

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

    const newLogoElements: SlideElement[] = selectedLogos
      .filter(url => !existingLogoUrls.includes(url))
      .map((url, index) => {
        const { x, y } = generateSafePosition();
        return {
          id: `logo-${Date.now()}-${index}`,
          type: 'logo' as const,
          name: `Logo ${index + 1}`,
          position: { x, y },
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

  selectElement: (selectedElement) => set({ selectedElement }),

  updateElementProperties: (elementId, properties) => {
    const state = get();
    const updatedElements = state.elements.map(element =>
      element.id === elementId
        ? { ...element, properties: { ...element.properties, ...properties } }
        : element
    );

    set({ elements: updatedElements });

    // Update selected element if it's the one being modified
    if (state.selectedElement?.id === elementId) {
      const updatedElement = updatedElements.find(el => el.id === elementId);
      set({ selectedElement: updatedElement || null });
    }
  },

  updateElementPosition: (elementId, position) => {
    const state = get();

    // Position is used directly (snapping handled in App component for text elements)
    const updatedElements = state.elements.map(element =>
      element.id === elementId
        ? { ...element, position }
        : element
    );

    set({ elements: updatedElements });

    // Update selected element if it's the one being moved
    if (state.selectedElement?.id === elementId) {
      const updatedElement = updatedElements.find(el => el.id === elementId);
      set({ selectedElement: updatedElement || null });
    }
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
      title: { fontSize: 128, backgroundStyle: 'none' as const, backgroundColor: '#ff6b35', cornerStyle: 'rounded' as const },
      subtitle: { fontSize: 76, backgroundStyle: 'drop-shadow' as const, backgroundColor: '#FFD700', cornerStyle: 'sharp' as const },
      'accent-label': { fontSize: 48, backgroundStyle: 'none' as const, backgroundColor: '#ffffff', cornerStyle: 'rounded' as const },
      custom: { fontSize: 48, backgroundStyle: 'none' as const, backgroundColor: '#ff6b35', cornerStyle: 'rounded' as const },
    };

    const newElement: SlideElement = {
      id: `text-${textType}-${Date.now()}`,
      type: 'text',
      name: `${textType.charAt(0).toUpperCase() + textType.slice(1).replace('-', ' ')}`,
      position: position || defaultPositions[textType],
      properties: {
        fontSize: defaultStyles[textType].fontSize,
        backgroundColor: defaultStyles[textType].backgroundColor,
        backgroundStyle: defaultStyles[textType].backgroundStyle,
        cornerStyle: defaultStyles[textType].cornerStyle,
        opacity: 100,
        content,
        textType,
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
      const reorderedElements = elementIds.map(id => elementMap.get(id)).filter(Boolean) as SlideElement[];

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
              x: Math.random() * (1280 * 0.9) + (1280 * 0.05),
              y: Math.random() * (720 * 0.9) + (720 * 0.05)
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
}));
