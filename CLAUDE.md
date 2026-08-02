# CLAUDE.md

Working notes for agents. `README.md` has the project description, the architecture, and the
deployment steps. This file holds only what is easy to get wrong here, plus how this repo likes
to work.

## Verify in a browser, not by reading

Most defects here are layout, pointer, or persistence behavior, and none of them show up in a
diff. The pattern that works: write a throwaway HTML page in the project root, mount the real
`App`, drive it, print the result into the page, then screenshot it with headless Chrome.

```bash
npm run dev > /tmp/dev.log 2>&1 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --window-size=1600,1000 --virtual-time-budget=20000 --screenshot=/tmp/out.png \
  http://localhost:5173/my-harness.html
```

Delete the harness when you are done, and stop the dev server with
`lsof -ti tcp:5173 | xargs kill`.

Two traps in that setup:

- Headless Chrome will not make a window narrower than about 500 px. For phone widths, put the
  app in an `<iframe>` of the exact size inside a larger page. Media queries follow the frame.
- Screenshots freeze CSS transitions at their start value, so a colour you measure may be the
  "from" colour. Add `* { transition: none !important }` in the harness before measuring.

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

## Overflow clips menus

An `overflow` value other than `visible` clips absolutely positioned descendants. Toolbar menus
therefore render **after** the toolbar, not inside it, and `useAnchoredMenu` places them with
`position: fixed` under the control that opened them. A portal is not needed. Keep the
outside-click check covering both the control and the menu.

## Storage

- `local` is the default backend everywhere, including production, so a fresh clone works with
  no server. `src/storage/config.ts` falls back to it for any unknown value.
- `VITE_STORAGE_BACKEND` is inlined at build time. Changing it needs a restart of the dev server
  or a rebuild.
- Personal overrides live in git-ignored `.env.production.local` and `.env.development.local`.
  Never commit a file that sets `durable-objects`, because that changes the default for everyone.
- Uploaded logos are stored as data URLs inside the record, so they count against the quota.
  `src/utils/imageStorage.ts` keeps an image untouched when it is already under 600 KB and no
  larger than 2048 px, and only then steps quality down.
- The Durable Object backend uses one global instance and has no per-user authentication.

## Wrangler will not log in

If a `wrangler` command fails with `Invalid access token [code: 9109]` while `wrangler login`
claims success, look for an uncommented `CLOUDFLARE_API_TOKEN` in `.env`. Wrangler reads `.env`
and an API token takes priority over OAuth, so the login never happens. Check with
`wrangler whoami --env-file /dev/null`. Keep `CLOUDFLARE_ACCOUNT_ID`; only the token breaks it.

## Logo library

- Local assets belong in `public/`. A path under `src/assets/` works in `npm run dev` and 404s in
  the build, so it fails only on the deployed site.
- Prefer versioned CDNs. `cdn.jsdelivr.net/gh/devicons/devicon` and
  `cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons` are already in use. A logo taken from a
  product's own site breaks the next time they deploy.
- When a logo has two versions, the label names the theme it is for: `GitHub (Dark Theme)` and
  `GitHub (Light Theme)`. The parenthesis never means the icon's own colour. List the dark theme
  entry first, since four of the five themes are dark.
- Decide which version is which by measuring, not by reading the file name. Draw the icon on a
  canvas, apply its `invert` flag, and average the luminance of the visible pixels.

## Checks

`npm run lint`, `npm test`, and `npm run build` all have to pass. Lint sits at zero problems, so
any output is something you introduced. Tests cover first-save behavior, the name that follows
the canvas title, and canvas coordinate conversion.

Do not add `console.log` to shipped code, and do not add a browser `alert()` or `confirm()`.
This UI shows errors inline and confirms destructive actions in place.

## Conventions

- The changelog entry goes in the **same commit** as the change it describes. Inside an Added
  group, keep the `CHANGELOG.md` line last.
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
