# CLAUDE.md — Voyable (TREK fork)

Durable conventions for this repo. Read this before touching design, styling, or the feature areas listed below. Written in English since it mirrors the design-system token names, component props, and existing TREK code — keep it that way for consistency with the codebase.

## What this project is

Voyable is a free, open trip planner (TREK fork) paired with a paid, personal travel advisory service. The **software is not the differentiator** — it's a free tool and door-opener. The advisory (human, commission-free) is the actual business. Keep that priority in mind when a feature request could blur the two:

- Core trip planner: free, no paywall, no per-trip purchase.
- AI planning: paid subscription add-on.
- Personal advisory: paid per request, **commission-free**, no hotel recommendations inside it.
- Hotel/accommodation affiliate search: free to the user, monetized via affiliate commission, lives entirely in the self-service planner tool — **never mixed into the advisory flow**, structurally as well as visually.

## Stack

- **Backend:** NestJS 11, WebSocket for realtime sync, SQLite via `better-sqlite3`, auth via JWT + OAuth 2.1 + OIDC + Passkeys (WebAuthn) + TOTP-MFA.
- **Frontend:** React + Zustand, Tailwind CSS + shadcn/ui (being re-skinned — see Design System below).
- **Maps:** Leaflet + Mapbox GL — keep the real integration; only restyle container/markers (see Known gaps).
- **AI planning:** Anthropic API, Sonnet model.
- **Hosting target:** Hetzner VPS, Docker (`mauriceboe/trek` official image as baseline), Caddy reverse proxy with automatic HTTPS.

## Design system — Voyable

Source of truth: `design-system/tokens/*.css` + `design-system/styles.css`. Import as CSS variables into Tailwind theme (`tailwind.config.extend.colors`, etc.). **Never hardcode hex values in components.** Fully replace shadcn's default Geist font — no Geist references should remain anywhere.

### Color
- Primary: petrol scale, base `--petrol-500 #276b64` (50→800: `#eaf2f1 … #0d2725`)
- Secondary: olive scale, base `--olive-300 #bfab5f`
- Neutrals: stone (backgrounds/borders, `#fbfbfa`→`#d5d7d0`), ink (text/dark accents, `#20241f`→`#dcdfda`)
- `--accent-route` (amber) is reserved **exclusively** for route lines, map pins, and warning state — never a general brand/UI color
- Semantic tokens: `--surface-page/raised/sunken`, `--border-subtle/default/strong`, `--text-primary/secondary/muted/faint`, `--accent-primary(+hover/press/subtle)`, `--text-on-accent`, `--state-success/warning/error/info(+subtle)`, `--focus-ring`
- **Dark petrol accent exception:** `--petrol-700`/`--petrol-800` may be used as a deliberate dark "hero" surface — **max one per screen** (e.g. auth hero panel, one standout stat card like "Countries visited"). Never pure black. This is not a dark-mode toggle; every other surface on a screen stays light/stone.

### Typography
- Display/headline: **Bricolage Grotesque**, weight 600–800 — all `h1`/`h2`/hero numerals only
- Body/UI: **Plus Jakarta Sans**, weight 400–600 — everything else
- Data/mono: **JetBrains Mono** — dates, day numbers, prices, coordinates, percentages (`.mono` in the reference screens)
- Scale: `--text-xs` (12px) … `--text-7xl` (72px); hero numerals/headlines may use custom inline sizes (28–64px)
- Loaded live from Google Fonts (`tokens/fonts.css`); swap for self-hosted `.woff2` only if offline/CSP requires it

### Spacing / effects
- Spacing: `--space-1` (4px) … `--space-32` (128px); cards use generous 20–32px padding, 14–24px gaps — airier than TREK's current shadcn density
- Radius: `--radius-sm` 8px … `--radius-2xl` 28px, full-pill (999px) for buttons/tabs/badges — **no sharp corners anywhere**
- Shadows: soft, stone-tinted (`rgba(32,36,35,…)`), never pure black/grey — `--shadow-sm/md/lg`
- Motion: `ease-out` only, no bounce/spring — 120ms hover/press, 200ms fades, 340ms panel/sheet transitions
- Hover: buttons darken one step + lift ~1px; cards lift with increased shadow — no opacity-dimming (reserved for disabled only)

