# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a React TypeScript application that generates professional YouTube thumbnails with flat design, rectangular highlights, and theme-based styling. The project is built with Vite, React 19, TypeScript, and uses Zustand for state management, modern-screenshot for image export, and a custom snapping system for element positioning.

## Development Commands

- **Development server**: `npm run dev` - Start Vite development server with HMR
- **Build**: `npm run build` - TypeScript compilation followed by production build
- **Lint**: `npm run lint` - Run ESLint with TypeScript rules
- **Preview**: `npm run preview` - Preview production build locally

## Architecture

### State Management
The application uses Zustand for centralized state management in `src/store/thumbnailStore.ts`. The store manages:
- Theme and styling configuration (themes, corner styles)
- Logo and icon management (library selection, custom URLs, positioning)
- Element management (text, logos, icons) with drag-and-drop positioning
- Text layout modes and element properties

### Core Architecture Patterns

#### Element System
All thumbnail elements follow a unified structure defined in `src/types.ts`:
```typescript
interface ThumbnailElement {
  id: string;
  type: 'text' | 'logo' | 'icon';
  name: string;
  position: { x: number; y: number }; // Center-based coordinates
  properties: ElementProperties;
}
```

Elements use center-based positioning (x, y coordinates represent the center) but are rendered using top-left positioning. The store handles this conversion automatically.

#### Drag and Drop System
Uses a custom implementation built around React state and DOM events:
- **App.tsx**: Contains drag callbacks and snapping logic
- **DraggableElement.tsx**: Wrapper component for draggable functionality
- **useSnapping hook**: Provides intelligent snapping to canvas center and other elements
- Only text elements participate in snapping; logos and icons have free positioning

#### Safe Positioning Algorithm
The `generateSafePosition()` function in thumbnailStore ensures logos/icons don't overlap with the text center zone:
- Defines an 900x400px exclusion zone in the thumbnail center
- Uses up to 50 attempts to find non-overlapping positions
- Fallback positioning if safe position can't be found

### Component Structure
- **App.tsx**: Root component with drag handling and snapping integration
- **ThumbnailGenerator.tsx**: Main layout container with Toolbar, ThumbnailCanvas, PropertiesPanel, and StatusBar
- **ThumbnailCanvas.tsx**: 1280x720 thumbnail preview with theme classes and element rendering
- **Toolbar.tsx**: Top toolbar with add element tools and theme selection
- **PropertiesPanel.tsx**: Right sidebar for editing selected element properties
- **StatusBar.tsx**: Bottom bar with export functionality

