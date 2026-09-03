// ============================================================
// AFRIGADGETS PRODUCT PAGE
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {
  await window.productsReady;

  loadProductPage();
});

// ============================================================
// LOAD PRODUCT
// ============================================================

function loadProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const product = getProductById(productId);
  const container = document.getElementById("productDetails");

  if (!container) {
    return;
  }

  if (!product) {
    container.innerHTML = `
      <div class="product-not-found">
        <i class="fa-solid fa-box-open"></i>
        <h2>Product not found</h2>
        <p>The product you're looking for could not be found.</p>
        <a href="/shop" class="btn btn-primary">Back to Shop</a>
      </div>
    `;
    return;
  }

  // UPDATE PAGE TITLE
  document.title = `${product.name} | AfriGadgets`;

  // UPDATE BREADCRUMB
  const breadcrumb = document.getElementById("breadcrumbProduct");

  if (breadcrumb) {
    breadcrumb.textContent = product.name;
  }

  // PRODUCT IMAGE
  const imageHTML = product.image
    ? `
      <img
        src="../images/products/${product.image}"
        alt="${product.name}"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      >
      <div class="product-placeholder" style="display:none;">
        <i class="fa-solid ${product.icon || "fa-box-open"}"></i>
      </div>
    `
    : `
      <div class="product-placeholder">
        <i class="fa-solid ${product.icon || "fa-box-open"}"></i>
      </div>
    `;

  const formattedPrice = Number(product.price).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // STOCK
  const hasStockValue =
    product.stock !== null &&
    product.stock !== undefined &&
    product.stock !== "" &&
    !Number.isNaN(Number(product.stock));

  const stockCount = hasStockValue ? Number(product.stock) : null;
  const inStock = stockCount === null || stockCount > 0;

  const stockHTML = inStock
    ? `
      <div class="product-stock">
        <i class="fa-solid fa-circle-check"></i>
        <span>
          ${stockCount === null ? "In stock" : `${stockCount} available`}
        </span>
      </div>
    `
    : `
      <div class="product-stock" style="color:#dc2626;">
        <i class="fa-solid fa-circle-xmark"></i>
        <span>Currently out of stock</span>
      </div>
    `;

  // PRODUCT DETAILS
  container.innerHTML = `
    <div class="product-detail-image">
      ${imageHTML}
    </div>

    <div class="product-detail-info">
      <span class="product-category">
        ${product.category}
      </span>

      <h1>${product.name}</h1>

      <div class="product-detail-price">
        R${formattedPrice}
      </div>

      <p class="product-detail-description">
        ${product.description}
      </p>

      ${stockHTML}

      <div class="product-quantity">
        <label for="productQuantity">Quantity</label>

        <div class="quantity-control">
          <button
            type="button"
            aria-label="Decrease quantity"
            onclick="changeProductQuantity(-1)"
          >
            −
          </button>

          <input
            type="number"
            id="productQuantity"
            value="1"
            min="1"
            ${stockCount !== null ? `max="${Math.max(1, stockCount)}"` : ""}
            aria-label="Product quantity"
          >

          <button
            type="button"
            aria-label="Increase quantity"
            onclick="changeProductQuantity(1)"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        class="btn btn-primary product-add-button"
        onclick="addCurrentProductToCart(${product.id})"
        ${inStock ? "" : "disabled"}
      >
        <i class="fa-solid fa-cart-plus"></i>
        ${inStock ? "Add to Cart" : "Out of Stock"}
      </button>

      ${isInstallmentEligible(product) ? installmentButtonHTML(product) : ""}

      <div class="product-trust">
        <div>
          <i class="fa-solid fa-truck-fast"></i>
          <span>Nationwide Delivery</span>
        </div>

        <div>
          <i class="fa-solid fa-shield-halved"></i>
          <span>Secure Shopping</span>
        </div>

        <div>
          <i class="fa-solid fa-headset"></i>
          <span>Customer Support</span>
        </div>
      </div>
    </div>
  `;

  loadRelatedProducts(product);
}

// ============================================================
// RELATED PRODUCTS
// ============================================================

function loadRelatedProducts(product) {
  const container = document.getElementById("relatedProducts");

  if (!container) {
    return;
  }

  let related = products.filter(
    (item) =>
      item.category === product.category &&
      item.id !== product.id,
  );

  related = related.slice(0, 8);

  renderProducts("relatedProducts", related);
}

// ============================================================
// QUANTITY
// ============================================================

function changeProductQuantity(change) {
  const input = document.getElementById("productQuantity");

  if (!input) {
    return;
  }

  let quantity = Number(input.value) || 1;
  quantity += change;

  const min = Number(input.min) || 1;
  const max = input.max ? Number(input.max) : Infinity;

  quantity = Math.max(min, Math.min(quantity, max));

  input.value = quantity;
}

// ============================================================
// ADD CURRENT PRODUCT
// ============================================================

function addCurrentProductToCart(productId) {
  const product = getProductById(productId);

  if (!product) {
    return;
  }

  const quantityInput = document.getElementById("productQuantity");
  const quantity = Math.max(1, Number(quantityInput?.value) || 1);

  const cart = getCart();
  const existing = cart.find(
    (item) => Number(item.id) === Number(productId),
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    });
  }

  saveCart(cart);
  updateCartCount();
  showCartMessage(`${product.name} added to cart`);
}

// ============================================================
// EXPOSE FUNCTIONS
// ============================================================

window.changeProductQuantity = changeProductQuantity;
window.addCurrentProductToCart = addCurrentProductToCart;


