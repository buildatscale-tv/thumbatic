# Slide - YouTube Thumbnail Generator

A modern, browser-based tool for creating professional YouTube thumbnails with flat design aesthetics, customizable themes, and drag-and-drop element positioning.

## Overview

Slide is a React TypeScript application that generates 1280x720 YouTube thumbnails with:
- Four built-in professional themes (Claude, Tech, Dark, Blueprint)
- Drag-and-drop text, logo, and icon positioning
- 50+ curated tech logos from major companies and frameworks
- Custom logo/icon upload support
- Smart snapping system for precise text alignment
- One-click PNG export at YouTube's exact thumbnail dimensions

## Purpose

This tool streamlines the creation of consistent, professional-looking YouTube thumbnails without requiring design software. It's built for content creators who want polished thumbnails with minimal effort while maintaining brand consistency across videos.

## Prerequisites

- **Node.js**: v22.14.0 (specified in `.nvmrc`)
- **npm**: v9.0.0 or higher (comes with Node.js)

To manage Node versions easily, consider using [nvm](https://github.com/nvm-sh/nvm):

```bash
# Install the project's Node version
nvm install
nvm use
```

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slide
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to the URL shown in terminal (typically `http://localhost:5173`)

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with hot module replacement |
| `npm run build` | Build production-ready bundle (TypeScript compilation + Vite build) |
| `npm run lint` | Run ESLint with TypeScript and React rules |
| `npm run preview` | Preview production build locally |

## Development

### Project Structure

```
src/
├── App.tsx                    # Root component with drag/snap logic
├── store/thumbnailStore.ts    # Zustand state management
├── types.ts                   # TypeScript type definitions
├── components/
│   ├── ThumbnailGenerator.tsx # Main layout container
│   ├── ThumbnailCanvas.tsx    # 1280x720 thumbnail preview
│   ├── Toolbar.tsx            # Top toolbar with tools and theme selection
│   ├── PropertiesPanel.tsx    # Right sidebar with element properties
│   ├── StatusBar.tsx          # Bottom status bar with export
│   ├── DraggableElement.tsx   # Drag wrapper component
│   ├── controls/              # Export button component
│   ├── thumbnail/             # Thumbnail rendering components
│   └── ui/                    # Reusable UI components
├── hooks/
│   └── useSnapping.ts         # Smart snapping system
├── utils/
│   └── snapUtils.ts           # Snapping calculations
├── constants/                 # Logo and icon libraries
└── styles/                    # CSS styling
```

### Tech Stack

- **React 19**: Latest React with improved performance
- **TypeScript 5.8**: Strict typing for better developer experience
- **Vite 7**: Fast build tool with HMR
- **Zustand 5**: Lightweight state management
- **modern-screenshot 4**: Client-side PNG export

### Key Features

**Element System**
- Center-based positioning for all elements (text, logos, icons)
- Text elements snap to canvas center and alignment guides
- Logos/icons have free positioning with automatic safe zone avoidance

**Theme System**
- Four built-in themes with CSS class switching
- Support for rounded and sharp corner styles
- Consistent color palettes across all themes

**Export System**
- Exports at exact 1280x720 dimensions for YouTube
- CORS-friendly, no server configuration needed
- High-quality PNG output

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory. The build includes:
- TypeScript compilation with strict type checking
- Minified JavaScript and CSS
- Optimized asset bundling

To test the production build locally:

```bash
npm run preview
```

## Deployment

### Cloudflare Workers (Recommended)

This project is configured for deployment to Cloudflare Workers with the custom domain **thumbatic.com**.

**Prerequisites:**
- A Cloudflare account
- `thumbatic.com` added to your Cloudflare account
- Wrangler CLI authenticated (`npx wrangler login`)

**Deploy:**

```bash
# Build and deploy
npm run deploy:prod

# Or deploy an existing build
npm run deploy
```

**Custom Domain Setup:**

The `wrangler.toml` is pre-configured with routes for `thumbatic.com` and `www.thumbatic.com`. After your first deploy:

1. Go to the Cloudflare Dashboard → Workers & Pages → thumbatic
2. Navigate to Settings → Triggers → Custom Domains
3. Ensure `thumbatic.com` and `www.thumbatic.com` are active

Or add the domain via Wrangler:

```bash
npx wrangler deploy
```

The `[assets]` configuration in `wrangler.toml` handles SPA routing (all unmatched routes serve `index.html`).

### Other Static Hosts

The application is fully static and can also be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static web server

Simply upload the contents of the `dist/` directory after running `npm run build`.

## Browser Support

Modern browsers with ES2020 support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## Troubleshooting

**Development server won't start**
- Ensure you're using Node.js v22.14.0 (`nvm use`)
- Delete `node_modules` and run `npm install` again
- Check if port 5173 is already in use

**TypeScript errors**
- Run `npm run lint` to see all linting issues
- Ensure your IDE is using the workspace TypeScript version

**Export not working**
- Check browser console for errors
- Ensure all images have loaded before exporting
- Try a different browser (Chrome/Edge recommended)

## Contributing

This project follows strict TypeScript and ESLint rules. Before committing:

1. Run `npm run lint` to check for issues
2. Ensure `npm run build` completes successfully
3. Test your changes in development mode

## License

MIT License - see LICENSE file for details
