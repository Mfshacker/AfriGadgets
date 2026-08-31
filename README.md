# AfriGadgets

AfriGadgets is a static online shop for phones, gadgets, electronics, appliances, and power products in South Africa. This repository is maintained by its project contributors.

## Open the site

No build step or package installation is needed. Open `index.html` directly, or use VS Code Live Server. The workspace uses port `5501`.

```text
http://127.0.0.1:5501/index.html
```

The site uses Google Fonts and Font Awesome from CDNs, so those assets need an internet connection.

## Repository layout

```text
index.html                 Home page
pages/                     Customer-facing pages
admin/                     Local admin dashboard
css/storefront/            Shared storefront CSS and page CSS
css/pages/                 Contact page CSS
css/admin/                 Admin CSS
js/shared/                 Product data and shared functions
js/pages/                  Page-specific JavaScript
images/                    Hero and product images
docs/                      Project documentation
tests/                     Project validation checks
```

`index.html` stays at the root as the site entry point. Customer pages are kept in `pages/` so the root does not become a long list of HTML files.

## Store pages

The main pages are the shop, product details, cart, checkout, order confirmation, About, Contact, FAQ, Offers, New Products, Delivery, Returns, Privacy, and Track Order pages. Product details use URLs such as `pages/product.html?id=1`.

The catalogue lives in Supabase (the `products` table, currently around 110 rows), fetched asynchronously by `js/shared/products.js` into the same `products` global everything else already expects. The first eight are shown on the home page. Product images belong in `images/products/` and use the filenames stored in the catalogue. Missing images fall back to the product icon; add the real files before publishing the catalogue.

## How data works

Customer accounts, the product catalogue, store settings, and orders all live in Supabase (Postgres, with Row Level Security) — the same source of truth for every visitor and device. Only the shopping cart stays browser-only, in the `afrigadgets-cart` localStorage key, since it's meant to be per-visitor and disposable.

Prices are never trusted from the browser. Checkout sends only product IDs and quantities to a `create_order()` database function, which looks up real prices and the real delivery fee itself and computes the total server-side — nothing a customer's browser sends can change what an order actually costs. The default delivery fee is `R99`, editable in the admin panel's Settings tab (Delivery), which now writes to Supabase and is what real customers actually see, unlike the old browser-only settings.

Checkout requires a customer account (sign in or create one at `pages/login.html` / `pages/signup.html`) so every order is tied to a real, trackable customer. The admin dashboard is at `admin/index.html`, protected by a Supabase session **and** the caller's role — a signed-in customer account cannot reach it. The default bank and contact values are examples and must be replaced through the admin Settings tab before taking real orders.

Everyone (customer or admin) signs in at the same `pages/login.html`; after sign-in, the caller's role decides where they land. The tracked `js/shared/auth-config.js` contains the public Supabase URL and publishable key, so this works after static deployment. New accounts default to the `customer` role; promoting an account to `admin` is a manual step done directly in Supabase (see `docs/AUTHENTICATION.md`).

## GitHub Pages

`CNAME` contains the custom domain `afrigadgets.azhyre.co.za`. The site can be published as a static GitHub Pages site, but static hosting does not add order storage, inventory management, or payment processing beyond what Supabase provides here.

For sign-in to work on the deployed site, add these URLs in Supabase under `Authentication > URL Configuration`:

- Site URL: the deployed storefront URL.
- Redirect URL: the deployed login page, ending in `/pages/login.html`.

The publishable key in `js/shared/auth-config.js` is safe to expose in the browser. Database passwords, service-role keys, payment secrets, and honeypot values must stay on a server.

## Git commands

```powershell
git status
git diff
git add .
git commit -m "Describe the change"
git push origin main
```

Do not commit real bank details, customer information, payment proofs, or other private data.

More specific notes are kept in the README files inside each project folder. The visual rules are in `docs/STYLE-GUIDE.md`. Contributors should keep filenames descriptive, preserve existing relative paths, and add short comments only where the code needs context.

Admin authentication setup and security notes are in `docs/AUTHENTICATION.md`.
