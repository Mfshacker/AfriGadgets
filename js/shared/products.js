// ============================================================
// AFRIGADGETS - PRODUCT CATALOGUE (loaded from Supabase)
// ============================================================

let products = [];

// ============================================================
// PRODUCT IMAGE RESOLVER
// Keeps storefront images working even when a Supabase product
// has an empty image field. These are real product photos already
// included in the AfriGadgets project.
// ============================================================
const PRODUCT_IMAGE_POOLS = {
  cellphones: [
    "samsung-s25.jpg",
    "99.png",
    "66.png",
    "Samsung Galaxy A56.jpg",
    "003.png",
    "000.png",
    "143.png",
    "2323.png",
  ],
  gadgets: [
    "IMG-20260902-WA0052.jpg",
    "IMG-20260902-WA0054.jpg",
    "IMG-20260902-WA0080.jpg",
    "IMG-20260902-WA0021.jpg",
    "IMG-20260902-WA0030.jpg",
    "IMG-20260902-WA0039.jpg",
  ],
  tv: [
    "IMG-20260902-WA0016.jpg",
    "IMG-20260902-WA0015.jpg",
    "IMG-20260902-WA0027.jpg",
    "IMG-20260902-WA0033.jpg",
    "IMG-20260902-WA0018.jpg",
    "typ.png",
  ],
  solar: [
    "IMG-20260902-WA0044.jpg",
    "IMG-20260902-WA0031.jpg",
    "96563.png",
    "IMG-20260902-WA0053.jpg",
  ],
  generators: [
    "IMG-20260902-WA0038.jpg",
    "IMG-20260902-WA0053.jpg",
    "IMG-20260902-WA0041.jpg",
    "96563.png",
  ],
  fridges: [
    "IMG-20260902-WA0046.jpg",
    "IMG-20260902-WA0043.jpg",
    "IMG-20260902-WA0042.jpg",
    "IMG-20260902-WA0048.jpg",
  ],
  audio: [
    "IMG-20260902-WA0054.jpg",
    "IMG-20260902-WA0052.jpg",
    "IMG-20260902-WA0045.jpg",
    "IMG-20260902-WA0051.jpg",
  ],
  other: [
    "IMG-20260902-WA0076.jpg",
    "IMG-20260902-WA0077.jpg",
    "IMG-20260902-WA0028.jpg",
    "IMG-20260902-WA0029.jpg",
  ],
};

const PRODUCT_IMAGE_KEYWORDS = [
  [["s25", "galaxy s25"], "samsung-s25.jpg"],
  [["s24"], "779.png"],
  [["a56"], "Samsung Galaxy A56.jpg"],
  [["iphone 16 pro max", "16 pro max"], "000.png"],
  [["iphone 16"], "003.png"],
  [["iphone"], "143.png"],
  [["airpods", "earbuds", "earbud"], "IMG-20260902-WA0054.jpg"],
  [["watch", "galaxy watch", "smartwatch"], "IMG-20260902-WA0045.jpg"],
  [["smart tv", "television", " tv", "tv ", "inch tv"], "IMG-20260902-WA0016.jpg"],
  [["camera", "cctv", "security camera"], "IMG-20260902-WA0085.jpg"],
  [["webcam"], "IMG-20260902-WA0089.jpg"],
  [["router", "wifi"], "IMG-20260902-WA0083.jpg"],
  [["power station", "ecoflow"], "IMG-20260902-WA0044.jpg"],
  [["generator"], "IMG-20260902-WA0038.jpg"],
  [["fridge", "refrigerator"], "IMG-20260902-WA0046.jpg"],
  [["ring light"], "IMG-20260902-WA0028.jpg"],
  [["tripod", "gimbal"], "IMG-20260902-WA0029.jpg"],
  [["usb", "flash drive", "memory"], "IMG-20260902-WA0080.jpg"],
];

function resolveProductImage(product) {
  if (!product) return null;

  const current = String(product.image || "").trim();
  if (current) return current;

  const text = `${product.name || ""} ${product.description || ""}`.toLowerCase();

  for (const [keywords, filename] of PRODUCT_IMAGE_KEYWORDS) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return filename;
    }
  }

  const category = String(product.category || "other").toLowerCase();
  const pool = PRODUCT_IMAGE_POOLS[category] || PRODUCT_IMAGE_POOLS.other;
  const numericId = Number(product.id);
  const index = Number.isFinite(numericId) ? Math.abs(numericId) % pool.length : 0;
  return pool[index];
}

function getProductImageFilename(product) {
  return resolveProductImage(product);
}

