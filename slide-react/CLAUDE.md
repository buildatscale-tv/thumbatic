# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a React TypeScript application that generates professional YouTube intro slides with flat design, rectangular highlights, and theme-based styling. The project is built with Vite, React 19, TypeScript, and uses Zustand for state management, @dnd-kit for drag-and-drop functionality, and modern-screenshot for image export.

## Development Commands

- **Development server**: `npm run dev` - Start Vite development server with HMR
- **Build**: `npm run build` - TypeScript compilation followed by production build
- **Lint**: `npm run lint` - Run ESLint with TypeScript rules
- **Preview**: `npm run preview` - Preview production build locally

## Architecture

### State Management
The application uses Zustand for centralized state management in `src/store/slideStore.ts`. The store manages:
- Theme and styling configuration (themes, corner styles)
- Logo and icon management (library selection, custom URLs, positioning)
- Element management (text, logos, icons) with drag-and-drop positioning
- Text layout modes (inline, lines, grid)

### Component Structure
- **App.tsx**: Root component with DndContext for drag-and-drop functionality
- **SlideGenerator.tsx**: Main layout container with ControlPanel and SlideCanvas
- **SlideCanvas.tsx**: 1280x720 slide preview with theme classes and element rendering
- **ControlPanel.tsx**: Left sidebar with all slide configuration controls

### Key Components
- **controls/**: Form controls for content, themes, logos, icons, and element properties
- **slide/**: Slide rendering components (TextElements, LogoElements, IconElements, AccentShapes)
- **DroppableArea**: Drag-and-drop target zone using @dnd-kit

### Drag-and-Drop System
Uses @dnd-kit with:
- PointerSensor with 8px activation distance
- Position updates via store's `updateElementPosition` action
- Restricted to slide canvas boundaries with `restrictToWindowEdges`

### Element System
All slide elements follow a unified structure:
```typescript
interface SlideElement {
  id: string;
  type: 'text' | 'logo' | 'icon';
  name: string;
  position: { x: number; y: number };
  properties: ElementProperties;
}
```

### Theme System
Four built-in themes with CSS class switching:
- `claude-theme`: Orange/navy default theme
- `tech-theme`: Blue gradient theme
- `dark-theme`: Green/dark theme
- `blueprint-theme`: Blue angular theme

### Export System
Uses modern-screenshot library for PNG export at exact 1280x720 YouTube intro dimensions.

## Key Technologies

- **React 19**: Latest React with new features
- **TypeScript**: Strict typing with modern config
- **Vite**: Fast build tool with HMR
- **Zustand**: Lightweight state management
- **@dnd-kit**: Accessible drag-and-drop system
- **modern-screenshot**: CORS-friendly image export

## File Structure

```
src/
├── App.tsx                 # Root component with DndContext
├── store/slideStore.ts     # Zustand state management
├── types.ts               # TypeScript type definitions
├── components/
│   ├── SlideGenerator.tsx  # Main layout container
│   ├── SlideCanvas.tsx     # 1280x720 slide preview
│   ├── ControlPanel.tsx    # Left sidebar controls
│   ├── controls/          # Form control components
│   └── slide/             # Slide rendering components
├── constants/             # Logo and icon libraries
└── styles/               # CSS styling
```

## Development Notes

- Elements use pixel-based positioning for precise 1280x720 layout
- Safe positioning algorithm prevents logo/icon overlap with text center zone
- TypeScript strict mode enabled with comprehensive type checking
- ESLint configured for React hooks and TypeScript best practices
- All themes support both rounded and sharp corner styles
- Logo library includes 50+ tech company logos via devicons CDN