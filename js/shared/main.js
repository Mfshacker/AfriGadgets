function getStorePageUrl(page) {
  return window.location.pathname.includes("/pages/")? page : `pages/${page}`;
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
    const imageContent = product.image
     ? `<img src="${getStoreAssetUrl(`images/products/${product.image}`)}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; object-position:center;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><i class="fa-solid ${product.icon}" style="display:none; font-size:40px; color:#ccc;"></i>`
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
      image: product.image? getStoreAssetUrl(`images/products/${product.image}`) : null,
      quantity: 1,
    };

    cart.push(productToSave);
  }

  localStorage.setItem("afrigadgets-cart", JSON.stringify(cart));
  updateCartCount();
  alert("Product added to cart!");
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
    other: "Other",
  };
  if (category && categoryNames[category]) {
    categoryElement.textContent = categoryNames[category];
    return;
  }
  if (window.location.pathname.includes("product.html")) {
    categoryElement.textContent = "Product";
    return;
  }
  if (window.location.pathname.includes("shop.html")) {
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
  const currentPage = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
  const navLinks = document.querySelectorAll(".navigation.nav-link");
  const shopDropdown = document.querySelector(".nav-dropdown");
  navLinks.forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href) return;
    const linkPage = href.split("?")[0].toLowerCase();
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
  if (currentPage === "shop.html" && shopDropdown) {
    shopDropdown.classList.add("active");
  }
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