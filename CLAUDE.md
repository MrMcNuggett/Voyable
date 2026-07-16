# CLAUDE.md — Voyable Design System conventions (TREK fork)

This repository is a **TREK** fork re-skinned into the **Voyable Design System**.
The reskin is **visual only**: data model, business logic, routing, API calls,
state management and component props/behavior are unchanged from upstream TREK.
When you make design changes, keep them consistent with the rules below so the
whole app stays coherent.

> Scope reminder: this is a re-skin, not a rewrite. Do not add or remove
> features, and do not change validation rules, request payloads, store shapes,
> or routes while restyling.

## Where the tokens live

- **`client/src/index.css`** — the single source of truth for the runtime theme.
  The Voyable raw palette (`--petrol-*`, `--olive-*`, `--amber-*`, `--stone-*`,
  `--ink-*`) and the semantic tokens (`--bg-*`, `--text-*`, `--border-*`,
  `--accent*`, `--shadow-*`, radii, status) are defined in the `:root` (light)
  and `.dark` blocks.
- **`client/tailwind.config.js`** — exposes the palette + semantic tokens as
  Tailwind utilities (`bg-petrol-500`, `text-content`, `bg-accent`, `bg-surface`,
  `border-edge`, `font-display`, `font-mono`, …). Utilities resolve to the CSS
  variables — do **not** hardcode hex in components.
- **`client/src/styles/dashboard.css`** — the Dashboard has its own scoped token
  block under `.trek-dash` that mirrors the Voyable palette (stone/ink/petrol).

The design handoff bundle (tokens, screen mocks, component specs) is the design
reference; its values are already transcribed into the files above.

## Color tokens

Prefer the **semantic** tokens; reach for the raw palette only for the
deliberate brand/map surfaces called out below.

| Role | Token | Value |
|---|---|---|
| Page surface | `--bg-primary` / `bg-surface` | stone-100 `#f1f2ef` |
| Raised / card | `--bg-card`, `--bg-secondary` | white / stone-50 |
| Sunken | `--bg-tertiary` | stone-200 `#e6e7e2` |
| Primary text | `--text-primary` / `text-content` | ink-900 `#20241f` |
| Secondary / muted / faint | `--text-secondary/-muted/-faint` | ink-700 / ink-500 / ink-400 |
| Borders | `--border-primary/-secondary/-faint` | stone-300 / stone-200 / tinted |
| **Accent (primary)** | `--accent` / `bg-accent` | **petrol-500 `#276b64`** |
| Accent hover / on-surface / subtle | `--accent-hover/-on/-subtle` | petrol-600 / petrol-600 / petrol-50 |
| Secondary brand | olive scale (`--olive-300 #bfab5f`) | warm accents, gradients' 2nd stop |
| Success / warning / danger / info | `--success/-warning/-danger/-info` | Voyable status palette |

- **Petrol is the primary brand accent.** Buttons, active tabs, links, selected
  states, focus rings → petrol. New action surfaces should use `bg-accent` /
  `var(--accent)`, never a hardcoded near-black or indigo.
- A gated **legacy accent bridge** at the bottom of the token section in
  `index.css` redirects un-migrated hardcoded `bg-slate-900` / `bg-black` /
  `bg-indigo-*` action surfaces to `var(--accent)` on the default light scheme.
  This is scaffolding — when you touch such a component, migrate it to
  `bg-accent` and let the bridge shrink.

### The amber rule (route / map only)

`--accent-route` (amber, `--amber-500 #b9752c`) is **reserved exclusively** for
route lines, map pins/markers, and the `warning` state. **Never** use amber as a
general brand/UI color. The trip route polyline is drawn amber (casing
`#8a561f`, core `#c98736`) in `client/src/components/Map/MapView.tsx` and
`MapViewGL.tsx`. A map should always read as a map, never as brand UI.

### The dark-petrol accent rule (one hero surface per screen)

Deep petrol (`--petrol-700 #143a37` / `--petrol-800 #0d2725`, **never pure
black**) may be used as **one** deliberate dark "hero" surface **per screen** —
e.g. the Auth brand panel, or a single standout stat card. Everything else on
the screen stays light (stone neutrals). This is a sparse accent for visual
variety, **not** a dark mode.

Applied so far:
- **Auth** — the left brand/hero panel (`LoginPage.tsx`).
- **Dashboard** — the "Countries visited" passport tile
  (`.trek-dash .atlas-card.passport` in `dashboard.css`).

If a screen already has a dark-petrol surface, do not add a second one.

> TREK's own **dark mode** is a separate, pre-existing feature and stays intact
> (Voyable itself is light-only). The dark scheme is harmonized to a petrol
> accent but keeps dark surfaces — don't confuse it with the dark-petrol hero
> rule above.

## Typography roles

Fonts are self-hosted via `@fontsource` (imported in `client/src/main.tsx`).

| Role | Family | Token / utility | Used for |
|---|---|---|---|
| Body / UI | **Plus Jakarta Sans** (400–700) | `--font-system` / `font-sans` | everything by default |
| Display / headline | **Bricolage Grotesque** (600–800) | `--font-display` / `font-display` | `h1`/`h2`, hero titles, hero numerals |
| Data / mono | **JetBrains Mono** (400–500) | `--font-mono` / `font-mono` / `.mono` | dates, day numbers, prices, coordinates, percentages |

- The global `.mono` class (used across the app for metadata) resolves to
  JetBrains Mono. Use it for numeric/coordinate metadata.
- No Geist / Poppins references should remain in font stacks.

## Radius, shadow, motion

- **Radius** (`--radius-sm/md/lg/xl/2xl/full`): 8 / 12 / 16 / 22 / 28 / 999px.
  Soft-rounded everywhere; **no sharp corners**. Full-pill (999px) for
  buttons/tabs/badges.
- **Shadows** (`--shadow-sm/md/lg`, `--shadow-card/elevated/modal/…`): soft and
  **stone-tinted** (`rgba(32,36,35,…)`), never pure black/grey, never crisp.
- **Motion**: `ease-out` only, no bounce/spring. ~120ms hover/press, ~200ms
  fades, ~340ms panel/sheet transitions. Cards lift with a shadow increase on
  hover; buttons darken one step. No opacity-dimming on hover (reserved for
  disabled).

## Tone / copy (only when copy is already being touched)

Sentence case everywhere (no ALL CAPS except tiny mono metadata like `DAY 04`),
no exclamation marks, no travel-agency clichés. Do **not** change the meaning of
functional/validation copy — only casing/punctuation.

## Checklist before committing UI changes

- [ ] No new hardcoded hex — use tokens / Tailwind semantic utilities.
- [ ] Accent = petrol; amber only on route/map/warning.
- [ ] At most one dark-petrol hero surface on the screen.
- [ ] Headlines use the display font; numeric metadata uses `.mono`.
- [ ] `npm run build --workspace=client` passes and existing tests are green.
- [ ] Behavior/props/data flow unchanged (reskin, not rewrite).
