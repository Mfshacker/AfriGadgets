# Design

<!-- impeccable:design-schema 1 -->

## Scope

This file records the **homepage-only** visual world in `index.html` / `css/storefront/pages/home.css` — its own dark/light-toggleable theme, distinct from the rest of the site. The rest of the storefront (`pages/*.html`) is now also dark (converted from an earlier light green/amber system after this homepage direction shipped — see `docs/STYLE-GUIDE.md` for its current tokens), but reads from `foundation.css`'s shared tokens rather than this page's `body.home-dark`-scoped ones, so the two dark themes are visually related but maintained independently. The admin dashboard (`css/admin/admin.css`) has its own separate dark palette too.

The shared header, navigation, promo bar, and breadcrumb strip **are** themed here — colors only, and only on this page (`body.home-dark` scoping keeps every other page byte-for-byte unaffected). They keep Inter (the sitewide face) and the brand logo keeps its own green, so this still reads as the same site as every other page while no longer having an untouched-white-chrome-on-dark-content seam. This is a change from earlier revisions, which deliberately left the chrome alone — see Direction history.

Written directly rather than by the shipped Impeccable documenter subagent — recorded from the built result, not aspirational.

## Direction history

**Attempt 1** (superseded): a near-black, one-accent-green, Apple-pinned minimal world. Correctly executed the brief, but read as generic dark-SaaS template — exactly the default a lot of AI-generated UIs converge on regardless of subject. Rejected on user feedback ("too generic and AI slop") and kept out of rotation rather than iterated on with color tweaks.

**Attempt 2** (superseded, concept kept): assigned by the Impeccable concept-seed script (index 5 of 7 grounded, resonance-ordered candidates drawn from this specific audience's world — South African households — rather than a pinned tech-brand reference; independently reinforced by the script's own seven-segment-display challenger, which converges on the same underlying material). The prepaid-meter/airtime-voucher concept landed — it was a real fix for "generic." Two things about the *execution* didn't: (a) a hard, jarring seam where the site's own light header met a flat black hero with no transition, and (b) the concept was expressed through too many simultaneous decorative devices at once (scanline texture, dashed borders in three different places, a three-LED cluster) — distinctive concept, but "busy" rather than "clean and minimal" on user feedback.

**Attempt 3** (superseded, concept kept): distilled the decoration (one LED not three, no scanlines, dashed borders removed, cards lost their fill color) and added a light theme so dark mode's black-hero-under-white-header seam had a non-black alternative. That fixed the seam *within the page content* — but the header/nav/promo bar themselves were still deliberately left untouched, and on user feedback ("still white — make the colors complement each other") that untouched chrome was itself the remaining seam, not fully solved by adding a light mode beneath it.

**Attempt 4** (superseded, concept kept): same concept, same distilled decoration, now themed all the way up through the chrome — promo bar, header, nav, breadcrumb all read from the same tokens as the page content, in both themes, so toggling the theme changes the *entire* page, not just what's below the nav.

**Shipped (attempt 5):** two direct, requested changes on top of attempt 4's foundation, not a new direction. (1) The hero `h1` dropped from weight 700 to Hanken Grotesk's light cut (300), on a specific visual reference the user pointed to — an airier, large-display treatment than the previous bold weight. (2) The hero gained a right-side image collage (one tall image + two stacked smaller ones) built from the three photos already sitting unused in `images/hero/` — this directly reverses the "no hero photography" gap noted in earlier revisions (see Known gaps). The three source photos have inconsistent lighting (a neon gaming rig, a macro repair shot, a white-background product photo), so each gets a brightness/saturation filter plus a warm-dark overlay to read as one consistent set rather than three unrelated stock photos.

**THESIS:** The prepaid electricity meter and the airtime voucher are the two objects this exact audience reads digits off every week — this storefront borrows their grammar instead of a borrowed tech-brand one. Dark mode is the meter's own glowing LCD; light mode is the paper voucher it prints onto — same devices, inverted material, carried through every part of the page including the chrome, so there is nowhere left for a seam to hide.

## Palette

CSS custom properties, defined in `css/storefront/pages/home.css`, scoped under `body.home-dark` (dark, default) and redefined under `body.home-dark.theme-light` (light — toggled client-side, see Theme toggle below):

| Token | Dark | Light | Use |
|---|---|---|---|
| `--home-bg` | `#18181a` (graphite, like meter-casing plastic, not pure black) | `#f7f4ee` (warm receipt-paper off-white) | Page ground |
| `--home-bg-raised` | `#212124` | `#ffffff` | Toggle button, elevated surfaces |
| `--home-border` / `--home-border-strong` | white-alpha `0.09` / `0.2` | black-alpha `0.1` / `0.22` | Hairline borders — the only device separating cards from the ground; there is no card fill color, by design |
| `--home-text` | `#f3efe8` | `#1d1a15` | Primary text |
| `--home-text-muted` | `#9c968e` | `#756e63` | Secondary text |
| `--home-accent` | `#ff9500` (LED/LCD meter-readout amber) | `#c96a08` (deeper, ink/rust amber — enough contrast on paper) | The single accent, both themes |
| `--home-accent-text` | `#1c1000` | `#fffaf2` | Text/icons on the accent color |
| `--home-readout-bg` / `--home-readout-glow` | `#100c05` / a soft amber text-shadow (backlit LCD) | `#efe6d1` / `none` (a stamped/printed mark casts no glow) | The meter/voucher readout panels specifically |

