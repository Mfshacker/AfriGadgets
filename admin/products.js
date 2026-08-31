// ========================================
// PRODUCTS
// ========================================

let cachedAdminProducts = [];

let productSearchTerm = "";
let productCategoryFilter = "";
let currentProductPage = 1;

const PRODUCTS_PER_PAGE = 20;


async function fetchAdminProducts() {

    const { data, error } =
        await window.adminAuthClient
            .from("products")
            .select("*")
            .order("id");

    if (error) {
        return [];
    }

    return data;

}


function getFilteredAdminProducts() {

    let result = cachedAdminProducts;


    if (productSearchTerm) {

        const term = productSearchTerm.toLowerCase();

        result = result.filter(
            product =>
                product.name.toLowerCase().includes(term)
        );

    }


    if (productCategoryFilter) {

        result = result.filter(
            product =>
                product.category === productCategoryFilter
        );

    }


    return result;

}


// ========================================
// RENDER PRODUCTS
// ========================================

async function renderAdminProducts() {

    const table =
        document.getElementById(
            "productsTable"
        );

    if (!table) return;


    cachedAdminProducts =
        await fetchAdminProducts();

    currentProductPage = 1;

    renderProductsTable();

}


function renderProductsPagination(totalItems) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(totalItems / PRODUCTS_PER_PAGE)
        );

    if (currentProductPage > totalPages) {
        currentProductPage = totalPages;
    }


    const indicator =
        document.getElementById(
            "productsPageIndicator"
        );

    const prevButton =
        document.getElementById(
            "productsPrevPage"
        );

    const nextButton =
        document.getElementById(
            "productsNextPage"
        );


    if (indicator) {

        indicator.textContent =
            totalItems
            ? `Page ${currentProductPage} of ${totalPages}`
            : "No results";

    }


    if (prevButton) {
        prevButton.disabled = currentProductPage <= 1;
    }


    if (nextButton) {
        nextButton.disabled = currentProductPage >= totalPages;
    }

}


