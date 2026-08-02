# Changelog

Notable changes to Thumbatic, newest first. Each heading is the date the work landed on `main`.

## 2026-08-02

### Added

- DeepSeek logo.
- Grok logo in a dark theme version and a light theme version.
- Layout for phones and narrow windows. The canvas scales down to fit the space so the whole thumbnail stays visible. Below 900 px the properties panel is hidden and the toolbar scrolls sideways. Editing still expects a mouse, so this is a viewing layout.
- `CHANGELOG.md` for the 2026 releases.

### Changed

- The Pencil logo is now the Pen mark after the rebrand from pencil.dev to pen.dev. The old yellow mark is removed. The `pencil` theme keeps its name and is unrelated to this logo.
- Every logo that has two versions now names the theme it belongs on. For example "GitHub (Dark Theme)" and "GitHub (Light Theme)". The old "(Inverted)" wording described a CSS filter instead of a use. The two Opencode entries had their meanings reversed. Each pair lists the dark theme version first.

### Fixed

- Claude AI and Claude Code logos were broken on the deployed site. They pointed inside `src/`. Vite does not copy that directory into the build, so they worked only in development.
- OpenAI logo returned HTTP 400 from Wikimedia. It now comes from the same CDN as Gemini.
- Tailwind CSS logo returned HTTP 404. It used an asset that changes each time tailwindcss.com deploys. It now comes from a versioned CDN.
- A leftover rule from the old prototype clamped the canvas to 480 px wide below 768 px. Element positions use 1280x720 coordinates, so text and logos spilled outside the canvas at that width.
- Export left the canvas at full size when a capture failed. The fit-to-screen scale is now restored even after an error, and the fallback capture also runs at full size.

## 2026-08-01

### Added

- Drag and drop zone for custom logo uploads. Click or press Enter to open the file picker. You can also drop an image file or an image URL from another browser tab.
- Automatic compression for uploaded images so a logo does not fill the storage quota. SVG files are never touched. A raster image keeps every pixel when it is under 600 KB and no larger than 2048 px. Larger files step down in resolution and quality only as far as the budget requires. The preview reports the stored size.
- Remove control on the upload preview. It clears the image from the field, the canvas, and the saved record at the same time, so no data URL is left behind.
- Save confirmation. The save icon becomes a green check for a moment after an explicit save.
- Two-click delete in the saved thumbnail list. The trash icon becomes a red Delete button with a cancel control. This replaces the browser alert.
- README with screenshots of the editor and all five themes. It documents the storage backends, both deployment paths, and how to add a theme. It includes a sample agent prompt and an MIT license badge.

### Changed

- Project renamed to Thumbatic in the package metadata and the page title.
- The default canvas content is now the Thumbatic sample thumbnail.
- The thumbnail name field is dual use. Type to rename, or open the saved list from a caret inside the field. The separate page icon is gone. The field is 280 px wide instead of 140 px.
- A new thumbnail selects the canvas title and highlights its text. The next keystroke starts the title, which also shows that the thumbnail was created.
- The thumbnail name follows the canvas title while the name is still the default. Renaming by hand stops the syncing.
- The theme menu uses the same frame, height, and caret as the name field.
- Local storage is the default backend in development and production. Personal deployments select the Durable Object backend through a git-ignored env file.
- Wrangler updated to 4.118.0.

### Fixed

- The first save of a new thumbnail did not work. It reset the editor to the defaults and replaced the typed name with "Untitled Thumbnail". The save had to be done twice. It now creates the record from the current design and name.
- `Ctrl`/`Cmd` + `S` did nothing at all on an unsaved thumbnail. It now uses the same save path.
- A focus and blur on the name field with no edit fired a save. It now saves only after a change.
- All lint errors, from 354 problems to zero. Stale build output in untracked directories is no longer linted. The `any` casts are replaced with the real element property types. Switch case declarations are scoped. Dead code is removed. Missing React hook dependencies are added.
- Vertical alignment of the upload label and the Remove button.

## 2026-07-31

### Added

- Pluggable storage adapter. Browser local storage is the default backend. The Durable Object backend became optional and selectable at build time.

### Changed

- The saved thumbnail list is sorted by creation time instead of update time. The order now stays stable while you work.
- Creating a new thumbnail resets the editor to the defaults first.

### Fixed

- Name input text color on the dark toolbar.
- A loading spinner now shows until a saved thumbnail finishes hydrating.

## 2026-05-07

### Added

- Cloudflare Workers deployment configuration with static asset serving and SPA routing.
- Durable Object persistence with SQLite storage behind the `/api/thumbnails` routes.
- Access gate. When a secret is set, the site requires a key once and then stores a cookie. Other visitors are redirected away.
- Opencode and Kimi logos in the AI category.

### Changed

- The Gemini logo now comes from the dashboard-icons CDN.
- The Pencil theme accent shape is quieter and sits lower.

## 2026-02-20

### Added

- Pencil light theme with amber accent shapes.
- Remotion, ElevenLabs, and Pencil logos. Non-square images now get their aspect ratio automatically.

### Changed

- The dark theme is now Codex and the tech theme is now Cloudflare.
- The title color updates automatically when you switch themes. It stays readable on light and dark backgrounds.

## 2026-01-15

### Added

- Multi-line text. Each line gets its own background box so highlights follow the text.
- Uploaded custom logos keep their aspect ratio. A wide image is no longer squashed to a square.

### Changed

- Exports render at 2x and scale down to 1280x720. Text stays crisp.
- Logos may extend up to 300 px past the canvas edge for partial logos at the border.

## 2026-01-08

### Added

- Gemini theme and the Gemini logo in the library.