### Components to re-skin
Replace these shadcn/ui equivalents with versions matching `design-system/components/`: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `DatePicker`, `TripCard`, `DayCard`, `PricingCard`, `Badge`, `EmptyState`, `Tabs`. The JSX in that folder is a **visual/prop reference only** (inline styles + `data-slot`/`data-variant` attributes, no Tailwind) — recreate as real Tailwind classes bound to the tokens above, not by copying the inline-style objects verbatim. Keep the `data-slot` markup convention (borrowed from shadcn) for structural familiarity.

### Content/tone
Sentence case everywhere (no ALL CAPS except tiny mono metadata like day numbers). No exclamation marks. No travel-agency clichés ("book now!", countdowns, urgency language). No emoji. Functional/error copy (validation messages, field labels) keeps its exact meaning — only casing/punctuation may be normalized, never the semantics.

## Screens ↔ TREK routes (base re-skin, 19 screens + Pricing)

Visual-only re-skin — same layout, same fields, same actions as current TREK, only styling changes:

| Screen | TREK route | Notes |
|---|---|---|
| Auth | Login/Register/Forgot password | Split layout: dark-petrol hero (left) + form (right). This is the one screen using the dark-accent exception. |
| Dashboard | Dashboard | Hero "boarding pass" trip card, Atlas summary strip (dark-petrol "Countries visited" tile = the one hero accent), trip grid, sidebar utilities, FAB |
| Trip Planner | Trip detail | Tab bar (Plan/Transports/Bookings/Lists/Costs/Files/Collab), map + amber route/pins, collapsible day/places sidebars |
| Journey | Travel diary | Active-journey dark-petrol hero card, journey grid |
| Atlas | Visited countries | Full-bleed map, floating glass stats/bucket-list panel |
| Budget | Costs panel | Category tables, sidebar totals, settle-up, donut chart |
| Vacay | Leave planner | Year calendar grid, entitlement/used/left per traveler |
| Collections | Saved places | List rail + filter chips + map panel |
| Packing | Packing lists | Category checklist, progress bar |
| Files | File manager | Dropzone, filter chips, type icons |
| Settings | Settings | Sidebar nav; Account/Display/Notifications built, rest nav-only; **new Subscription tab** (see feature 5 below) |
| Admin | Admin panel | Stat tiles, sidebar nav; Users/Addons built, rest nav-only; **new Inquiries tab** (see feature 6 below) |
| Help | Help/wiki | Sidebar article nav + search |
| Notifications | In-app notifications | All/Unread filter |
| Join Trip | `/join/:token` | Single confirm card |
| Reset Password | `/reset-password` | Token form + optional MFA step |
| OAuth Authorize | OAuth consent | Client identity + scopes list |
| Shared Trip | Public share link | Dark-petrol hero, Plan/Bookings/Budget tabs |
| Collab | Trip Collab | Chat/Notes/Polls segmented tabs |
| **Pricing** *(new)* | New screen | See feature 5 below |

Interaction notes: tab/modal/sidebar/filter state is simple local UI state, no new global state needed. Forms keep TREK's existing validation — only field chrome (border, radius, focus ring) changes.

## New features (extension handoff — genuinely new functionality, not a re-skin)

### 1. Google login
Auth screen, below password field (login + register, not forgot-password): "or" divider + "Continue with Google" button. Wire to real Google OIDC, map into TREK's existing session/JWT flow — **no new data model**, just an additional auth provider. Setup: OAuth client in Google Cloud Console, redirect URI `https://<domain>/api/auth/oidc/callback`, `OIDC_ISSUER=https://accounts.google.com` + client ID/secret in TREK config. Can run alongside password login (mixed setup, separate toggles for login vs. registration).

### 2. Request advisory (from a trip)
Entry points: primary "Request advisory" button in Trip Planner navbar (left of Share), plus a ghost-pill "Need help with this trip?" link on the Dashboard hero card. Both open one modal: frozen trip snapshot (name, dates, destination/traveler/places-saved counts) + form (budget range, start/end date, interests, free-text message, email). Submit → new `inquiries` table/endpoint (trip id, user, budget, dates, interests, message, email, status, created_at). Feeds into feature 6.

