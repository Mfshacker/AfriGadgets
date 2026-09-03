const DELIVERY_FEE = 99;

function getCart() {
  return JSON.parse(localStorage.getItem("afrigadgets-cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("afrigadgets-cart", JSON.stringify(cart));
}

function renderCart() {
  const cart = getCart();
  const cartContent = document.getElementById("cartContent");
  const emptyCart = document.getElementById("emptyCart");
  const cartItems = document.getElementById("cartItems");

  if (cart.length === 0) {
    cartContent.style.display = "none";
    emptyCart.style.display = "block";
    updateCartCount();
    return;
  }

  cartContent.style.display = "grid";
  emptyCart.style.display = "none";
  cartItems.innerHTML = "";

  let subtotal = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    subtotal += item.price * item.quantity;
    totalItems += item.quantity;

    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";

    // Resolve both new cart entries and older entries that stored a relative path.
    const cartImage = item.image || (typeof resolveProductImage === "function" ? resolveProductImage(item) : null);
    let cartImageUrl = null;
    if (cartImage) {
      const value = String(cartImage).trim();
      if (/^(https?:|data:|blob:)/i.test(value)) {
        cartImageUrl = value;
      } else {
        const clean = value.replace(/^\.\//, "").replace(/^\.\.\//, "").replace(/^\//, "");
        const asset = clean.startsWith("images/products/") ? clean : `images/products/${clean}`;
        cartImageUrl = typeof getStoreAssetUrl === "function" ? getStoreAssetUrl(asset) : `../${asset}`;
      }
    }

    const imageHtml = cartImageUrl
      ? `<img src="${cartImageUrl}" alt="${item.name}" style="width:100%; height:100%; object-fit:contain;" onerror="this.parentElement.innerHTML='<i class=\'fa-solid ${item.icon || 'fa-mobile-screen'} \'></i>'">`
      : `<i class="fa-solid ${item.icon || 'fa-mobile-screen'}"></i>`;

    itemElement.innerHTML = `
            <div class="cart-product-image" style="width:80px; height:80px; background:#fff; border-radius:10px; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                ${imageHtml}
            </div>

            <div class="cart-product-info">
                <span class="product-category">${item.category || 'PRODUCT'}</span>
                <a href="/product?id=${item.id}" class="cart-product-name">${item.name}</a>
                <div class="cart-price">${formatPrice(item.price)}</div>
            </div>

            <div class="cart-quantity">
                <button onclick="changeCartQuantity(${item.id}, -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="changeCartQuantity(${item.id}, 1)">+</button>
            </div>

            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>

            <button class="remove-cart-item" onclick="removeCartItem(${item.id})" title="Remove item">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
    cartItems.appendChild(itemElement);
  });

  document.getElementById("cartItemCount").textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`;
  document.getElementById("cartSubtotal").textContent = formatPrice(subtotal);
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  document.getElementById("cartDelivery").textContent = formatPrice(delivery);
  document.getElementById("cartTotal").textContent = formatPrice(subtotal + delivery);
  updateCartCount();
}

function changeCartQuantity(productId, amount) {
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) {
    const confirmed = confirm("Remove this product from your cart?");
    if (confirmed) {
      removeCartItem(productId);
      return;
    }
    item.quantity = 1;
  }
  saveCart(cart);
  renderCart();
}

function removeCartItem(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function searchFromCart() {
  const search = document.getElementById("cartSearch").value.trim();
  if (!search) return;
  window.location.href = `/shop?search=${encodeURIComponent(search)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
});