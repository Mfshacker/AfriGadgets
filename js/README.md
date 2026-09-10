# JavaScript

Client-side behavior is split into shared code and page code.

- `shared/` contains the product catalogue loader, auth helpers, and reusable store functions.
- `pages/` contains scripts for individual storefront pages.
- `../admin/` has its own set of scripts, one per admin page (`products.js`, `orders.js`, etc.) plus `shared.js` for what they have in common — see `../admin/README.md`.

Most data (accounts, products, orders, store settings) lives in Supabase; only the cart stays in `localStorage`.