### 3. Hotel/accommodation search
Trip Planner → **Bookings** tab: search bar (location/dates/guests) + price-comparison cards, cheapest partner highlighted. A "Compare prices" chip on places typed as "Stay" in the Plan-tab sidebar should deep-link into this search for that place/dates. Partner names in the mock are placeholders — swap for real affiliate partners once contracted. Commission-based, free to the user, **entirely separate from the advisory flow** — no personal-recommendation logic here, neutral price sorting only.

### 4. AI planning suggestion
Trip Planner → Plan tab, places sidebar: sparkle icon-button next to "Add place". Not entitled → upgrade modal ("AI planning is a paid add-on") linking to Pricing. Entitled → triggers generation directly (no generated-result state designed yet — flag before building if needed). Gate on subscription entitlement from feature 5.

### 5. Subscription management + Pricing screen
Settings → new **Subscription** tab: AI-planning status, Advisory status (pay-per-request, not a subscription), billing-history stub (empty state only). New **Pricing** screen (from Settings or the feature-4 upgrade modal): three `PricingCard` tiles — Planner (free, no CTA), AI planning (recurring, placeholder $9/mo), Advisory (per-request, featured card, placeholder $79/request). **Prices are placeholders — confirm real pricing before shipping.** Advisory is pay-per-request, so likely a one-off checkout per inquiry rather than a subscription object. Payment provider still open (Stripe direct vs. Paddle/LemonSqueezy with bundled EU tax handling) — decide before building checkout.

### 6. Admin: incoming advisory inquiries
Admin → new **Inquiries** tab (new "Advisory" sidebar group): list (requester, trip name, status badge, date), click row to expand full trip snapshot + budget/interests/email/message. Page/filter by status (New/Answered/Archived — only New/Answered in the mock). Add a status-update action (e.g. mark answered) — not built in the mock, flag if needed.

## Known component gaps (no Voyable reference yet — build from tokens, flag before finalizing)
Modal/Dialog shell, navbar with account dropdown + notification bell, collapsible floating side-panel (day-plan/places rails), segmented pill filter (distinct from `Tabs`), avatar/avatar-stack, icon-button (toolbar actions), stat/"glass" dashboard tile + boarding-pass hero card, currency-converter/timezone/upcoming-item utility widgets, file dropzone.

## Backend changes this implies (see project plan §8c for full detail)
- New `inquiries` table + endpoint; reuse TREK's existing Nodemailer/SMTP setup for confirmation + notification emails (just needs a transactional-mail SMTP account, e.g. Resend/Postmark/SendGrid) — no new mail integration.
- New hotel-affiliate endpoint (price lookup against a partner program), optional cache table against repeated live queries — deliberately **not** linked to `inquiries`.
- Subscription/payment fields on the user account, payment-provider webhook handling, AI-planning endpoint gated on active subscription with a per-account usage cap.
- Registration model: enable open self-registration (email + password) as the default instead of TREK's admin-invite-link default; Google OIDC as an additional, simultaneously-available option.

## Legal / AGPL conventions
- The whole running program — including every custom addition above (inquiries, AI endpoint, affiliate endpoint, subscription logic) — stays under AGPLv3 as one covered work. No closed/proprietary layer bolted on top.
- Public fork repo must stay in sync with what's actually deployed (AGPL §13 — network use triggers the source-availability obligation).
- Never commit secrets (Anthropic API key, Stripe/Paddle, TravelPayouts, SMTP credentials) — env vars only, always `.gitignore`'d.
- Don't add extra restrictive terms to AGPL-covered code (e.g. no "not for competing products" clauses) — only the narrow §7 exceptions (warranty disclaimer, attribution, trademark, indemnification) are allowed.

## Build order reminders
- Fork TREK 1:1 first; tag/branch the untouched baseline (`baseline-trek`) before any change.
- Design happens in Claude Design against the real (forked) repo, per screen/feature, before backend work — don't guess backend fields/endpoints upfront.
- Advisory and hotel-affiliate paths must stay structurally separate in code, not just visually — no shared recommendation logic, no commission inside the advisory flow.