Color strategy: **Restrained** everywhere (one accent, used sparingly, border-only cards with no fill), briefly **Committed** for the power/solar promo section, where the accent takes over the full section as the page's one bold beat — the moment the meter metaphor and the actual power-equipment product line meet.

## Typography

Two faces, each doing one job — not decoration, a real division of labor:

- **Hanken Grotesk** (300–800) for all running text: headings, body copy, labels, buttons.
- **Doto** (a genuine dot-matrix/segment-display variable font) reserved *only* for numerals that represent a live count or price: the hero's "110+" product count, product prices, the promo section's "24/7" readout. This is the load-bearing move — digits read like an actual digital readout, not a themed label font applied everywhere.

The header/nav/breadcrumb strip keeps **Inter** (the site's existing sitewide face) via an explicit override, since that chrome is out of scope for this redesign.

## Components

Distilled to one device per idea rather than stacking several at once (attempt 2's scanlines + multiple dashed-border treatments + three-LED cluster read as busy, not clean):

- **The hero meter readout** (`.home-meter`): one small pulsing status LED plus a compact readout panel showing the real product count in Doto digits. No bezel housing, no scanline texture — the digit face and the amber glow (dark theme only; the light theme's printed version has no glow) are enough to read as "meter," without extra ornament.
- **Product cards as voucher stubs**: a punched-hole top edge is the *one* kept structural device (a `radial-gradient` repeated along the card's top border, no image asset). The price is set in Doto, in the accent color, with no surrounding tag/border — quieter than attempt 2's dashed "reveal window."
- **Category tiles**: icon sits inside a small inset "screen" (`.home-category-screen`), echoing the meter readout at a smaller scale — the only other place `--home-readout-bg` appears.
- **Benefits row**: plain spacing, no dividers — attempt 2's dashed receipt-line dividers were cut; four items with generous gap read clearly without them.
- **Cards have no fill color** — border only, against the page ground. One fewer color decision, and it's what "flatten structure, remove decorations that don't serve hierarchy" (the distill pass) actually asked for.
- **Buttons**: 8px radius (not a fully-rounded pill — a meter/device world reads as slightly more mechanical, less "app"), solid amber fill for primary actions.
- **Hero image collage** (attempt 5, `.home-hero-visual`): one tall image beside a column of two smaller stacked ones, 8px-radius corners and a hairline border matching the rest of the page's device language. Each image gets `filter: brightness()/saturate()` plus a warm-dark `mix-blend-mode: multiply` gradient overlay (lighter in the light theme) so three photos with unrelated lighting read as one consistent, dark-toned set. Stacks to a single row below the hero text under 1000px, shrinks further under 640px.

## Theme toggle

A small circular button, top-right of the hero (sun icon in dark mode, moon icon in light mode), toggles `theme-light` on `<body>` and persists the choice to `localStorage` (`afrigadgets-home-theme`). A tiny inline script runs before first paint (right after `<body>` opens) to read that value and apply the class immediately, so there's no flash of the wrong theme on load. Implemented in `js/pages/home.js` (`setupThemeToggle`).

## Motion

- **Hero**: immediate CSS entrance on paint (meter bezel, then headline, then copy, then actions — staggered ~0.08s apart, ~0.5s each), not gated behind a scroll observer. Content already in the first viewport must never wait on scrolling to become visible — a real bug in the first attempt (see below) made this the explicit rule going forward.
- **Below-the-fold sections**: `IntersectionObserver`-driven reveal (`setupScrollReveal()` in `js/pages/home.js`), fading/rising in once ~15% visible. Respects `prefers-reduced-motion`.
- **LED pulse**: the hero's lit status LED breathes slowly (2.4s), disabled under `prefers-reduced-motion`.

**A real bug found and fixed in the first attempt, carried forward as a rule:** hero content must animate in immediately, decoupled from any scroll-triggered mechanism — a screenshot or fast glance taken right after load must never catch it still invisible.

## Known gaps (not fabricated, flagged instead)

- **Hero photography is now used** (attempt 5) — the existing `images/hero/*.jpg` files, previously unused because they didn't fit either earlier version of this homepage, now appear in a styled collage (see Components). Featured product cards separately keep their real photography, staged on a light panel within the dark voucher-stub card.
- **Per-product photography is incomplete** in the underlying catalogue (`images/products/`) independent of this redesign; products without a photo fall back to a Font Awesome icon inside the same light stage panel.
- **The meter/voucher material is referenced at the level of shared, ownerless everyday objects** (a generic prepaid meter display, a generic scratch-card reveal window) — no real brand, utility provider, or network operator's actual product, logo, or trademarked interface was reproduced.
