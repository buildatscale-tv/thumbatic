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
  lineSpacing?: number; // Spacing between lines for multi-line text (negative values bring lines closer)
}

export interface ImageElementProperties {
  size: number;
  rotation: number;
  opacity: number;
  src?: string;
  aspectRatio?: number; // width / height - when undefined, defaults to 1 (square)
}

// Arrow element properties for drawable arrows
export interface ArrowElementProperties {
  // Path definition
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  controlPoint: { x: number; y: number };  // Bezier control point
  // Styling
  color: string;
  strokeWidth: number;
  opacity: number;
  // Arrowheads
  arrowheadStart: boolean;
  arrowheadEnd: boolean;
  arrowheadStyle: 'sharp' | 'rounded' | 'filled';
}

// Type guard for arrow elements
export function isArrowElement(props: ElementProperties): props is ArrowElementProperties {
  return 'startPoint' in props && 'endPoint' in props;
}

// Union type for element properties
export type ElementProperties = TextElementProperties | ImageElementProperties | ArrowElementProperties;

// Thumbnail element interface
export interface ThumbnailElement {
  id: string;
  type: 'text' | 'image' | 'arrow';
  name: string;
  position: { x: number; y: number };
  zIndex: number;
  properties: ElementProperties;
}

// Image library item
export interface ImageLibraryItem {
  value: string;
  label: string;
  category: string;
  invert?: boolean;
}

// Theme and style types
export type Theme = 'claude' | 'cloudflare' | 'codex' | 'gemini' | 'pencil';
export type ThemeType = 'light' | 'dark';
export const THEME_TYPES: Record<Theme, ThemeType> = {
  claude:     'dark',
  cloudflare: 'dark',
  codex:      'dark',
  gemini:     'dark',
  pencil:     'light',
};


// Tool types for the new UI
export type ToolType = 'text' | 'image' | 'arrow';

// Main store state interface
export interface ThumbnailState {

  // Theme and styling
  theme: Theme;

  // Arrow draw mode
  isDrawingArrow: boolean;
  arrowDrawStart: { x: number; y: number } | null;

  // Element management
  elements: ThumbnailElement[];
  selectedElement: ThumbnailElement | null;
  editingElementId: string | null;
  textSelection: { elementId: string; start: number; end: number } | null;
  cursorPosition: { elementId: string; position: number } | null;

  // UI states
  activeTool: ToolType;
  showImageLibrary: boolean;
  showGridGuides: boolean;
  snappingEnabled: boolean;
  centerSnapMode: boolean;
  previewMode: boolean;

  // Persistence
  thumbnailId: string | null;
  thumbnailName: string;
  isLoading: boolean;
  lastSavedAt: number | null;
  isHydrated: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  selectElement: (element: ThumbnailElement | null) => void;
  setEditingElementId: (elementId: string | null) => void;
  setTextSelection: (selection: { elementId: string; start: number; end: number } | null) => void;
  setCursorPosition: (cursor: { elementId: string; position: number } | null) => void;
  updateElementProperties: (elementId: string, properties: Partial<ElementProperties>) => void;
  updateElementPosition: (elementId: string, position: { x: number; y: number }, isManual?: boolean) => void;
  updateElementZIndex: (elementId: string, zIndex: number) => void;
  addElement: (element: ThumbnailElement) => void;
  addTextElement: (textType: TextElementType, content: string, position?: { x: number; y: number }) => void;
  removeElement: (elementId: string) => void;
  reorderElements: (elementIds: string[]) => void;
  randomizeImagePositions: () => void;

  // Arrow actions
  setDrawingArrow: (drawing: boolean) => void;
  setArrowDrawStart: (point: { x: number; y: number } | null) => void;
  addArrowElement: (start: { x: number; y: number }, end: { x: number; y: number }) => void;
  updateArrowPoint: (elementId: string, pointType: 'start' | 'end' | 'control', point: { x: number; y: number }) => void;
  moveArrow: (elementId: string, delta: { x: number; y: number }) => void;

  // UI actions
  setActiveTool: (tool: ToolType) => void;
  setShowImageLibrary: (show: boolean) => void;
  setShowGridGuides: (show: boolean) => void;
  setSnappingEnabled: (enabled: boolean) => void;
  setCenterSnapMode: (enabled: boolean) => void;
  setPreviewMode: (previewMode: boolean) => void;

  // Persistence actions
  setThumbnailId: (id: string | null) => void;
  setThumbnailName: (name: string) => void;
  setIsLoading: (loading: boolean) => void;
  setLastSavedAt: (timestamp: number | null) => void;
  setIsHydrated: (hydrated: boolean) => void;
  loadPersistedState: (state: Partial<ThumbnailState>) => void;
}