async function loadProducts() {
  const client =
    typeof getAuthClient === "function" ? getAuthClient() : null;

  if (!client) {
    return products;
  }

  const { data, error } = await client
    .from("products")
    .select("*")
    .order("id");

  if (error || !data) {
    return products;
  }

  products.length = 0;

  data.forEach((product) => {
    product.image = resolveProductImage(product);
    products.push(product);
  });

  return products;
}

window.productsReady = loadProducts();

// ============================================================
// PRODUCT HELPERS
// ============================================================

function getAllProducts() {
  return products;
}

function getProductById(id) {
  return products.find((product) => product.id === Number(id));
}

function getProductsByCategory(category) {
  if (!category) {
    return products;
  }

  return products.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase(),
  );
}

function searchProducts(searchTerm) {
  const term = String(searchTerm || "")
    .trim()
    .toLowerCase();

  if (!term) {
    return products;
  }

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term),
  );
}

// ============================================================
// MONTHLY INSTALLMENTS
// ============================================================

const INSTALLMENT_DEPOSIT = 2000;
const INSTALLMENT_TERMS = [6, 12, 18, 24];

function formatZAR(value) {
  return Number(value).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isInstallmentEligible(product) {
  return Number(product?.price) >= INSTALLMENT_DEPOSIT;
}

function installmentButtonHTML(product) {
  if (!isInstallmentEligible(product)) return "";
  const lowestMonthly = (Number(product.price) - INSTALLMENT_DEPOSIT) / 24;
  return `
    <button type="button" class="installment-button" onclick="openInstallmentModal(${product.id})">
      <i class="fa-solid fa-calendar-days"></i>
      From R${formatZAR(lowestMonthly)}/month
    </button>`;
}

function openInstallmentModal(productId) {
  const product = getProductById(productId);
  if (!product || !isInstallmentEligible(product)) return;

  closeInstallmentModal();

  const modal = document.createElement("div");
  modal.className = "installment-modal is-open";
  modal.id = "installmentModal";
  modal.innerHTML = `
    <div class="installment-dialog" role="dialog" aria-modal="true" aria-labelledby="installmentTitle">
      <div class="installment-header">
        <div>
          <h2 id="installmentTitle">Monthly Installments</h2>
          <p>${product.name}</p>
        </div>
        <button type="button" class="installment-close" onclick="closeInstallmentModal()" aria-label="Close">×</button>
      </div>
      <div class="installment-body">
        <div class="installment-product">
          <div>Cash Price <strong>R${formatZAR(product.price)}</strong></div>
          <div style="margin-top:8px">Minimum Deposit <strong>R${formatZAR(INSTALLMENT_DEPOSIT)}</strong></div>
        </div>
        <p class="installment-label" style="margin:18px 0 8px">Choose your installment period</p>
        <div class="installment-terms">
          ${INSTALLMENT_TERMS.map((term, i) => `<button type="button" class="installment-term ${i === 0 ? "is-selected" : ""}" data-term="${term}" onclick="selectInstallmentTerm(${term}, ${product.price})"><strong>${term} mo</strong><span>R${formatZAR((Number(product.price)-INSTALLMENT_DEPOSIT)/term)}</span></button>`).join("")}
        </div>
        <div class="installment-payment">
          <small>Your estimated monthly payment</small>
          <strong id="installmentMonthly">R${formatZAR((Number(product.price)-INSTALLMENT_DEPOSIT)/INSTALLMENT_TERMS[0])}</strong>
          <small id="installmentDuration">× ${INSTALLMENT_TERMS[0]} months</small>
        </div>
        <p class="installment-note" style="margin-top:14px">Minimum deposit: R2,000. This is an estimate for enquiry purposes; final financing terms, fees and approval must be confirmed by AfriGadgets.</p>
        <button type="button" class="installment-cta" onclick="continueToInstallmentCheckout(${product.id})">Continue to Checkout</button>
      </div>
    </div>`;
  modal.addEventListener("click", (event) => { if (event.target === modal) closeInstallmentModal(); });
  document.body.appendChild(modal);
}

function selectInstallmentTerm(term, price) {
  document.querySelectorAll(".installment-term").forEach((button) => button.classList.toggle("is-selected", Number(button.dataset.term) === term));
  const monthly = (Number(price) - INSTALLMENT_DEPOSIT) / term;
  const amount = document.getElementById("installmentMonthly");
  const duration = document.getElementById("installmentDuration");
  if (amount) amount.textContent = `R${formatZAR(monthly)}`;
  if (duration) duration.textContent = `× ${term} months`;
}

function continueToInstallmentCheckout(productId) {
  const product = getProductById(productId);
  const selected = document.querySelector(".installment-term.is-selected");
  const term = Number(selected?.dataset.term || 6);

  if (!product || !isInstallmentEligible(product) || !INSTALLMENT_TERMS.includes(term)) {
    return;
  }

  const installment = {
    productId: Number(product.id),
    term,
    deposit: INSTALLMENT_DEPOSIT,
    monthly: (Number(product.price) - INSTALLMENT_DEPOSIT) / term,
  };

  sessionStorage.setItem("afrigadgets-installment", JSON.stringify(installment));
  window.location.href = `${getStorePageUrl("checkout.html")}?installment=1`;
}

function closeInstallmentModal() {
  document.getElementById("installmentModal")?.remove();
}

// ============================================================
// PRODUCT CARD
// ============================================================

function createProductCard(product) {
  const formattedPrice = Number(product.price).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const productImage = resolveProductImage(product);
  const imageHTML = productImage
    ? `
            <img
                src="${getStoreAssetUrl(`images/products/${productImage}`)}"
                alt="${product.name}"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <div
                class="product-placeholder"
                style="display:none;"
            >
                <i class="fa-solid ${product.icon}"></i>
            </div>
          `
    : `
            <div class="product-placeholder">
                <i class="fa-solid ${product.icon}"></i>
            </div>
          `;

  return `

        <article
            class="product-card"
            data-product-id="${product.id}"
        >

            <a
                href="${getStorePageUrl("product.html")}?id=${product.id}"
                class="product-image"
            >

                ${imageHTML}

            </a>


            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>


                <h3>
                    <a
                        href="${getStorePageUrl("product.html")}?id=${product.id}"
                    >
                        ${product.name}
                    </a>
                </h3>


                <p class="product-description">
                    ${product.description}
                </p>


                <strong class="product-price">
                    R${formattedPrice}
                </strong>


                <a
                    href="${getStorePageUrl("product.html")}?id=${product.id}"
                    class="view-details-button"
                >
                    <i class="fa-solid fa-eye"></i>
                    View Details
                </a>


                <button
                    type="button"
                    class="add-to-cart-button"
                    onclick="addProductToCart(${product.id})"
                >

                    <i class="fa-solid fa-cart-plus"></i>

                    Add to Cart

                </button>

                ${installmentButtonHTML(product)}

            </div>

        </article>

    `;
}

// ============================================================
// RENDER PRODUCTS
// ============================================================

function renderProducts(containerId, productList = products) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  if (!productList.length) {
    container.innerHTML = `

            <div class="empty-products">

                <i class="fa-solid fa-box-open"></i>

                <h3>
                    No products found
                </h3>

                <p>
                    Try another category or search.
                </p>

            </div>

        `;

    return;
  }

  container.innerHTML = productList.map(createProductCard).join("");
}