Key rendering components:
- **controls/**: Export button component
- **thumbnail/**: Thumbnail rendering components (TextElements, LogoElements, IconElements, AccentShapes)
- **ui/**: Reusable UI components (Button, Input, Select, Slider, etc.)

### Theme System
Four built-in themes with CSS class switching:
- `claude-theme`: Orange/navy default theme
- `tech-theme`: Blue gradient theme  
- `dark-theme`: Green/dark theme
- `blueprint-theme`: Blue angular theme

Themes are applied via CSS classes on the thumbnail container and support both rounded and sharp corner styles.

### Export System
Uses modern-screenshot library for PNG export at exact 1280x720 YouTube thumbnail dimensions. Exports are CORS-friendly and don't require additional server configuration.

### Storage System
Thumbnail persistence uses a pluggable storage adapter pattern in `src/storage/`:
- **StorageAdapter interface** (`src/storage/types.ts`): `list`, `get`, `create`, `save`, `delete` operations common to all backends
- **LocalStorageAdapter** (`src/storage/local.ts`): Default backend. Stores all thumbnails as a JSON array under the `thumbatic-thumbnails` localStorage key. Works fully client-side with no server.
- **DurableObjectAdapter** (`src/storage/durable-object.ts`): Optional backend. Delegates to the Cloudflare Worker API (`src/api/thumbnails.ts`) which routes to the ThumbnailDO Durable Object with SQLite storage.
- **Backend selection** (`src/storage/config.ts`): Controlled by the build-time env var `VITE_STORAGE_BACKEND` (`local` default | `durable-objects`). Invalid/unset values fall back to `local`.
- **Serialization** (`src/storage/serialize.ts`): `getStateToPersist` converts store state to a `ThumbnailRecord`; `persistedToState` converts a record back to store state.
- Components access the singleton via `getStorageAdapter()` from `src/storage/index.ts`. To add a new backend, implement `StorageAdapter` and register it in the factory.

The Zustand store itself remains in-memory; persistence is orchestrated in App.tsx (2-second debounced auto-save) and Toolbar.tsx (manual save/load/create/delete).

## Key Technologies

- **React 19**: Latest React with new features and improved performance
- **TypeScript**: Strict typing with comprehensive type definitions
- **Vite**: Fast build tool with HMR and optimized builds
- **Zustand**: Lightweight state management (no providers needed)
- **modern-screenshot**: Client-side image export without canvas security issues

## File Structure

```
src/
├── App.tsx                 # Root component with drag/snap logic and auto-save
├── store/thumbnailStore.ts # Zustand state management
├── types.ts               # Core TypeScript type definitions
├── api/
│   └── thumbnails.ts      # Cloudflare Worker API client (used by DurableObjectAdapter)
├── storage/
│   ├── types.ts           # StorageAdapter interface + ThumbnailRecord types
│   ├── config.ts          # Backend selection via VITE_STORAGE_BACKEND
│   ├── local.ts           # LocalStorageAdapter (default)
│   ├── durable-object.ts  # DurableObjectAdapter (optional)
│   ├── serialize.ts       # State <-> ThumbnailRecord conversion
│   └── index.ts           # getStorageAdapter() factory
├── do/
│   └── ThumbnailDO.ts     # Cloudflare Durable Object (SQLite storage)
├── worker/
│   └── index.ts           # Cloudflare Worker entry point
├── components/
│   ├── ThumbnailGenerator.tsx # Main layout container
│   ├── ThumbnailCanvas.tsx # 1280x720 thumbnail preview
│   ├── Toolbar.tsx         # Top toolbar with tools and theme
│   ├── PropertiesPanel.tsx # Right sidebar with element properties
│   ├── StatusBar.tsx       # Bottom status bar with export
│   ├── DraggableElement.tsx # Drag wrapper component
│   ├── controls/           # Export button component
│   ├── thumbnail/          # Thumbnail rendering components
│   └── ui/                 # Reusable UI components
├── hooks/
│   └── useSnapping.ts     # Smart snapping system
├── utils/
│   └── snapUtils.ts       # Snapping calculations
├── constants/             # Logo and icon libraries
└── styles/               # CSS styling
```

## Important Implementation Details

### Element Positioning
- All elements use center-based coordinates internally
- Rendering converts center coordinates to top-left for CSS positioning  
- Text elements snap to canvas center (640, 360) and other alignment guides
- Logo/icon elements have free positioning with safe zone avoidance

### Logo System
- Supports both custom URL logos and curated library of 50+ tech logos
- Library logos use devicons CDN for consistent styling
- Automatic positioning prevents overlap with text content area

### Snapping System
- Text elements snap to canvas center lines and other text elements
- 200px proximity threshold for showing guides, 100px threshold for snapping
- Visual guides appear during drag operations for text elements
- Snapping only applies to text elements; logos/icons have free movement

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- ESLint configured for React hooks and TypeScript best practices
- Project uses Vite's optimized TypeScript compilation

## Development Notes

- Elements are rendered at exact 1280x720 dimensions for YouTube compatibility
- Default storage is fully client-side (localStorage); the durable-objects backend requires a Cloudflare Worker deployment
- All positioning calculations account for the fixed thumbnail dimensions
- Theme switching preserves element positions and properties
- Export functionality captures the exact thumbnail canvas without UI controls