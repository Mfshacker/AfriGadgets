// ============================================================
// AFRIGADGETS - PRODUCT CATALOGUE (loaded from Supabase)
// ============================================================

let products = [];

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

  data.forEach((product) => products.push(product));

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
// PRODUCT CARD
// ============================================================

function createProductCard(product) {
  const formattedPrice = Number(product.price).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const imageHTML = product.image
    ? `
            <img
                src="${getStoreAssetUrl(`images/products/${product.image}`)}"
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
                    href="product.html?id=${product.id}"
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

      image: product.image,

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
