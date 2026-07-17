# Handoff: TREK → Voyable Design System (visual translation)

## Overview
TREK is an existing open-source trip-planning app (React/Tailwind). This bundle is a **visual-only** re-skin of TREK's existing screens into the **Voyable Design System**. Layout structure, functionality, information architecture, and interaction logic of every screen are unchanged from TREK — only colors, typography, spacing/density, radii, shadows, motion, and component styling are replaced.

## About the design files
The 19 `.html` files in `screens/` are **design references**, built as static HTML/CSS prototypes (inline styles, no framework). They are **not production code to copy in verbatim**. The task for whoever picks this up: recreate each of these designs **inside TREK's real codebase** (its existing React components, Tailwind config, i18n system, stores/hooks) — i.e. re-skin the real TREK components using the values and patterns documented here, not by embedding these HTML files.

Open any `screens/*.dc.html` file directly in a browser to view it (double-click / drag into a tab) — each is fully self-contained once paired with the `design-system/` folder alongside it (same relative paths as in this zip).

## Fidelity
**High-fidelity.** Final colors (hex/oklch via CSS variables), typography, spacing, radii, shadows, and hover/interaction states are all final — not wireframes. Recreate pixel-close using the values below and TREK's existing component structure. A few areas are intentionally left as flat placeholders (see "Known gaps" at the end) because TREK's real implementation (Leaflet maps, uploaded photos) should be substituted in directly rather than matched pixel-for-pixel to a mock.

## Design tokens
All values live in `design-system/tokens/*.css` (source of truth) and `design-system/styles.css`. Import these as CSS variables into TREK's Tailwind theme (`tailwind.config` `extend.colors`, etc.) — do not hardcode hex values in components.

**Color** (`tokens/colors.css`):
- Primary: petrol scale `--petrol-50` … `--petrol-800` (base `--petrol-500 #276b64`)
- Secondary: olive scale `--olive-50` … `--olive-400` (base `--olive-300 #bfab5f`)
- Neutrals: stone scale (backgrounds/borders) and ink scale (dark accents, high-contrast text)
- **Amber (`--accent-route`) is reserved exclusively for route lines, map pins, and warning state** — never used as a general brand/UI color
- **Dark petrol accent exception** (documented in `dark-petrol-accent-addendum.md`): `--petrol-700`/`--petrol-800` may be used as a deliberate dark "hero" surface — max **one** per screen (e.g. auth hero panel, a single standout stat card). Never pure black. Everything else on a screen stays light/stone. Not a dark-mode toggle — the rest of the system stays light-only.
- Semantic: `--surface-page`, `--surface-raised`, `--surface-sunken`, `--border-subtle`, `--border-default`, `--text-primary/secondary/muted/faint`, `--accent-primary` (+ `-hover`), `--text-on-accent`, `--state-success-subtle` / `--success-500/700`, `--error-500`

**Typography** (`tokens/typography.css`, `tokens/fonts.css`):
- Display/headline font: **Bricolage Grotesque**, weight 600–800 — all `h1`/`h2`/hero numerals
- Body/UI font: **Plus Jakarta Sans**, weight 400–600 — everything else
- Data/mono font: **JetBrains Mono** — dates, day numbers, prices, coordinates, percentages (see `.mono` class used throughout the screens)
- Scale: `--text-xs` (12px) … up to custom hero sizes (28–64px) set inline per-screen for hero numerals/headlines
- **Replace shadcn's default Geist entirely** — no Geist references should remain anywhere in TREK's CSS/Tailwind font stack

**Spacing** (`tokens/spacing.css`): `--space-1` (4px) … `--space-8`+; screens use generous 20–32px card padding, 14–24px gaps — noticeably airier than TREK's current compact shadcn density.

**Effects** (`tokens/effects.css`):
- Radius: `--radius-sm 8px`, `--radius-md 12px`, `--radius-lg 16px`, `--radius-xl 22px`, `--radius-2xl 28px`, full-pill (999px) for buttons/tabs/badges. No sharp corners anywhere.
- Shadows: soft, stone-tinted (`rgba(32,36,35,…)`), never pure black/grey. `--shadow-sm/md/lg` scale.
- Motion: `ease-out` only, no bounce/spring. 120ms hover/press, 200ms fades, 340ms panel/sheet transitions.

## Design-system components
`design-system/components/` holds the Voyable component source (React/JSX) used as the visual reference for building this bundle: `forms/Button.jsx`, `forms/Input.jsx`, `forms/Checkbox.jsx`, `forms/Select.jsx`, `forms/Textarea.jsx`, `forms/DatePicker.jsx`, `cards/TripCard.jsx`, `cards/DayCard.jsx`, `cards/PricingCard.jsx`, `feedback/Badge.jsx`, `feedback/EmptyState.jsx`, `navigation/Tabs.jsx`. Read these for exact prop shapes, class names, and structure when recreating in TREK's real component library — replace TREK's current shadcn/ui `Button`, `Input`, `Card`, `Tabs`, `Badge` with equivalents styled to match these.

## Screens
Each file in `screens/` corresponds 1:1 to a TREK page/route, restyled only (same layout, same fields, same actions):

