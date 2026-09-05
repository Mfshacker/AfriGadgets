function getStorePageUrl(page) {
  const cleanName = String(page || "").replace(/^.*\//, "").replace(/\.html$/i, "");
  const cleanRoutes = {
    about: "/about", account: "/account", cart: "/cart", checkout: "/checkout",
    contact: "/contact", delivery: "/delivery", faq: "/faq", login: "/login",
    new: "/new", offers: "/offers", "order-success": "/order-success", privacy: "/privacy",
    product: "/product", returns: "/returns", reviews: "/reviews", shop: "/shop",
    signup: "/signup", "track-order": "/track-order"
  };
  return cleanRoutes[cleanName] || `/${cleanName}`;
}

function getStoreAssetUrl(asset) {
  return window.location.pathname.includes("/pages/")? `../${asset}` : asset;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(price);
}

function displayFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  if (!container) return;
  container.innerHTML = "";

  products.slice(0, 8).forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    // FIX: Show real image filling box, fallback to icon
    const featuredImage = typeof resolveProductImage === "function" ? resolveProductImage(product) : product.image;
    const imageContent = featuredImage
     ? `<img src="${getStoreAssetUrl(`images/products/${featuredImage}`)}" alt="${product.name}" style="width:100%; height:100%; object-fit:contain; object-position:center;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><i class="fa-solid ${product.icon}" style="display:none; font-size:40px; color:#ccc;"></i>`
      : `<i class="fa-solid ${product.icon}" style="font-size:40px; color:#ccc;"></i>`;

    card.innerHTML = `
            <div class="product-image" style="height:280px; background:#fff; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                ${imageContent}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <button class="add-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
    container.appendChild(card);
  });
}

function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem("afrigadgets-cart") || []);
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity++;
  } else {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    // FIX: Save product with FULL image URL so cart page can show it from /pages/
    const productToSave = {
     ...product,
      image: (typeof resolveProductImage === "function" ? resolveProductImage(product) : product.image) ? getStoreAssetUrl(`images/products/${typeof resolveProductImage === "function" ? resolveProductImage(product) : product.image}`) : null,
      quantity: 1,
    };

    cart.push(productToSave);
  }

  localStorage.setItem("afrigadgets-cart", JSON.stringify(cart));
  updateCartCount();
  showToast("Product added to cart!");
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("afrigadgets-cart")) || [];
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.textContent = count;
  }
}

function searchProducts() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  const search = input.value.trim();
  if (!search) return;
  window.location.href = `${getStorePageUrl("shop.html")}?search=${encodeURIComponent(search)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  displayFeaturedProducts();
  updateCartCount();
});

/* =========================================
   CURRENT CATEGORY INDICATOR
   ========================================= */
document.addEventListener("DOMContentLoaded", function () {
  const categoryElement = document.getElementById("currentCategory");
  if (!categoryElement) return;
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const categoryNames = {
    cellphones: "Cellphones",
    gadgets: "Gadgets",
    tv: "Smart TVs",
    solar: "Solar",
    generators: "Generators",
    fridges: "Fridges",
    audio: "Audio",
    laptops: "Laptops",
    gaming: "Gaming",
    kitchen: "Kitchen Appliances",
    "electric-cars": "Electric Cars",
    tablets: "Tablets",
    wearables: "Wearables",
    networking: "Networking",
    other: "Other",
  };
  if (category && categoryNames[category]) {
    categoryElement.textContent = categoryNames[category];
    return;
  }
  if (window.location.pathname === "/product" || window.location.pathname.includes("/pages/product.html")) {
    categoryElement.textContent = "Product";
    return;
  }
  if (window.location.pathname === "/shop" || window.location.pathname.includes("/pages/shop.html")) {
    categoryElement.textContent = "All Products";
    return;
  }
  const page = window.location.pathname.split("/").pop().replace(".html", "");
  const pageNames = {
    index: "Home",
    about: "About",
    contact: "Contact",
    faq: "FAQ",
    offers: "Offers",
    new: "New",
    cart: "Shopping Cart",
    checkout: "Checkout",
  };
  if (pageNames[page]) {
    categoryElement.textContent = pageNames[page];
  }
});

/* =========================================
   SHOP ALL — CLICK / TAP ONLY DROPDOWN
========================================= */
document.addEventListener("DOMContentLoaded", function () {
  const dropdowns = document.querySelectorAll(".nav-dropdown");
  dropdowns.forEach(function (dropdown) {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    const menu = dropdown.querySelector(".dropdown-menu");
    if (!trigger ||!menu) return;
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      const shouldOpen =!dropdown.classList.contains("open");
      dropdowns.forEach(function (other) {
        other.classList.remove("open");
        const otherTrigger = other.querySelector(".dropdown-trigger");
        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
      });
      if (shouldOpen) {
        dropdown.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
    menu.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  });
  document.addEventListener("click", function () {
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove("open");
      const trigger = dropdown.querySelector(".dropdown-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key!== "Escape") return;
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove("open");
      const trigger = dropdown.querySelector(".dropdown-trigger");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
        trigger.blur();
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  const navLinks = document.querySelectorAll(".navigation .nav-link, .nav-link");
  const shopDropdown = document.querySelector(".nav-dropdown");
  navLinks.forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("/")) return;
    const linkPath = href.split("?")[0].replace(/\/$/, "") || "/";
    if (linkPath === currentPath) link.classList.add("active");
  });
  if (currentPath === "/shop" && shopDropdown) shopDropdown.classList.add("active");
});

/* =========================================
   FOOTER — copyright year + scroll reveal
   ========================================= */
document.addEventListener("DOMContentLoaded", function () {
  const yearElement = document.querySelector(".footer-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  const revealTargets = document.querySelectorAll("[data-footer-reveal]");
  if (!revealTargets.length) return;
  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  revealTargets.forEach((target) => observer.observe(target));
});

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#0f8a5a;color:white;padding:12px 24px;border-radius:8px;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;font-weight:600;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}