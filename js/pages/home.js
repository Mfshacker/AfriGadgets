// ============================================================
// AFRIGADGETS HOME PAGE
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {
setupScrollReveal();

  await window.productsReady;

  loadFeaturedProducts();
});

// ============================================================
// SCROLL REVEAL
// ============================================================

function setupScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal]");

  if (!targets.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  targets.forEach((target) => observer.observe(target));
}

// ============================================================
// FEATURED PRODUCTS
// ============================================================

function loadFeaturedProducts() {
  const container = document.getElementById("featuredProducts");

  if (!container) {
    return;
  }

  // First 8 products are shown on homepage

  const featured = products.slice(0, 8);

  renderProducts("featuredProducts", featured);
}
