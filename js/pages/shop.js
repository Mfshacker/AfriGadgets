let currentCategory = "all";
let currentSearch = "";
let currentPrice = "all";
let currentSort = "featured";

function getFilteredProducts() {
  let result = [...products];

  // CATEGORY
  if (currentCategory !== "all") {
    result = result.filter((product) => product.category === currentCategory);
  }

  // SEARCH
  if (currentSearch) {
    const search = currentSearch.toLowerCase();
    result = result.filter(
      (product) =>
        String(product.name || "").toLowerCase().includes(search) ||
        String(product.category || "").toLowerCase().includes(search) ||
        String(product.description || "").toLowerCase().includes(search),
    );
  }

  // PRICE
  if (currentPrice === "under1000") {
    result = result.filter((product) => product.price < 1000);
  } else if (currentPrice === "1000-5000") {
    result = result.filter(
      (product) => product.price >= 1000 && product.price <= 5000,
    );
  } else if (currentPrice === "5000-10000") {
    result = result.filter(
      (product) => product.price > 5000 && product.price <= 10000,
    );
  } else if (currentPrice === "over10000") {
    result = result.filter((product) => product.price > 10000);
  }

  // SORT
  if (currentSort === "low") {
    result.sort((a, b) => a.price - b.price);
  } else if (currentSort === "high") {
    result.sort((a, b) => b.price - a.price);
  } else if (currentSort === "az") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;
}

function renderShopProducts() {
  const container = document.getElementById("shopProducts");
  const noProducts = document.getElementById("noProducts");
  const resultCount = document.getElementById("resultCount");
  const filteredProducts = getFilteredProducts();

  container.innerHTML = "";
  resultCount.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`;

  if (filteredProducts.length === 0) {
    noProducts.style.display = "block";
    return;
  }

  noProducts.style.display = "none";

  filteredProducts.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const shopImage = typeof resolveProductImage === "function" ? resolveProductImage(product) : product.image;

    card.innerHTML = `
            <div class="product-image" style="height:300px; background:#fff; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                ${
                  shopImage
                    ? `<img src="${getStoreAssetUrl(`images/products/${shopImage}`)}" alt="${escapeHtml(product.name)}" style="width:100%; height:100%; object-fit:contain; object-position:center;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><i class="fa-solid ${escapeHtml(product.icon || "fa-box")}" style="display:none; font-size:40px; color:#ccc;"></i>`
                    : `<i class="fa-solid ${escapeHtml(product.icon || "fa-box")}" style="font-size:40px; color:#ccc;"></i>`
                }
            </div>

            <div class="product-info">
                <div class="product-category">
                    ${escapeHtml(product.category)}
                </div>

                <a href="/product?id=${product.id}" class="product-name-link">
                    <div class="product-name">
                        ${escapeHtml(product.name)}
                    </div>
                </a>

                <div class="product-price">
                    ${formatPrice(product.price)}
                </div>

                <a
                    href="/product?id=${product.id}"
                    class="view-details-button"
                >
                    <i class="fa-solid fa-eye"></i>
                    View Details
                </a>

                <button
                    class="add-cart"
                    onclick="addToCart(${product.id})"
                >
                    Add to Cart
                </button>

                ${typeof installmentButtonHTML === "function" ? installmentButtonHTML(product) : ""}
            </div>
        `;

    container.appendChild(card);
  });
}

function readURLParameters() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const search = params.get("search");
  const price = params.get("price");
  const sort = params.get("sort");

  if (category) {
    currentCategory = category;
    document.querySelectorAll(".category-filter").forEach((button) => {
      button.classList.remove("active");
      if (button.dataset.category === category) {
        button.classList.add("active");
      }
    });
  }

  if (search) {
    currentSearch = search;
    const searchInput = document.getElementById("shopSearch");
    if (searchInput) {
      searchInput.value = search;
    }
  }

  if (["all", "under1000", "1000-5000", "5000-10000", "over10000"].includes(price)) {
    currentPrice = price;
    const priceInput = document.querySelector(`input[name="price"][value="${price}"]`);
    if (priceInput) priceInput.checked = true;
  }

  if (["featured", "low", "high", "az"].includes(sort)) {
    currentSort = sort;
    const sortSelect = document.getElementById("sortProducts");
    if (sortSelect) sortSelect.value = sort;
  }
}


function syncShopFiltersToUrl() {
  const url = new URL(window.location.href);
  if (currentCategory === "all") url.searchParams.delete("category");
  else url.searchParams.set("category", currentCategory);
  if (currentSearch) url.searchParams.set("search", currentSearch);
  else url.searchParams.delete("search");
  if (currentPrice === "all") url.searchParams.delete("price");
  else url.searchParams.set("price", currentPrice);
  if (currentSort === "featured") url.searchParams.delete("sort");
  else url.searchParams.set("sort", currentSort);
  window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
}

document.addEventListener("DOMContentLoaded", async () => {
  await window.productsReady;
  readURLParameters();
  renderShopProducts();

  // CATEGORY BUTTONS
  document.querySelectorAll(".category-filter").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".category-filter")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = button.dataset.category;
      syncShopFiltersToUrl();
      renderShopProducts();
    });
  });

  // PRICE FILTER
  document.querySelectorAll('input[name="price"]').forEach((input) => {
    input.addEventListener("change", () => {
      currentPrice = input.value;
      syncShopFiltersToUrl();
      renderShopProducts();
    });
  });

  // SORT
  const sort = document.getElementById("sortProducts");
  if (sort) {
    sort.addEventListener("change", () => {
      currentSort = sort.value;
      syncShopFiltersToUrl();
      renderShopProducts();
    });
  }

  // SEARCH
  const searchInput = document.getElementById("shopSearch");
  const searchButton = document.getElementById("shopSearchButton");

  function performSearch() {
    currentSearch = searchInput.value.trim();
    const url = new URL(window.location.href);
    if (currentSearch) url.searchParams.set("search", currentSearch);
    else url.searchParams.delete("search");
    window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    renderShopProducts();
  }

  if (searchButton) searchButton.addEventListener("click", performSearch);
  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        performSearch();
      }
    });
  }
});