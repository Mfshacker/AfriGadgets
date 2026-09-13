(function () {
  // GitHub Pages serves the friendly route through 404.html, which loads the
  // real /pages/*.html file. Once loaded, hide the implementation path.
  const match = window.location.pathname.match(/\/pages\/([^/]+)\.html$/i);
  if (!match) return;

  const page = match[1].toLowerCase();
  const cleanPages = new Set([
    "about", "account", "cart", "checkout", "contact", "delivery", "faq",
    "login", "new", "offers", "order-success", "privacy", "product",
    "returns", "reviews", "shop", "signup", "track-order"
  ]);

  if (!cleanPages.has(page)) return;

  const cleanUrl = `/${page}${window.location.search}${window.location.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);
})();
