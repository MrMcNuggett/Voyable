# Voyable Design System

Voyable is a trip planner for individual world travelers: plan routes, places, and days visually, with optional AI assistance and personal travel advisory. It is not a package-tour booking app — it serves independent travelers designing their own itineraries.

**Business model:** the core trip planner is entirely free, no paywall, no per-trip purchase or lifetime unlock. Revenue comes only from: (a) an optional AI planning subscription, (b) personal, commission-free travel advisory as the core paid offering, and (c) affiliate commissions from an integrated hotel/accommodation search that compares prices across booking portals (Wanderlog-style) — separate from the advisory service and free of personal recommendations.

**Tone:** inviting, calm, trustworthy. Not playful/childish, not loud/colorful like booking apps, not dark/dense like a dashboard tool.

## Sources used
- [shadcn/ui](https://github.com/shadcn-ui/ui) — read for structural conventions only: CSS custom-property token naming (`--background`, `--primary`, `--radius` scale), `data-slot` component markup pattern, and `cva`-style variant structuring. Voyable's actual color palette, type, density, and component look are original and deliberately diverge from shadcn's neutral SaaS aesthetic per the brief. Explore this repo further for deeper component-engineering patterns (Radix primitives, `cn()` utility, registry structure) if extending this system into real code.
- No product codebase, Figma file, or existing brand assets were attached — this system is built from scratch against the brief below. There is no existing logo; see Iconography/Brand notes.

## Index
- `styles.css` — root stylesheet, imports everything under `tokens/`
- `tokens/` — colors, typography, spacing, effects (radius/shadow/motion), fonts
- `assets/` — logo mark + wordmark (original, see note below)
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand groups)
- `components/forms/` — Button, Input, Textarea, Select, Checkbox, DatePicker
- `components/cards/` — TripCard, DayCard, PricingCard
- `components/feedback/` — Badge, EmptyState
- `components/navigation/` — Tabs
- `ui_kits/trip-planner/` — click-through recreation: trip overview (list + route map), trip detail (day-by-day itinerary), advisory request form, empty states
- `SKILL.md` — Claude Code-compatible skill wrapper

## Components
| Component | Location |
|---|---|
| Button | components/forms/Button.jsx |
| Input | components/forms/Input.jsx |
| Textarea | components/forms/Textarea.jsx |
| Select | components/forms/Select.jsx |
| Checkbox | components/forms/Checkbox.jsx |
| DatePicker | components/forms/DatePicker.jsx |
| TripCard | components/cards/TripCard.jsx |
| DayCard | components/cards/DayCard.jsx |
| PricingCard | components/cards/PricingCard.jsx |
| Badge | components/feedback/Badge.jsx |
| EmptyState | components/feedback/EmptyState.jsx |
| Tabs | components/navigation/Tabs.jsx |

**Intentional additions:** no source defined a component inventory (greenfield brand), so the set above was authored to cover the brief's named core needs (trip cards, route/day display, date picker, pricing cards, request form, empty states) plus the minimal supporting primitives (Button, Input, Badge, Tabs) any of those need to function. Kept intentionally small — no Toast/Dialog/Tooltip/Avatar were added since nothing in the brief calls for them yet.

## Content fundamentals
- **Voice:** "you"-directed, warm and direct, never twee. German-market brief, English component copy shown here as the working language — apply the same tone in either language.
- **Casing:** sentence case everywhere (buttons, headings, labels). No ALL CAPS except tiny mono metadata labels (e.g. `DAY 04`).
- **No emoji.** Iconography carries visual warmth instead of emoji or exclamation-heavy copy.
- **Copy examples:** "Plan the trip of a lifetime" · "Add your first destination to start building the route." · "Tell us about the trip you're imagining..." · "A real person will help refine your route."
- Avoid travel-agency clichés ("book now!", "limited offer", countdowns) — Voyable is a planning tool, not a sales funnel.