function renderProductsTable() {

    const table =
        document.getElementById(
            "productsTable"
        );

    if (!table) return;


    const filtered =
        getFilteredAdminProducts();

    renderProductsPagination(filtered.length);


    table.innerHTML = "";


    if (!filtered.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:40px;"
                >

                    <div class="empty-state">

                        <i class="fa-solid fa-box-open"></i>

                        <h3>
                            ${
                                cachedAdminProducts.length
                                ? "No products match"
                                : "No products added yet"
                            }
                        </h3>

                        <p>
                            ${
                                cachedAdminProducts.length
                                ? "Try a different search or category."
                                : "Click “Add Product” to add your first product."
                            }
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    const start =
        (currentProductPage - 1) * PRODUCTS_PER_PAGE;

    const pageItems =
        filtered.slice(start, start + PRODUCTS_PER_PAGE);


    pageItems.forEach(product => {

        const row =
            document.createElement("tr");


        const stock =
            Number(product.stock ?? 0);


        const inStock =
            product.in_stock !== false &&
            stock > 0;


        row.innerHTML = `

            <td>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                    "
                >

                    <div
                        style="
                            width:50px;
                            height:50px;
                            border-radius:8px;
                            background:var(--surface-alt);
                            display:grid;
                            place-items:center;
                            overflow:hidden;
                            flex-shrink:0;
                        "
                    >

                        ${
                            product.image
                            ?
                            `
                            <img
                                src="../images/products/${escapeHTML(product.image)}"
                                alt="${escapeHTML(product.name)}"
                                style="
                                    width:100%;
                                    height:100%;
                                    object-fit:cover;
                                "
                                onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
                            >
                            `
                            :
                            ""
                        }

                        <i
                            class="fa-solid ${product.icon || "fa-box"}"
                            style="
                                ${product.image ? "display:none;" : ""}
                            "
                        ></i>

                    </div>


                    <div>

                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        ${
                            product.description
                            ?
                            `
                            <div class="product-table-category">
                                ${escapeHTML(product.description)}
                            </div>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            </td>


            <td>

                ${escapeHTML(product.category || "General")}

            </td>


            <td>

                <strong>
                    ${formatAdminPrice(product.price)}
                </strong>

            </td>


            <td>

                <span
                    style="
                        display:inline-flex;
                        align-items:center;
                        gap:6px;
                        padding:6px 10px;
                        border-radius:20px;
                        font-size:12px;
                        font-weight:600;
                        background:${inStock ? "rgba(46,184,92,0.15)" : "rgba(229,83,83,0.15)"};
                        color:${inStock ? "var(--success)" : "var(--danger)"};
                    "
                >

                    <i
                        class="fa-solid ${
                            inStock
                            ? "fa-circle-check"
                            : "fa-circle-xmark"
                        }"
                    ></i>

                    ${
                        inStock
                        ? `In Stock (${stock})`
                        : "Out of Stock"
                    }

                </span>

            </td>


            <td>

                <div
                    style="
                        display:flex;
                        gap:6px;
                    "
                >

                    <button
                        type="button"
                        class="table-action"
                        onclick="editAdminProduct('${product.id}')"
                        title="Edit product"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="table-action"
                        onclick="deleteAdminProduct('${product.id}')"
                        title="Delete product"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        `;


        table.appendChild(row);

    });

}


function handleProductSearchChange(value) {

    productSearchTerm = value;

    currentProductPage = 1;

    renderProductsTable();

}


function handleProductCategoryChange(value) {

    productCategoryFilter = value;

    currentProductPage = 1;

    renderProductsTable();

}


function changeProductPage(delta) {

    currentProductPage += delta;

    renderProductsTable();

}


// ========================================
// OPEN PRODUCT FORM
// ========================================

function openProductForm(product = null) {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (!modal) return;


    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {
        form.reset();
    }


    document.getElementById(
        "newProductName"
    ).value =
        product?.name || "";


    document.getElementById(
        "newProductCategory"
    ).value =
        product?.category || "";


    document.getElementById(
        "newProductPrice"
    ).value =
        product?.price ?? "";


    document.getElementById(
        "newProductImage"
    ).value =
        product?.image || "";


    document.getElementById(
        "newProductDescription"
    ).value =
        product?.description || "";


    // Stock field

    const stockField =
        document.getElementById(
            "newProductStock"
        );

    if (stockField) {

        stockField.value =
            product?.stock ?? 0;

    }


    // In-stock checkbox

    const stockStatus =
        document.getElementById(
            "newProductInStock"
        );

    if (stockStatus) {

        stockStatus.checked =
            product
            ? product.in_stock !== false
            : true;

    }


    // Store editing ID

    const editingId =
        document.getElementById(
            "editingProductId"
        );

    if (editingId) {

        editingId.value =
            product?.id || "";

    }


    // Change title

    const title =
        modal.querySelector(
            ".modal-header h2"
        );


    if (title) {

        title.textContent =
            product
            ? "Edit Product"
            : "Add Product";

    }


    const submitButton =
        modal.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.innerHTML =
            product
            ?
            `
                <i class="fa-solid fa-floppy-disk"></i>
                Save Changes
            `
            :
            `
                <i class="fa-solid fa-plus"></i>
                Add Product
            `;

    }


    modal.classList.add("active");

}


// ========================================
// CLOSE PRODUCT FORM
// ========================================

function closeProductForm() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (!modal) return;


    modal.classList.remove("active");


    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {
        form.reset();
    }


    const editingId =
        document.getElementById(
            "editingProductId"
        );

    if (editingId) {
        editingId.value = "";
    }


    const title =
        modal.querySelector(
            ".modal-header h2"
        );

    if (title) {
        title.textContent = "Add Product";
    }

}


// ========================================
// SAVE PRODUCT
// ========================================

async function saveProductFromForm() {

    const name =
        document.getElementById(
            "newProductName"
        ).value.trim();


    const category =
        document.getElementById(
            "newProductCategory"
        ).value;


    const price =
        Number(
            document.getElementById(
                "newProductPrice"
            ).value
        );


    const image =
        document.getElementById(
            "newProductImage"
        ).value.trim();


    const description =
        document.getElementById(
            "newProductDescription"
        ).value.trim();


    const stockField =
        document.getElementById(
            "newProductStock"
        );


    const stock =
        stockField
        ? Math.max(
            0,
            Number(stockField.value) || 0
        )
        : 0;


    const stockStatus =
        document.getElementById(
            "newProductInStock"
        );


    const inStock =
        stockStatus
        ? stockStatus.checked
        : stock > 0;


    const editingId =
        document.getElementById(
            "editingProductId"
        )?.value;


    if (!name) {

        alert("Please enter a product name.");

        return;

    }


    if (!category) {

        alert("Please select a category.");

        return;

    }


    if (
        isNaN(price) ||
        price < 0
    ) {

        alert("Please enter a valid price.");

        return;

    }


    const record = {

        name,
        category,
        price,
        image,
        description,
        stock,
        in_stock: inStock

    };


    const { error } =
        editingId
        ? await window.adminAuthClient
            .from("products")
            .update(record)
            .eq("id", editingId)
        : await window.adminAuthClient
            .from("products")
            .insert({

                id: Date.now(),

                icon: "fa-box",

                ...record

            });


    if (error) {

        alert("Could not save the product. Please try again.");

        return;

    }


    closeProductForm();


    renderAdminProducts();


    alert(
        editingId
        ? "Product updated successfully."
        : "Product added successfully."
    );

}


// ========================================
// EDIT PRODUCT
// ========================================

function editAdminProduct(id) {

    const product =
        cachedAdminProducts.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) return;


    openProductForm(product);

}


// ========================================
// DELETE PRODUCT
// ========================================

async function deleteAdminProduct(id) {

    const product =
        cachedAdminProducts.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) return;


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) return;


    const { error } =
        await window.adminAuthClient
            .from("products")
            .delete()
            .eq("id", id);


    if (error) {

        alert("Could not delete the product. Please try again.");

        return;

    }


    renderAdminProducts();

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initAdminPage(renderAdminProducts);


        const productForm =
            document.getElementById(
                "productForm"
            );


        if (productForm) {

            productForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    saveProductFromForm();

                }
            );

        }


        const modal =
            document.getElementById(
                "productModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeProductForm();

                    }

                }
            );

        }

    }
);
