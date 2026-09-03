# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

AfriGadgets is a static online shop (phones, gadgets, electronics, appliances, power products) for South Africa. It is pure HTML/CSS/JavaScript with **no build step and no package manager** — every page runs directly in the browser. Accounts, the product catalogue, store settings, and orders are all backed by Supabase (Postgres + Auth). Only the shopping cart remains client-only, via `localStorage`.

## Running and testing

Open `index.html` directly, or serve it with VS Code Live Server (workspace is configured for port `5501`):

```text
http://127.0.0.1:5501/index.html
```

Google Fonts and Font Awesome are loaded from CDNs, so an internet connection is needed for correct styling.

Run the validation script before submitting any change:

```powershell
./tests/validate-project.ps1
```

It checks (from repo root, no test framework involved):
- every local `href`/`src` in HTML files resolves to a real file
- `css/storefront/style.css` `@import` targets exist
- all JS files under `js/` and `admin/` pass `node --check` (syntax only)
- no code still uses the old `afrigadgetsCart` localStorage key (must be `afrigadgets-cart`)

For navigation or asset changes, also open the affected page in a browser via Live Server — the validation script does not catch visual/runtime issues.

## Architecture

**Data model:** almost everything lives in Supabase now; only the cart is `localStorage` (`afrigadgets-cart`).
- `profiles` — one row per account, `role` = `customer` or `admin`, auto-created by a trigger on signup (self-healed by `js/shared/auth.js` if that trigger didn't fire — see `docs/AUTHENTICATION.md`).
- `products` — the catalogue (publicly readable, admin-only write). Loaded async by `js/shared/products.js` into the same `products` global everything else already expects — see script layering below.
- `store_settings` — a single row of site-wide config (bank details, delivery fee, payment instructions); publicly readable, admin-only write.
- `orders` / `order_items` — **no client insert policy at all.** The only way to create an order is the `create_order()` database function, which takes only `{product_id, quantity}` pairs and computes prices/totals itself from `products` and `store_settings` — a client can never influence what an order actually costs. See "Order pricing" in `docs/AUTHENTICATION.md`.
- All of the above protected by Row Level Security (`is_admin()` gates admin-wide access) — see `docs/AUTHENTICATION.md` for exact policies.

**Script layering — load order matters:** shared scripts must load before page scripts on every page.
- Supabase SDK `<script>` tag → `js/shared/auth-config.js` → `js/shared/auth.js` → `js/shared/products.js` — in that order, on every page that loads `products.js` (which is most of them), since `products.js` now needs a Supabase client to fetch the catalogue.
- `js/shared/products.js` — exposes `window.productsReady` (a promise) and populates the same `products` array/global that every consumer already expects, by mutating it in place once the fetch resolves. Any code that reads `products` on page load must `await window.productsReady` first (see `home.js`, `shop.js`, `product.js`) — the same pattern `admin/shared.js`'s `initAdminPage()` uses for `window.adminSessionReady`.
- `js/shared/main.js` — price formatting (`formatPrice`, `en-ZA`/ZAR), cart count badge, path helpers (`getStorePageUrl`, `getStoreAssetUrl` — these branch on whether `window.location.pathname` contains `/pages/` so the same script works from root and from `pages/`), search redirect, active-nav-link highlighting
- `js/shared/auth.js` — Supabase client + `requireAccountSession()`/`requireAdminSession()`
- `js/pages/{home,shop,product,cart,checkout,login,signup,account}.js` — one script per storefront page, each depending on the shared layer(s) above being loaded first

Note: `js/shared/products.js` and `js/shared/main.js` each independently implement product-card rendering and add-to-cart (`createProductCard`/`addProductToCart` vs. `displayFeaturedProducts`/`addToCart`) — pre-existing duplication, not something introduced by the Supabase migration. `home.js`'s `loadFeaturedProducts()` is what actually renders on the homepage; `main.js`'s `displayFeaturedProducts()` runs too but gets overwritten. Worth consolidating eventually, out of scope for now.

**Path handling:** because `index.html` lives at repo root but all other customer pages live under `pages/`, relative paths differ by depth (`pages/*.html` use `../css`, `../js`, `../images`). Prefer the `getStorePageUrl`/`getStoreAssetUrl` helpers in `main.js` over hardcoding relative paths when writing shared code that runs on both root and `pages/` pages.

**Footer:** the same four-column footer markup (Brand / Shop / Help / Contact, including a real WhatsApp link) is duplicated across `index.html` and every `pages/*.html` page that has one — not every page does (checkout/login/signup/account and a few content pages currently don't). Its blur-fade-in-on-scroll (`[data-footer-reveal]`) and the dynamic copyright year (`.footer-year`) are driven by shared code in `main.js`, independent of `home.js`'s own homepage-only reveal system, so both work without colliding on `index.html`, which loads both scripts. When changing the footer, update every page's copy — there is no shared include/partial.

**CSS layering:** `css/storefront/style.css` is an import-only manifest (do not put rules directly in it) — every page that loads `style.css` gets **all** of the `@import`ed files, not just the one matching that page; there's no per-page selective loading despite the `pages/` folder name. Load order: `foundation.css` (reset/variables/base) → `shared.css` (shared layout/components) → every file in `css/storefront/pages/` → `overrides.css` (loads last, for rules that must win). Because of that unconditional import, a page-specific stylesheet that redeclares shared tokens in its own `:root` block (as `content.css` does) silently overrides `foundation.css` on *every* page, not just its own — a real bug found this way once already, so don't add a new `:root` block to a page stylesheet.

**Storefront theme:** the whole storefront (every page under `pages/`, plus shared chrome) is dark — near-black backgrounds, light text, the brand green (`--primary`) as the one accent — driven by the shared tokens in `foundation.css`. The Contact page and the admin dashboard each maintain an independent palette (`css/pages/contact.css`, `css/admin/admin.css` — the latter a dark indigo-violet CoreUI-inspired theme) rather than reading `foundation.css`'s tokens, so a color change there needs its own pass; both happen to already be dark, but that's not guaranteed to stay in sync with the storefront tokens automatically. The homepage (`index.html` + `css/storefront/pages/home.css`) has its own separate single black/white/gold theme system scoped to `the homepage` — see `DESIGN.md`. Full color/type/component reference: `docs/STYLE-GUIDE.md`.

**Accounts are unified, not admin-only:** there is one sign-in page for everyone.
- `pages/login.html` + `js/pages/login.js` — shared sign-in; after auth succeeds, it reads the caller's own `profiles.role` and redirects (`admin` → `admin/index.html`, `customer` → `pages/account.html`). There is no separate admin login page.
- `pages/signup.html` + `js/pages/signup.js` — customer self-signup only; `role` always defaults to `customer` server-side (a trigger sets it), nothing client-side can request `admin`. Promoting an account to admin is a manual SQL step (see `docs/AUTHENTICATION.md`).
- `pages/account.html` + `js/pages/account.js` — a signed-in customer's own order history, guarded by `requireAccountSession()`.
- `admin/guard.js` — checks for an active Supabase session **and** `role === 'admin'` via `requireAdminSession()`; a signed-in customer who navigates to any `admin/*.html` page is signed out and bounced, not just left at a login wall. Sets `window.adminAuthClient`, `window.adminProfile`, and `window.adminSessionReady` (a promise) for every admin page to await before making any Supabase calls — there's a real race otherwise, since the auth check is async but `DOMContentLoaded` fires independently of it.
- The dashboard is real separate pages, not one page with JS-toggled tabs: `admin/index.html` (Dashboard), `admin/products.html`, `admin/orders.html`, `admin/customers.html`, `admin/settings.html`, `admin/account.html`. Each loads `guard.js` → `admin/shared.js` (small formatting helpers, sidebar active-link highlighting, `initAdminPage(onReady)` — every page's script calls this once on load — plus the shared chrome setup: `setupSidebarToggle()`, `setupHeaderScrollShadow()`, `setupUserMenu()`, `renderBreadcrumb()`) → its own page script (`dashboard.js`, `products.js`, etc.). Everything reads/writes Supabase directly; nothing here uses `localStorage` any more. Products has search/category-filter/pagination client-side over the full fetched catalogue (110-ish rows, small enough not to need server-side pagination).
- The admin layout is CoreUI-inspired (structure and colors, not the React library itself — everything here is still plain HTML/CSS/JS): a collapsible sidebar (icon-only via a `--sidebar-width`/`--sidebar-width-collapsed` CSS custom-property swap on `.admin-layout`, state persisted to `localStorage`), a sticky header with a breadcrumb strip and a user dropdown menu (My Account / Settings / Sign out), and a dark indigo-violet (`#321fdb`) palette in `css/admin/admin.css`.
- `admin/index.html`'s dashboard renders charts via Chart.js, loaded from a CDN `<script>` tag on that page only (not shared with the rest of admin or the storefront): sparklines on each stat card and a toggleable (7D/30D/90D) orders-and-revenue trend line, plus an order-status doughnut and a recent-orders table — all computed from real Supabase data in `admin/dashboard.js`, never placeholder numbers. A Chart.js/flex-layout gotcha to remember if adding another chart: a canvas inside a `display:flex`/`grid` container with no fixed height grows unbounded (`responsive:true` sizes to the parent, the parent sizes to the canvas) — wrap it in a `position:relative` container with an explicit height first.
- `js/shared/radial-fab.js` — a small floating action button (`.radial-fab`) that fans a page's nav links out along a quarter-circle arc on click. Shared markup/behavior, themed independently per system (`css/admin/admin.css` vs. `css/storefront/shared.css`, same class names). Currently used on every `admin/*.html` page and `pages/account.html` only — not the main storefront nav.
- `js/shared/auth-config.js` — tracked, contains only the **public** Supabase URL and publishable/anon key (safe to expose in a static site); lives in `js/shared/` (not `admin/`) because both the storefront and admin need it now.
- `js/shared/auth-config.local.js` — optional, gitignored, for local overrides only.
- Full auth flow, deployment redirect-URL setup, RLS policy shapes, and the honeypot design (must be server-side, never a frontend decoy password) are documented in `docs/AUTHENTICATION.md` — read it before touching auth code.

Checkout (`js/pages/checkout.js`) requires a signed-in customer — a signed-out visitor is redirected to `pages/login.html?next=checkout.html`. This is what makes every order attributable to a real customer in the admin dashboard.

## Conventions

- Keep new files in their established folder: customer pages → `pages/`, shared JS → `js/shared/`, page-specific JS → `js/pages/`, shared CSS → `css/storefront/`, page-only CSS → the matching page stylesheet.
- Reuse existing shared helpers (price formatting, cart, nav, product-card rendering) instead of writing a second version — when changing a shared function/selector, check its effect across home, shop, product, cart, checkout, FAQ, and content pages.
- Comments should explain non-obvious *why*, not restate the next line. No decorative separator blocks, personal notes, or leftover debugging comments.
- Never put real credentials, customer data, payment proofs, or private keys (service-role keys, DB passwords, payment secrets, honeypot values) in any frontend file — only the public Supabase URL/anon key belong in `js/shared/auth-config.js`.
- Database access control belongs in Postgres (RLS policies + `is_admin()`), not in client-side `if (role === 'admin')` checks — those are a UX convenience only and must never be the actual security boundary.
- The site is deployed to GitHub Pages at the custom domain in `CNAME` (`afrigadgets.azhyre.co.za`); static hosting alone provides no auth, order storage, inventory, or payment processing beyond what's implemented here.

Each project subfolder has its own short `README.md` with folder-specific notes — check it before making non-trivial changes in that folder.
