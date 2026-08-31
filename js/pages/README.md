# Page JavaScript

These scripts control individual storefront pages:

- `home.js` - homepage featured products
- `shop.js` - search, filters, sorting, and catalogue rendering
- `product.js` - product detail and related products
- `cart.js` - cart quantities, totals, and removal
- `checkout.js` - requires a signed-in customer, then checkout totals, payment details, and order submission to Supabase
- `login.js` - shared sign-in for customers and admins; redirects by role
- `signup.js` - customer account creation
- `account.js` - a signed-in customer's own order history

Each page loads the shared scripts before its page script. `login.js`, `signup.js`, `account.js`, and `checkout.js` also need the Supabase SDK and `js/shared/auth.js` loaded first.
