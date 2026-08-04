# CLAUDE.md

Working notes for agents. `README.md` has the project description, the architecture, and the
deployment steps. This file holds only what is easy to get wrong here, plus how this repo likes
to work.

## Verify in a browser with agent-browser

Most defects here are layout, pointer, or persistence behavior, and none of them show up in a
diff. Drive the real app with the `agent-browser` CLI. It keeps a session open between commands,
waits on real time, and can upload real files, so it needs no harness page.

```bash
npm install -g agent-browser   # if the command is missing
agent-browser install          # one time, fetches the browser binaries
```

A session looks like this:

```bash
npm run dev > /tmp/dev.log 2>&1 &
agent-browser set viewport 1500 950
agent-browser open http://localhost:5173
agent-browser wait 2000
agent-browser find text "Add Image" click
agent-browser upload "input[type=file]" /tmp/image.png
agent-browser wait 2000
agent-browser get text ".modal__url-preview-header p"
agent-browser screenshot /tmp/out.png
agent-browser close
```

Useful beyond the basics: `eval <js>` reads state straight out of the page, `set viewport`
covers phone widths, `set device <name>` emulates touch, `console` and `errors` show what the
page logged, and `snapshot` prints an accessibility tree with refs when a selector is unclear.

Notes from use:

- `find text "Add"` matches the first element containing that text, which may be a heading
  rather than the button. Use a CSS selector such as `.modal__button--primary` when it matters.
- `hover` fails when a selector matches several elements. Narrow it or use `find`.
- Generate test images with ImageMagick, which is installed. `magick -size 1600x1600
  plasma:fractal /tmp/big.png` gives a heavy file for testing compression, and
  `magick -size 400x400 xc:none -fill "#017cff" -draw "circle 200,200 200,60" /tmp/image.png`
  gives a clean flat shape.

Do not go back to a throwaway HTML page and a `--headless=new --screenshot` command. Chrome fires
its screenshot at the load event, which does not wait for a module's top level await, so the
capture comes out blank. Adding `--virtual-time-budget` fixes the timing for ordinary code but
freezes IndexedDB, so anything touching storage hangs on its first request. Both traps cost real
time before agent-browser replaced them.

## Canvas coordinates

The canvas is always 1280x720 in its own coordinate space. Element positions, snapping, and
export all depend on that.

- Never give `.thumbnail` a `max-width`, a percentage width, or `aspect-ratio`. A `max-width`
  clamps the used width even when the width is set inline, and the children then position
  themselves outside the visible box. A prototype-era media query did exactly this and broke the
  canvas below 768 px.
- On small screens the canvas is scaled with a transform. `ThumbnailGenerator` measures the
  container and writes `--canvas-scale`.
- Pointer events arrive in screen pixels. Convert them with `toCanvasPoint` or `toCanvasDelta`
  from `src/utils/canvasCoords.ts` before they reach element positions, or drags move the wrong
  distance whenever the canvas is scaled.
- Export must capture at full size. `ExportButton` suspends the transform and restores it in a
  `finally`, so a failed capture cannot leave the canvas oversized.

## Pointer input, not mouse input

Use pointer events for anything draggable or tappable, and set `touch-action: none` on
draggable elements.

A tap inside a scrolling container can be claimed by the browser as the start of a pan, and then
**no click event is ever sent**. The toolbar scrolls sideways on small screens, so controls
wired only to `onClick` did nothing on a phone while working on desktop. `useToggleHandlers` in
`Toolbar.tsx` shows the pattern: toggle on `pointerdown`, keep `onClick` for the keyboard, and
ignore a click that lands within 500 ms of the pointer press. Use a time window rather than a
flag, because a touch that turns into a scroll never sends the click and a flag would stay set
and swallow the next real click.

Text editing is a virtual cursor driven by a `document` keydown listener, with no editable
element on the canvas. A phone keyboard cannot reach it, so a coarse pointer gets
`MobileTextEditor`, a sheet with a real visible `textarea`. Three rules keep it working:

- Focus the field inside the tap handler. A phone opens the keyboard only during a user gesture,
  so the sheet stays mounted while a text element is selected and only slides into view.
- Keep the field **uncontrolled**. A controlled value rewrites the DOM on every keystroke and
  drops the caret back to the start.
- Font size at least 16px, or iOS zooms the page when the field takes focus.

An invisible field was tried first and failed. Select all, caret placement, and the space bar
cursor gesture are native behaviors that need a field the user can see. The virtual handler
ignores key events coming from a field, or every character lands twice.

## Overflow clips menus

An `overflow` value other than `visible` clips absolutely positioned descendants. Toolbar menus
therefore render **after** the toolbar, not inside it, and `useAnchoredMenu` places them with
`position: fixed` under the control that opened them. A portal is not needed. Keep the
outside-click check covering both the control and the menu.

## Storage

- `indexeddb` is the default backend everywhere, including production, so a fresh clone works
  with no server. `src/storage/config.ts` falls back to it for any unknown value. There is no
  automatic fallback to `local`, because that would hide a failure behind a 5 MB store.
- `VITE_STORAGE_BACKEND` is inlined at build time. Changing it needs a restart of the dev server
  or a rebuild.
- Personal overrides live in git-ignored `.env.production.local` and `.env.development.local`.
  Never commit a file that sets `durable-objects`, because that changes the default for everyone.
