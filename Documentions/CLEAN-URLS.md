# AfriGadgets Clean URLs (GitHub Pages)

Customer-facing navigation now uses clean URLs such as `/reviews`, `/about`, `/shop`, `/checkout`, etc. The real HTML files remain in `pages/`.

GitHub Pages has no server-side rewrite configuration, so `404.html` maps friendly paths to the existing `pages/*.html` files, while `js/url-cleaner.js` removes the implementation path from the browser address bar after the page loads.

Examples:
- `/reviews` -> `pages/reviews.html`
- `/about` -> `pages/about.html`
- `/contact` -> `pages/contact.html`
- `/shop?category=cellphones` -> `pages/shop.html?category=cellphones`
- `/product?id=123` -> `pages/product.html?id=123`
- `/checkout?installment=1` -> `pages/checkout.html?installment=1`

For the custom domain `afrigadgets.azhyre.co.za`, these appear as `https://afrigadgets.azhyre.co.za/reviews`, etc.
