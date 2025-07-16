import { create } from 'zustand';
import type { SlideState, SlideElement, ElementProperties, SlideContent } from '../types';

// Helper function to generate safe positions outside center exclusion zone
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
    x = Math.random() * 80 + 10; // 10-90%
    y = Math.random() * 80 + 10; // 10-90%
    
    const pixelX = (x / 100) * slideWidth;
    const pixelY = (y / 100) * slideHeight;
    
    const isInExclusion = pixelX >= exclusionLeft && pixelX <= exclusionRight && 
                         pixelY >= exclusionTop && pixelY <= exclusionBottom;
    
    if (!isInExclusion) break;
    attempts++;
  } while (attempts < maxAttempts);
  
  return { x, y };
};

// Create initial text elements
const createInitialTextElements = (): SlideElement[] => {
  return [
    {
      id: 'text-title-before',
      type: 'text',
      name: 'Title Before',
      position: { x: 50, y: 40 },
      properties: {
        fontSize: 72,
        backgroundColor: '#ff6b35',
        backgroundStyle: 'none',
        cornerStyle: 'rounded',
        opacity: 100,
      }
    },
    {
      id: 'text-title-highlight',
      type: 'text',
      name: 'Title Highlight',
      position: { x: 50, y: 40 },
      properties: {
        fontSize: 72,
        backgroundColor: '#ff6b35',
        backgroundStyle: 'highlight',
        cornerStyle: 'rounded',
        opacity: 100,
      }
    },
    {
      id: 'text-title-after',
      type: 'text',
      name: 'Title After',
      position: { x: 50, y: 40 },
      properties: {
        fontSize: 72,
        backgroundColor: '#ff6b35',
        backgroundStyle: 'none',
        cornerStyle: 'rounded',
        opacity: 100,
      }
    },
    {
      id: 'text-subtitle',
      type: 'text',
      name: 'Subtitle',
      position: { x: 50, y: 55 },
      properties: {
        fontSize: 48,
        backgroundColor: '#ff6b35',
        backgroundStyle: 'none',
        cornerStyle: 'rounded',
        opacity: 100,
      }
    },
    {
      id: 'text-accent-label',
      type: 'text',
      name: 'Accent Label',
      position: { x: 50, y: 80 },
      properties: {
        fontSize: 48,
        backgroundColor: '#ffffff',
        backgroundStyle: 'highlight',
        cornerStyle: 'rounded',
        opacity: 100,
      }
    }
  ];
};

export const useSlideStore = create<SlideState>((set, get) => ({
  // Initial content
  content: {
    titleBefore: 'CLAUDE',
    titleHighlight: 'CODE',
    titleAfter: '',
    subtitle: 'AI-Powered Development Tool',
    accentLabel: '',
  },
  
  // Initial theme and styling
  theme: 'claude',
  cornerStyle: 'sharp',
  
  // Initial logo configuration
  logoType: 'library',
  logoUrl: '',
  selectedLogos: [],
  logoSize: 128,
  
  // Initial decorative icons
  iconType: 'mixed',
  iconSize: 96,
  
  // Initial element management - include text elements
  elements: createInitialTextElements(),
  selectedElement: null,
  
  // Actions
  updateContent: (newContent: Partial<SlideContent>) =>
    set((state) => ({
      content: { ...state.content, ...newContent },
    })),
  
  setTheme: (theme) => set({ theme }),
  
  setCornerStyle: (cornerStyle) => set({ cornerStyle }),
  
  setLogoType: (logoType) => set({ logoType }),
  
  setLogoUrl: (logoUrl) => set({ logoUrl }),
  
  setSelectedLogos: (selectedLogos) => {
    const state = get();
    
    // Remove logos that are no longer selected
    const updatedElements = state.elements.filter(element => 
      element.type !== 'logo' || selectedLogos.some(url => 
        element.properties.src === url
      )
    );
    
    // Add new logo elements for newly selected logos
    const existingLogoUrls = state.elements
      .filter(el => el.type === 'logo')
      .map(el => (el.properties as any).src);
    
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
            opacity: 80,
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
  
  removeElement: (elementId) =>
    set((state) => ({
      elements: state.elements.filter(el => el.id !== elementId),
      selectedElement: state.selectedElement?.id === elementId ? null : state.selectedElement,
    })),
  
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
              x: Math.random() * 90 + 5, 
              y: Math.random() * 90 + 5 
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