- An uploaded image is never inlined into a thumbnail record. The record holds a reference of
  the form `img:<sha-256 of the bytes>`, and the bytes live in a separate image store. Base64 in
  a record costs about 2.7 times the file size, which used to fill the 5 MB localStorage budget
  after three uploads.
- The image store has two implementations and one entry point. `src/storage/images.ts` chooses
  IndexedDB blobs for a browser backend, or an R2 bucket through the worker when the backend is
  `durable-objects`. Import that facade in components. Importing `imageStore.ts` or
  `remoteImageStore.ts` directly sends an upload to whichever store the file happens to use.
- `/api/images` is served by the worker itself, not by the Durable Object. R2 keys are
  `images/<sha-256>`, the name, width, and height ride along as R2 custom metadata, and the size
  and upload date come from the object, so images need no database table. Responses carry a one
  year immutable cache header, which is safe because different bytes always mean a different key.
- A PUT to `/api/images/<id>` recomputes the SHA-256 of the body and answers 400 unless it
  matches the id in the path. Without that check a client could store chosen bytes under any key.
  When the key already exists the worker returns the stored record without reading the body,
  which is what makes re-adding an image you already have cost nothing.
- Uploading the same file twice stores it once. The original file is hashed before any
  compression and remembered in the `sources` store in IndexedDB, so a repeat upload is
  recognised without compressing it again. The compressed bytes are hashed separately, and that
  hash is the id.
- Compression happens before storage, in `src/utils/imageStorage.ts`. An image already under
  600 KB and no larger than 2048 px is stored byte for byte. Anything larger steps resolution and
  quality down one notch at a time, stopping at the first size that fits.
- Rendering an image goes through `useImageSrc`. It turns an `img:` reference into something an
  `img` tag can use, an object URL for a local blob or a plain `/api/images/<id>` URL for R2, and
  caches the result per image. A raw reference in an `img` tag renders nothing.
- Nothing deletes an uploaded image except the user, in Your Uploads. The image store is the
  personal library, so an upload stays whether or not a thumbnail uses it. There used to be a
  mark and sweep pass at start-up that kept only images on a saved canvas. It deleted an upload
  that had not been placed yet, and it deleted one the moment you took it off a canvas, which is
  the opposite of what a library is for. Do not reintroduce a pass that deletes by reachability.
- The Durable Object backend uses one global instance and has no per-user authentication.

## Wrangler will not log in

If a `wrangler` command fails with `Invalid access token [code: 9109]` while `wrangler login`
claims success, look for an uncommented `CLOUDFLARE_API_TOKEN` in `.env`. Wrangler reads `.env`
and an API token takes priority over OAuth, so the login never happens. Check with
`wrangler whoami --env-file /dev/null`. Keep `CLOUDFLARE_ACCOUNT_ID`; only the token breaks it.

## Image library

- The word is image, not logo, everywhere in the UI and the code. These were never limited to
  logos. Internal names follow: element type `image`, `IMAGE_LIBRARY`, `imageUrl`, and so on.
- Local assets belong in `public/`. A path under `src/assets/` works in `npm run dev` and 404s in
  the build, so it fails only on the deployed site.
- Prefer versioned CDNs. `cdn.jsdelivr.net/gh/devicons/devicon` and
  `cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons` are already in use. An image taken from a
  product's own site breaks the next time they deploy.
- When an image has two versions, the label names the theme it is for: `GitHub (Dark Theme)` and
  `GitHub (Light Theme)`. The parenthesis never means the image's own colour. List the dark theme
  entry first, since four of the five themes are dark.
- Decide which version is which by measuring, not by reading the file name. Draw the icon on a
  canvas, apply its `invert` flag, and average the luminance of the visible pixels.

## Checks

IndexedDB and `crypto.subtle` do not exist in jsdom, and IndexedDB does not advance under
Chrome's `--virtual-time-budget`, so a browser harness will hang on the first request. Test
storage in Vitest instead, where `fake-indexeddb` provides the real API. Object URLs are stubbed
in `src/test/setup.ts`, since fake-indexeddb returns plain objects in place of blobs.

`npm run lint`, `npm test`, and `npm run build` all have to pass. Lint sits at zero problems, so
any output is something you introduced. Tests cover first-save behavior, the name that follows
the canvas title, and canvas coordinate conversion.

Do not add `console.log` to shipped code, and do not add a browser `alert()` or `confirm()`.
This UI shows errors inline and confirms destructive actions in place.

## Conventions

- The changelog entry goes in the **same commit** as the change it describes.
- Order the bullets inside each group by what matters most to a reader, not by the order the
  work happened. New capability first, then changes to what you see or how you work, then
  internal or cosmetic changes. Break ties by how much of the app the change touches. The
  `CHANGELOG.md` line itself always goes last in an Added group.
- `CHANGELOG.md` is date based, newest first. One line per bullet with no hard wrapping, because
  hard wraps make bullets ragged in an editor and noisy in a diff.
- Deploy with `npm run deploy:prod`. The live site sits behind a `GATE_SECRET` cookie, so a plain
  request redirects to buildatscale.tv. That is the gate, not a broken deploy.

## Writing style

- No em dashes anywhere, in prose or in the UI.
- Short sentences. Avoid the padded construction "X, with Y" or "X, covering Y" repeated down a
  list. Split it into two sentences instead.
- State the cause when reporting a fix, not only the symptom.
- Do not claim something works without evidence. Measure it, screenshot it, or say plainly that
  it is unverified.