## Visual foundations
- **Color:** deep petrol/teal primary (`--petrol-500 #276b64`) and warm olive secondary (`--olive-300 #bfab5f`) on a neutral, low-warmth stone page (`--stone-100 #f1f2ef` — deliberately not a yellow-leaning cream). Cool-toned ink neutrals (`--ink-*`). A separate warm amber (`--accent-route`) is reserved exclusively for route lines, map pins, and warning state — distinct from both primary and secondary, so a map always reads as a map, never as a brand-color UI element. Light scheme only, no dark mode.
- **Type:** two families. **Bricolage Grotesque** (headlines/display only, weight 600–800) gives the brand its character — humanist, warm apertures, not a swappable SaaS font. **Plus Jakarta Sans** (weight 400–600) for all body/UI copy. **JetBrains Mono** for dates, coordinates, day numbers, prices — small, quiet, functional.
- **Layout:** airy, generous whitespace (space-6/8 padding on cards, never dense). Image/cover-forward — trip cards and hero areas reserve large flat color blocks today (photography once real imagery exists); this is not a data-dashboard density.
- **Backgrounds:** flat neutral stone (`stone-100`) with soft two-stop gradients (`stone-200 → olive-100`) standing in for map/photo areas — warm olive as the second stop, never amber (reserved solely for route/map UI). No hand-drawn illustration, no repeating pattern/texture, no loud gradients.
- **Animation:** minimal and calm — `ease-out` cubic-bezier only, no bounce/spring. 120ms for hover/press, 200ms for fades, 340ms for sheet/panel transitions.
- **Hover states:** buttons darken one step (`accent-primary-hover`) and lift 1px; cards lift with a soft shadow increase. No opacity-dimming on hover (reserved for disabled).
- **Press/disabled:** disabled = flattened to `--ink-200` fill at 0.6 opacity, no shrink/scale effect anywhere (calm, not bouncy).
- **Borders:** thin (1–1.5px), neutral stone/border tones, never pure black or a colored left-accent bar.
- **Shadows:** soft and stone-tinted (`rgba(32,36,35,…)`), never pure grey/black-tinted or crisp/hard.
- **Radius:** consistently soft-rounded — 8px chips, 12–16px inputs/cards, 22–28px hero cards, full-pill buttons and tabs. No sharp corners anywhere.
- **Cards:** 1px subtle border + `shadow-sm` at rest, `shadow-lg` + 3px lift on hover, `radius-lg`/`radius-xl`.
- **Transparency/blur:** used sparingly — only for focus rings (`accent-primary-subtle` glow) and subtle tinted backgrounds (`*-subtle` tokens for badges/empty-state icon wells). No frosted-glass panels.
- **Imagery vibe (once real photos are added):** warm-toned, natural light, no heavy filters/grain/black-and-white — the palette should read like golden-hour travel photography, not a moody dashboard.

## Iconography
- **System:** [Lucide](https://lucide.dev) outline icons via CDN (`unpkg.com/lucide`), 1.5px stroke, 20–24px — matches shadcn's own icon convention, kept consistent for structural familiarity.

(Palette revised: petrol/olive replaces an earlier terracotta/cream direction that read as generic "AI-tool" styling.)
- No icon font, no PNG icon set, no emoji, no unicode-glyph icons in UI (mono metadata may use a plain "·" separator or "‹ ›" chevrons as text, not icon substitutes).
- No SVGs were authored by hand for illustrative/decorative use — hand-drawn iconography is intentionally avoided; simple geometric route dots/lines in components are layout primitives (CSS/SVG polylines), not icon substitutes.

## Logo
**No existing logo was provided.** `assets/logo-mark.svg` (a simple pin-in-circle mark) and `assets/logo-wordmark.svg` (mark + "voyable" in Bricolage Grotesque) are original placeholders created for this system, not a real brand identity. Replace with real brand assets as soon as they exist — flag this to design/marketing before shipping publicly.

## Fonts note
Bricolage Grotesque and Plus Jakarta Sans are loaded live from Google Fonts (`tokens/fonts.css`) rather than self-hosted — both are open-source and freely available there. If you'd prefer self-hosted `.woff2` files (for offline builds or stricter CSP), provide them and this file can be swapped for local `@font-face` rules with no other changes needed.

## Caveats / open questions
- No product name mark, real photography, or map data exists yet — all covers/maps are flat-color or gradient placeholders.
- Pricing screen (AI subscription + advisory tiers side by side) was not included as a full UI-kit screen per the scoping answers, but the `PricingCard` component is built and ready to compose one. There is no "free tier" pricing card — the planner itself carries no paywall.
- The affiliate hotel-search surface (price comparison across booking portals) has no screen yet — flag if you'd like it added as a fourth UI-kit screen.
- This is a from-scratch brand with no existing codebase/Figma to ground against — please review the palette, type pairing, and component set and flag anything that should shift before deeper build-out.
