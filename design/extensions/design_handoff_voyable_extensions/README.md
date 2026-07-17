# Handoff: 6 new Voyable feature designs

Six new features designed on top of the already-migrated Voyable-styled TREK screens. These are **genuinely new functionality** — not present in TREK today — so treat this as a feature spec + visual reference for implementation, not a re-skin port. All follow the same Voyable Design System tokens/components as the rest of the product (see `design-system/`).

Screens touched: `Voyable - Auth`, `Voyable - Trip Planner`, `Voyable - Dashboard`, `Voyable - Settings`, `Voyable - Admin`, plus one new screen `Voyable - Pricing`. Open any `screens/*.dc.html` file directly in a browser to view it.

---

## 1. Google login
**Where:** `Voyable - Auth.dc.html`, below the password field / submit button, both login and register modes (not shown on the forgot-password step).
**Design:** "or" divider + full-width secondary button ("Continue with Google") using the standard 4-color G mark, pill radius, 1.5px border matching input chrome.
**To build:** wire to real Google OAuth (client ID + redirect), map to TREK's existing session/JWT flow. No new backend data model — just an additional auth provider.

## 2. Request advisory (from a trip)
**Where:**
- `Voyable - Trip Planner.dc.html`: new primary-color "Request advisory" button in the navbar, left of "Share".
- `Voyable - Dashboard.dc.html`: subtle ghost-pill link "Need help with this trip?" on the hero trip card, as a secondary entry point.
**Design:** both open the same modal — trip snapshot (name, dates, destination count, traveler count, places-saved count) + form: budget range (`Select`), start/end date, interests (text), free-text message (`Textarea`), email (`Input`).
**To build:** new `inquiries` table/endpoint (trip id, user, budget, dates, interests, message, email, status, created_at). Submit button currently just closes the modal — wire to `POST /inquiries`. Feeds into item 6 (Admin → Inquiries).

## 3. Hotel / accommodation search
**Where:**
- `Voyable - Trip Planner.dc.html` → **Bookings** tab: replaced the empty state with a search bar (location/dates/guests) + price-comparison result cards, each showing per-partner prices with the cheapest highlighted.
- Places sidebar (Plan tab): a "Compare prices" chip appears under places typed as "Stay" (e.g. Casa Alfama) — currently just switches to the Bookings tab; in production this should deep-link the Bookings search to that specific place/dates.
**Design note:** partner names in the mock ("Stayfinder", "BookNest", "InnRoute") are **placeholders** — swap for the real affiliate partners once contracted.
**To build:** integrate the real price-comparison/affiliate API (Wanderlog-style aggregator or direct partner APIs). This is commission-based, free to the user, and entirely separate from the advisory flow in item 2 — keep no personal-recommendation logic here, just neutral price sorting.

## 4. AI planning suggestion
**Where:** `Voyable - Trip Planner.dc.html` → Plan tab, right (places) sidebar — a small sparkle icon-button next to "Add place".
**Design:** for a user without the AI add-on, clicking opens an upgrade modal ("AI planning is a paid add-on") with a "See plans" link to the new Pricing screen. For a subscribed user, this same click should trigger generation directly (no mock built for the generated-result state yet — flag if you want that state designed too).
**To build:** gate on subscription entitlement (see item 5); call the AI planning endpoint when entitled, show the upgrade modal when not.

## 5. Subscription management + Pricing screen
**Where:**
- `Voyable - Settings.dc.html`: new **Subscription** tab in the sidebar — shows AI-planning status (subscribed/not), Advisory status (pay-per-request, no ongoing subscription), and a billing-history stub (empty state only — no populated invoices UI built).
- New screen `Voyable - Pricing.dc.html`: reachable from Settings → Subscription ("Upgrade"/"See plans") and from the AI-upgrade modal in item 4. Three tiles: Planner (free, always included, no CTA), AI planning (recurring, `PricingCard` component, $9/mo placeholder), Advisory (per-request, featured `PricingCard`, $79/request placeholder). Uses the `PricingCard` component from the design system, previously unused elsewhere.
**To build:** real billing integration (Stripe or similar) for the AI subscription; advisory is pay-per-request so likely a one-off checkout per inquiry rather than a subscription object. Prices shown are placeholders — confirm real pricing before shipping.

## 6. Admin: incoming advisory inquiries
**Where:** `Voyable - Admin.dc.html`, new **Inquiries** tab (new "Advisory" sidebar group).
**Design:** list of inquiries (requester, trip name, status badge, date) — click a row to expand inline and see the full trip snapshot + budget/interests/email/message, matching what was submitted in item 2's form.
**To build:** list should page/filter by status (New/Answered/Archived — only New/Answered shown in the mock). Wire to the `inquiries` table from item 2; add a status-update action (e.g. mark answered) — not built in the mock, flag if needed.

---

## Cross-cutting notes
- No new design-system components were needed beyond the gaps already flagged in the base migration handoff (Modal/Dialog shell, icon-button) — `PricingCard`, `Select`, and `Textarea` are used here for the first time; see `design-system/components/`.
- Copy stays sentence-case, no exclamation marks, no travel-agency urgency language, consistent with the rest of the system.
- All 6 additions respect the light-only palette — no new dark-petrol accent surfaces were introduced.

## Files
```
design_handoff_voyable_extensions/
├── README.md            (this file)
├── screens/             6 HTML mocks: 5 modified screens + 1 new (Pricing)
└── design-system/       tokens + reference components (same as base migration handoff)
```
