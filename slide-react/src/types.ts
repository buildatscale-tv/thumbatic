// Text element types
export type TextElementType = 'title' | 'subtitle' | 'accent-label' | 'custom';

// Element property interfaces
export interface TextElementProperties {
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundStyle: 'none' | 'highlight' | 'drop-shadow';
  cornerStyle: 'rounded' | 'sharp';
  opacity: number;
  rotation: number;
  content: string;
  textType: TextElementType;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface LogoIconElementProperties {
  size: number;
  rotation: number;
  opacity: number;
  src?: string;
}

// Union type for element properties
export type ElementProperties = TextElementProperties | LogoIconElementProperties;

// Thumbnail element interface
export interface ThumbnailElement {
  id: string;
  type: 'text' | 'logo' | 'icon';
  name: string;
  position: { x: number; y: number };
  zIndex: number;
  properties: ElementProperties;
}

// Logo library item
export interface LogoLibraryItem {
  value: string;
  label: string;
  category: string;
  invert?: boolean;
}

// Icon library structure
export interface IconSet {
  tech: string[];
  shapes: string[];
  arrows: string[];
}

// Theme and style types
export type Theme = 'claude' | 'tech' | 'dark' | 'blueprint';
export type CornerStyle = 'rounded' | 'sharp';
export type LogoType = 'url' | 'library';
export type IconType = 'none' | 'tech' | 'shapes' | 'arrows' | 'mixed';

// Main store state interface
export interface ThumbnailState {

  // Theme and styling
  theme: Theme;
  cornerStyle: CornerStyle;

  // Logo configuration
  logoType: LogoType;
  logoUrl: string;
  selectedLogos: string[];
  logoSize: number;

  // Decorative icons
  iconType: IconType;
  iconSize: number;

  // Element management
  elements: ThumbnailElement[];
  selectedElement: ThumbnailElement | null;

  // Actions
  setTheme: (theme: Theme) => void;
  setCornerStyle: (style: CornerStyle) => void;
  setLogoType: (type: LogoType) => void;
  setLogoUrl: (url: string) => void;
  setSelectedLogos: (logos: string[]) => void;
  setLogoSize: (size: number) => void;
  setIconType: (type: IconType) => void;
  setIconSize: (size: number) => void;
  selectElement: (element: ThumbnailElement | null) => void;
  updateElementProperties: (elementId: string, properties: Partial<ElementProperties>) => void;
  updateElementPosition: (elementId: string, position: { x: number; y: number }) => void;
  updateElementZIndex: (elementId: string, zIndex: number) => void;
  addElement: (element: ThumbnailElement) => void;
  addTextElement: (textType: TextElementType, content: string, position?: { x: number; y: number }) => void;
  removeElement: (elementId: string) => void;
  reorderElements: (elementIds: string[]) => void;
  randomizeLogoPositions: () => void;
  randomizeIconPositions: () => void;
}
