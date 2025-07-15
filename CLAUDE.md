# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a web-based YouTube intro slide generator that creates professional slides with flat design and rectangular highlights. The application is built with vanilla HTML, CSS, and JavaScript, using html2canvas for image export functionality.

## Development Commands

Since this is a static web application, there are no build commands required. To develop and test:

1. **Run the application**: Open `index.html` in your web browser
2. **Development server**: Use any local server (e.g., `python -m http.server 8000` or `npx serve`)
3. **Testing**: Manual testing through the browser interface

## Architecture

### Core Components

- **index.html**: Main HTML structure with form controls and slide preview
- **script.js**: JavaScript application logic for slide generation, theme management, and download functionality
- **styles.css**: Complete styling for all themes and responsive design

### Key Features

- **Real-time preview**: Changes update instantly as users edit
- **Multiple themes**: Claude Code (default), Tech Blue, Dark Mode, and Blueprint Build
- **Logo system**: Supports both custom URLs and a comprehensive logo library (50+ tech logos)
- **Decorative elements**: Randomizable icons and shapes for visual enhancement
- **Export functionality**: Downloads slides as 1280x720 PNG images using html2canvas

### Theme System

The application uses a CSS class-based theme system:
- `.claude-theme`: Orange and navy theme with Claude branding
- `.tech-theme`: Blue gradient theme for tech content
- `.dark-theme`: Green and dark theme for modern look
- `.blueprint-theme`: Blue angular theme with skewed elements

### Slide Structure

All slides follow a consistent 1280x720 layout with:
- **Text section**: Configurable title (before/highlight/after) and subtitle
- **Logo section**: Single custom logo or multiple library logos
- **Decorative elements**: Randomized icons and shapes
- **Accent shapes**: Theme-specific background elements

### JavaScript Architecture

The main script (`script.js`) is organized around:
- **Event-driven updates**: All form inputs trigger real-time slide updates
- **Theme management**: Dynamic class switching for different visual styles
- **Logo system**: Handles both single custom logos and multiple library logos
- **Drag and drop**: Interactive positioning of logos and decorative elements
- **Export system**: Uses html2canvas to generate downloadable PNG images

### Styling Approach

- **Responsive design**: Mobile-friendly with flexible scaling
- **CSS transforms**: Extensive use of skew() and rotate() for dynamic effects
- **Positioned elements**: Absolute positioning for precise layout control
- **Theme-specific overrides**: Each theme has its own color and style variants

## Important Implementation Details

- **Logo positioning**: Uses percentage-based positioning with center exclusion zones to avoid text overlap
- **Image export**: Scales slide content to exact 1280x720 dimensions for YouTube compatibility
- **Drag interaction**: Custom drag-and-drop implementation for repositioning elements
- **CDN dependency**: Relies on html2canvas CDN for export functionality
- **Icon library**: Embedded SVG icons and devicons CDN for logo library

## File Structure

```
/
├── index.html          # Main application interface
├── script.js           # Core application logic
├── styles.css          # Complete styling system
└── README.md          # User documentation
```

## Customization Points

When modifying the application:
- **Adding themes**: Create new CSS classes following the pattern `.theme-name`
- **Logo library**: Extend the logo checkboxes in index.html and update the library
- **Icon system**: Add new icon sets to the `iconLibrary` object in script.js
- **Export settings**: Modify canvas dimensions and quality in the download function