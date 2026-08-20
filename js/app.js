import {
    getFeaturedProducts
} from "./products.js";


// YEAR

const yearElement =
    document.getElementById("currentYear");

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


// CART COUNT

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem("afrigadgets-cart")
        ) || [];

    const count = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 1),
        0
    );

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = count;
    }

}

updateCartCount();


// DISPLAY PRODUCTS

function displayProducts(products) {

    const container =
        document.getElementById(
            "featuredProducts"
        );

    if (!container) return;


    if (!products.length) {

        container.innerHTML = `
            <div class="loading">
                No featured products available yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        products.map(product => {

            const price =
                Number(product.price || 0)
                    .toLocaleString(
                        "en-ZA",
                        {
                            minimumFractionDigits: 2
                        }
                    );


            return `

                <article class="product-card">

                    <a
                        href="product.html?id=${product.id}"
                        class="product-image"
                    >

                        <img
                            src="${product.image || "assets/images/placeholder.jpg"}"
                            alt="${product.name || "Product"}"
                        >

                    </a>


                    <div class="product-info">

                        <span class="product-category">
                            ${product.category || ""}
                        </span>


                        <h3>

                            <a
                                href="product.html?id=${product.id}"
                            >
                                ${product.name || "Product"}
                            </a>

                        </h3>


                        <div class="product-price">
                            R${price}
                        </div>


                        <button
                            class="add-to-cart"
                            data-id="${product.id}"
                        >
                            Add to Cart
                        </button>

                    </div>

                </article>

            `;

        }).join("");


    // ADD TO CART BUTTONS

    document
        .querySelectorAll(".add-to-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    addToCart(
                        button.dataset.id,
                        products
                    );

                }
            );

        });

}


// ADD PRODUCT TO CART

function addToCart(
    productId,
    products
) {

    const product =
        products.find(
            item => item.id === productId
        );

    if (!product) return;


    let cart =
        JSON.parse(
            localStorage.getItem(
                "afrigadgets-cart"
            )
        ) || [];


    const existing =
        cart.find(
            item => item.id === productId
        );


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: Number(product.price || 0),

            image: product.image || "",

            quantity: 1

        });

    }


    localStorage.setItem(
        "afrigadgets-cart",
        JSON.stringify(cart)
    );


    updateCartCount();


    alert(
        `${product.name} added to cart`
    );

}


// LOAD FEATURED PRODUCTS

async function loadFeaturedProducts() {

    const products =
        await getFeaturedProducts();

    displayProducts(products);

}

loadFeaturedProducts();