// ============================================================
// CART
// ============================================================

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("afrigadgets-cart")) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("afrigadgets-cart", JSON.stringify(cart));
}

function addProductToCart(productId) {
  const product = getProductById(productId);

  if (!product) {
    return;
  }

  const cart = getCart();

  const existing = cart.find((item) => Number(item.id) === Number(productId));

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,

      name: product.name,

      price: product.price,

      image: resolveProductImage(product),

      quantity: 1,
    });
  }

  saveCart(cart);

  updateCartCount();

  showCartMessage(`${product.name} added to cart`);
}

function updateCartCount() {
  const cart = getCart();

  const count = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  document.querySelectorAll("#cartCount").forEach((element) => {
    element.textContent = count;
  });
}

function showCartMessage(message) {
  let notification = document.getElementById("cartNotification");

  if (!notification) {
    notification = document.createElement("div");

    notification.id = "cartNotification";

    notification.className = "cart-notification";

    document.body.appendChild(notification);
  }

  notification.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        <span>
            ${message}
        </span>

    `;

  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2500);
}

// ============================================================
// MAKE FUNCTIONS AVAILABLE TO OTHER SCRIPTS
// ============================================================

window.products = products;

window.getAllProducts = getAllProducts;

window.getProductById = getProductById;

window.resolveProductImage = resolveProductImage;

window.getProductImageFilename = getProductImageFilename;

window.getProductsByCategory = getProductsByCategory;

window.searchProducts = searchProducts;

window.createProductCard = createProductCard;

window.renderProducts = renderProducts;

window.getCart = getCart;

window.saveCart = saveCart;

window.addProductToCart = addProductToCart;

window.updateCartCount = updateCartCount;

// ============================================================
// INITIALISE CART
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});
