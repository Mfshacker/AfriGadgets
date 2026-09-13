# Shared JavaScript

- `products.js` loads the product catalogue from Supabase (`window.productsReady`, a promise) and provides shared product-card rendering. Needs `auth.js` loaded first for its Supabase client.
- `main.js` contains price formatting, cart count updates, search URLs, and path helpers.
- `auth.js` creates the Supabase client and provides the session/role helpers (`requireAccountSession`, `requireAdminSession`) used by checkout, the account pages, and the admin dashboard.
- `auth-config.js` contains the public Supabase client configuration used by the deployed static site; `auth-config.example.js` shows the shape for local overrides.
- `radial-fab.js` powers `.radial-fab` — a floating action button that fans a small set of nav links out along a quarter-circle arc on click. Generic: it reads any `.radial-fab-item` elements already in the page's markup and positions them via CSS custom properties, so it needs no per-page configuration. Currently loaded on `admin/*.html` and `pages/account.html` only, not the rest of the storefront.

These files must load before page-specific scripts that call their functions. Every page loading `products.js` must load the Supabase SDK, `auth-config.js`, and `auth.js` first, in that order — see `pages/login.html` or `index.html` for the full order. Any page-specific script that reads the `products` array on load must `await window.productsReady` first (see `js/pages/home.js`, `shop.js`, `product.js`).
