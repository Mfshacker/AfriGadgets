# Admin

This folder contains the browser-based AfriGadgets admin dashboard used for local testing and administration. It's a set of real, separate pages (not a single page with JS-toggled tabs) — each one a dashboard section:

- `index.html` — Dashboard (stat cards). Also the entry point everything else redirects to.
- `products.html` — catalogue management, with search, category filter, and pagination.
- `orders.html`, `customers.html`, `settings.html`, `account.html` — one page each.

Each page loads the same script stack: the Supabase SDK, `../js/shared/auth-config.js`, `../js/shared/auth.js`, `guard.js`, `shared.js`, `../js/shared/radial-fab.js`, then its own page script (`dashboard.js`, `products.js`, `orders.js`, `customers.js`, `settings.js`, `account.js`). `admin/index.html` additionally loads Chart.js from a CDN, before `dashboard.js`.

- `guard.js` checks for an authenticated session **and** the admin role before the dashboard loads; anyone else is sent to `../pages/login.html`. Sets `window.adminAuthClient`, `window.adminProfile`, and `window.adminSessionReady` for every page script to use.
- `shared.js` has what every admin page needs in common: small formatting helpers (`escapeHTML`, `formatAdminPrice`, `formatOrderDate`, `getFieldValue`/`setValue`), sidebar active-link highlighting, the chrome behavior (collapsible sidebar, sticky-header scroll shadow, user dropdown menu, breadcrumb built from the active sidebar link), and `initAdminPage(onReady)` — the one function every page's own script calls on load, which waits for `guard.js`'s session check, sets up that chrome, and then runs that page's render logic.
- The dashboard stylesheet is in `../css/admin/admin.css` — a dark, indigo-violet (CoreUI-inspired) palette, not the lighter theme this file used to describe.
- `dashboard.js` renders the Dashboard's stat-card sparklines, the toggleable orders/revenue trend chart, the order-status doughnut, and the recent-orders table, all from real Supabase queries — no placeholder numbers. If adding another chart, watch for the Chart.js-in-a-flex-container sizing bug: give the canvas's wrapper a fixed height and `position: relative`, or it grows unbounded.
- `../js/shared/radial-fab.js` adds the small floating quick-nav button (bottom-right, fans the sidebar's links out on click) shared with `pages/account.html` on the storefront side; same script and class names, themed separately in this folder's stylesheet.

There is no admin-specific login page — admins sign in at the shared `../pages/login.html` like customers do, and are routed here by role after sign-in. The Supabase client configuration (`auth-config.js`) lives in `../js/shared/`, since it's used by the storefront too, not just admin.

Everything the dashboard shows — products, orders, customers, store settings — reads from and writes to Supabase, visible from any browser, not just the one that made the change. Nothing in here uses `localStorage`.

Do not add a decoy password to frontend code. Any password in JavaScript is public. A honeypot credential must be checked and logged by a server-side Edge Function, then the session must be revoked and an alert sent through a private notification channel.
