# Changelog

Notable changes to Thumbatic, newest first. Each heading is the date the work landed on `main`.

## 2026-08-01

### Added

- Drag and drop zone for custom logo uploads. Click or press Enter to open the file picker, drop
  an image file, or drop an image URL from another browser tab.
- Automatic compression for uploaded images, so a logo does not fill the storage quota. SVG files
  are never touched. A raster image keeps every pixel when it is under 600 KB and no larger than
  2048 px. Larger files step down in resolution and quality only as far as the budget requires,
  and the preview reports the stored size.
- Remove control on the upload preview. It clears the image from the field, the canvas, and the
  saved record at the same time, so no data URL is left behind.
- Save confirmation. The save icon becomes a green check for a moment after an explicit save.
- Two-click delete in the saved thumbnail list. The trash icon becomes a red Delete button with a
  cancel control, in place of the browser alert.
- README with screenshots of the editor and all five themes, the storage backends, both deployment
  paths, a guide for adding a theme with a sample agent prompt, and an MIT license badge.
- `CHANGELOG.md`.

### Changed

- Project renamed to Thumbatic in the package metadata and the page title.
- The default canvas content is now the Thumbatic sample thumbnail.
- The thumbnail name field is dual use: type to rename, or open the saved list from a caret inside
  the field. The separate page icon is gone, and the field is 280 px wide instead of 140 px.
- A new thumbnail selects the canvas title and highlights its text, so the next keystroke starts
  the title and it is clear that the thumbnail was created.
- The thumbnail name follows the canvas title while the name is still the default. Renaming by
  hand stops the syncing.
- The theme menu uses the same frame, height, and caret as the name field.
- Local storage is the default backend in development and production. Personal deployments select
  the Durable Object backend through a git-ignored env file.
- Wrangler updated to 4.118.0.

### Fixed

- The first save of a new thumbnail did not work. It reset the editor to the defaults and replaced
  the typed name with "Untitled Thumbnail", so the save had to be done twice. It now creates the
  record from the current design and name.
- `Ctrl`/`Cmd` + `S` did nothing at all on an unsaved thumbnail. It now uses the same save path.
- A focus and blur on the name field with no edit fired a save. It now saves only after a change.
- All lint errors, from 354 problems to zero: stale build output in untracked directories is no
  longer linted, `any` casts are replaced with the real element property types, switch case
  declarations are scoped, dead code is removed, and missing React hook dependencies are added.
- Vertical alignment of the upload label and the Remove button.

## 2026-07-31

### Added

- Pluggable storage adapter, with browser local storage as the default backend. The Durable Object
  backend became optional and selectable at build time.

### Changed

- The saved thumbnail list is sorted by creation time instead of update time, so the order stays
  stable while you work.
- Creating a new thumbnail resets the editor to the defaults first.

### Fixed

- Name input text color on the dark toolbar.
- A loading spinner now shows until a saved thumbnail finishes hydrating.

## 2026-05-07

### Added

- Cloudflare Workers deployment configuration, including static asset serving and SPA routing.
- Durable Object persistence with SQLite storage behind the `/api/thumbnails` routes.
- Access gate. With a secret set, the site requires a key once and stores a cookie. Other visitors
  are redirected away.
- Opencode and Kimi logos in the AI category.

### Changed

- The Gemini logo now comes from the dashboard-icons CDN.
- The Pencil theme accent shape is quieter and sits lower.

## 2026-02-20

### Added

- Pencil light theme, with amber accent shapes.
- Remotion, ElevenLabs, and Pencil logos, with automatic aspect ratio for non-square images.

### Changed

- The dark theme is now Codex, and the tech theme is now Cloudflare.
- The title color updates automatically when you switch themes, so it stays readable on light and
  dark backgrounds.

## 2026-01-15

### Added

- Multi-line text. Each line gets its own background box, so highlights follow the text.
- Uploaded custom logos keep their aspect ratio, so a wide image is no longer squashed to a square.

### Changed

- Exports render at 2x and scale down to 1280x720, which keeps text crisp.
- Logos may extend up to 300 px past the canvas edge, for partial logos at the border.

## 2026-01-08

### Added

- Gemini theme, and the Gemini logo in the library.