| File | TREK equivalent | Notes |
|---|---|---|
| `Voyable - Auth.dc.html` | Login / Register / Forgot password | Single file, in-page mode toggle (login ↔ register ↔ forgot-password ↔ sent-confirmation). Split layout: dark-petrol brand hero (left) + form card (right) |
| `Voyable - Dashboard.dc.html` | Dashboard | Hero "boarding pass" trip card, Atlas summary strip (dark-petrol "Countries visited" tile = the one hero accent), trip grid w/ Planned/Archived/Completed filter, sidebar utilities (currency converter, time zones, upcoming), FAB, new-trip modal |
| `Voyable - Trip Planner.dc.html` | Trip detail / planner | Top tab bar (Plan/Transports/Bookings/Lists/Costs/Files/Collab), flat map placeholder w/ amber route + pins, collapsible day-plan sidebar (left), collapsible places sidebar (right), add-place modal |
| `Voyable - Journey.dc.html` | Journey (travel diary) | Active-journey dark-petrol hero card, journey grid, new-journey modal |
| `Voyable - Atlas.dc.html` | Atlas (visited countries) | Full-bleed flat map placeholder, floating glass stats/bucket-list panel with tab switch |
| `Voyable - Budget.dc.html` | Costs/Budget panel | Category-grouped expense tables, sidebar: total budget, settle-up, category donut chart, add-expense modal |
| `Voyable - Vacay.dc.html` | Vacay (leave planner) | Year calendar grid (3 months visible), entitlement/used/left per traveler, legend |
| `Voyable - Collections.dc.html` | Collections (saved places) | List rail (collections), place list + filter chips + search, map panel |
| `Voyable - Packing.dc.html` | Packing lists | Category-grouped checklist, progress bar, import/apply-template actions |
| `Voyable - Files.dc.html` | File manager | Dropzone, filter chips, file rows w/ type icon, favorite/download actions |
| `Voyable - Settings.dc.html` | Settings | Sidebar nav (Display/Appearance/Map/Notifications/Offline/Account/About — Account/Display/Notifications built out, rest are nav-only placeholders), Account tab: profile fields, password change, delete account |
| `Voyable - Admin.dc.html` | Admin panel | Stat tiles, sidebar nav (Users/Default settings/Categories/Settings/Addons/Plugins/Notifications/Backups/Audit log — Users/Addons built out, rest nav-only), addon toggle list, users table |
| `Voyable - Help.dc.html` | Help / wiki | Sidebar article nav + search, markdown-style article content |
| `Voyable - Notifications.dc.html` | In-app notifications | All/Unread filter, mark-all-read/delete-all, notification list (read/unread states) |
| `Voyable - Join Trip.dc.html` | Join-trip invite (`/join/:token`) | Single confirm card, accept/cancel |
| `Voyable - Reset Password.dc.html` | Reset password (`/reset-password`) | Token form, optional MFA-code step, success state |
| `Voyable - OAuth Authorize.dc.html` | OAuth consent screen | Client identity panel + scrollable scopes-by-group list, approve/deny |
| `Voyable - Shared Trip.dc.html` | Public shared-trip link | Dark-petrol hero (the one accent for this screen), Plan/Bookings/Budget tabs, "shared via Voyable" footer badge |
| `Voyable - Collab.dc.html` | Trip Collab (Chat/Notes/Polls sub-tabs) | Segmented tab switch, chat bubbles, sticky notes list, poll cards w/ result bars |

## Interactions & behavior
- Tab switches, modal open/close, sidebar collapse, and filter toggles are implemented with simple local state in each mock (see each file's inline `<script>`-equivalent logic) — recreate as the same local UI state in TREK, no new global state needed.
- Hover states throughout: buttons darken one step + lift ~1px; cards lift with increased shadow (`shadow-sm` → `shadow-lg`) — no opacity-dimming (reserved for disabled only).
- All transitions `ease-out`, 120–340ms per the motion scale above — remove any bounce/spring easing currently in TREK's Tailwind/Framer config.
- Forms: no new validation rules — copy TREK's existing validation, only the field chrome (border, radius, focus ring) changes.

## Content/copy changes
Only stylistic — copy was adjusted to Voyable tone rules where it touched: **sentence case** everywhere (no ALL CAPS except tiny mono metadata like day numbers), **no exclamation marks**, no travel-agency clichés ("book now!", countdowns). Functional/error copy (form fields, validation messages) was left semantically identical — only casing/punctuation normalized. Do not further alter functional copy meaning during implementation.

## Known gaps — no Voyable component exists yet for these
Build these using the token values above, but there's no pre-built Voyable component to reference — flag before finalizing:
- Interactive map / route rendering (Leaflet in real TREK) — mocks use a flat gradient + amber dots as a placeholder only. Keep TREK's real Leaflet integration; just restyle its container/markers to match the amber route/pin convention.
- Modal/Dialog shell (used in New Trip, Add Place, New Journey, Add Expense)
- Navbar with account dropdown + notification bell
- Collapsible floating side-panel (day-plan / places rails in Trip Planner)
- Segmented pill filter control (distinct from the documented `Tabs` component)
- Avatar / avatar-stack
- Icon-button (toolbar actions)
- Stat/"glass" dashboard tile and boarding-pass hero card (`TripCard` component is simpler than these)
- Currency-converter / timezone / upcoming-item utility widgets
- File dropzone

## Files
```
design_handoff_voyable_trek/
├── README.md                          (this file)
├── screens/                           19 HTML mocks, one per TREK page (see table above)
└── design-system/
    ├── tokens/                        colors.css, typography.css, spacing.css, effects.css, fonts.css
    ├── styles.css                     imports all tokens
    ├── voyable-guide.md               full Voyable brand/design-system guide (tone, palette rationale, sources)
    ├── dark-petrol-accent-addendum.md the one local rule added on top of the base guide (sparse dark-accent exception)
    └── components/                    Voyable's reference component source (Button, Input, Card, Tabs, Badge, etc. — React/JSX)
```
