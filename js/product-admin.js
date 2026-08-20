import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

import { db, storage } from "./firebase.js";


const productsCollection =
    collection(db, "products");


const tableBody =
    document.getElementById("productsTableBody");

const modal =
    document.getElementById("productModal");

const form =
    document.getElementById("productForm");

const modalTitle =
    document.getElementById("modalTitle");


// LOAD PRODUCTS

async function loadProducts() {

    tableBody.innerHTML = `
        <tr>
            <td colspan="7">
                <div class="empty-products">
                    Loading products...
                </div>
            </td>
        </tr>
    `;

    try {

        const snapshot =
            await getDocs(productsCollection);

        const products = [];

        snapshot.forEach(item => {

            products.push({
                id: item.id,
                ...item.data()
            });

        });


        document.getElementById(
            "totalProducts"
        ).textContent =
            `${products.length} product${products.length === 1 ? "" : "s"}`;


        if (!products.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-products">
                            No products yet.
                            Click "Add Product" to create one.
                        </div>
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML =
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
                    <tr>

                        <td>
                            <img
                                class="product-thumbnail"
                                src="${product.image || "../assets/images/placeholder.jpg"}"
                                alt="${escapeHTML(product.name || "Product")}"
                            >
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(product.name || "Unnamed product")}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(product.category || "-")}
                        </td>

                        <td>
                            R${price}
                        </td>

                        <td>
                            ${Number(product.stock || 0)}
                        </td>

                        <td>
                            ${
                                product.featured
                                ?
                                `<span class="status-badge status-featured">
                                    Featured
                                </span>`
                                :
                                `<span class="status-badge status-normal">
                                    Normal
                                </span>`
                            }
                        </td>

                        <td>

                            <button
                                class="action-button edit-button"
                                data-edit="${product.id}"
                            >
                                Edit
                            </button>

                            <button
                                class="action-button delete-button"
                                data-delete="${product.id}"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");


        attachActions(products);

    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-products">
                        Failed to load products.
                    </div>
                </td>
            </tr>
        `;

    }

}


// BUTTON ACTIONS

function attachActions(products) {

    document
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const product =
                        products.find(
                            item =>
                                item.id ===
                                button.dataset.edit
                        );

                    if (product) {
                        openEditProduct(product);
                    }

                }
            );

        });


    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteProduct(
                        button.dataset.delete
                    );

                }
            );

        });

}


// OPEN ADD PRODUCT

document
    .getElementById("openAddProduct")
    .addEventListener(
        "click",
        () => {

            form.reset();

            document.getElementById(
                "productId"
            ).value = "";

            document.getElementById(
                "productImage"
            ).value = "";

            document.getElementById(
                "uploadStatus"
            ).textContent =
                "JPG, PNG or WebP";

            modalTitle.textContent =
                "Add Product";

            modal.classList.add("active");

        }
    );


// CLOSE MODAL

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


modal.addEventListener(
    "click",
    event => {

        if (event.target === modal) {
            closeModal();
        }

    }
);


function closeModal() {

    modal.classList.remove("active");

}


// EDIT PRODUCT

function openEditProduct(product) {

    document.getElementById(
        "productId"
    ).value = product.id;

    document.getElementById(
        "productName"
    ).value = product.name || "";

    document.getElementById(
        "productPrice"
    ).value = product.price || 0;

    document.getElementById(
        "productStock"
    ).value = product.stock || 0;

    document.getElementById(
        "productCategory"
    ).value = product.category || "";

    document.getElementById(
        "productImage"
    ).value = product.image || "";

    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";

    document.getElementById(
        "productFeatured"
    ).checked =
        product.featured === true;

    document.getElementById(
        "uploadStatus"
    ).textContent =
        product.image
        ? "Existing image will be kept unless you select a new one."
        : "No image uploaded.";


    modalTitle.textContent =
        "Edit Product";

    modal.classList.add("active");

}


// UPLOAD IMAGE

async function uploadProductImage(file) {

    if (!file) {
        return null;
    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Please select a JPG, PNG or WebP image."
        );

    }


    // 5 MB LIMIT

    if (file.size > 5 * 1024 * 1024) {

        throw new Error(
            "Image must be smaller than 5 MB."
        );

    }


    const extension =
        file.name
        .split(".")
        .pop()
        .toLowerCase();


    const filename =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;


    const storageReference =
        ref(
            storage,
            `products/${filename}`
        );


    await uploadBytes(
        storageReference,
        file
    );


    return await getDownloadURL(
        storageReference
    );

}


// SAVE PRODUCT

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const saveButton =
            document.getElementById(
                "saveProduct"
            );

        const uploadStatus =
            document.getElementById(
                "uploadStatus"
            );


        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";


        try {

            const productId =
                document.getElementById(
                    "productId"
                ).value;


            const selectedFile =
                document.getElementById(
                    "productImageFile"
                ).files[0];


            let imageUrl =
                document.getElementById(
                    "productImage"
                ).value.trim();


            // UPLOAD NEW IMAGE

            if (selectedFile) {

                uploadStatus.textContent =
                    "Uploading image...";

                uploadStatus.style.color =
                    "#f59e0b";


                imageUrl =
                    await uploadProductImage(
                        selectedFile
                    );


                uploadStatus.textContent =
                    "Image uploaded successfully.";

                uploadStatus.style.color =
                    "#198754";

            }


            const productData = {

                name:
                    document.getElementById(
                        "productName"
                    ).value.trim(),

                price:
                    Number(
                        document.getElementById(
                            "productPrice"
                        ).value
                    ),

                stock:
                    Number(
                        document.getElementById(
                            "productStock"
                        ).value
                    ),

                category:
                    document.getElementById(
                        "productCategory"
                    ).value,

                image:
                    imageUrl,

                description:
                    document.getElementById(
                        "productDescription"
                    ).value.trim(),

                featured:
                    document.getElementById(
                        "productFeatured"
                    ).checked,

                updatedAt:
                    serverTimestamp()

            };


            if (productId) {

                await updateDoc(
                    doc(
                        db,
                        "products",
                        productId
                    ),
                    productData
                );

                alert(
                    "Product updated successfully."
                );

            } else {

                productData.createdAt =
                    serverTimestamp();


                await addDoc(
                    productsCollection,
                    productData
                );

                alert(
                    "Product added successfully."
                );

            }


            closeModal();

            form.reset();

            await loadProducts();


        } catch (error) {

            console.error(
                "Save error:",
                error
            );

            alert(
                error.message ||
                "Something went wrong while saving the product."
            );

        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Product";

        }

    }
);


// DELETE PRODUCT

async function deleteProduct(productId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                productId
            )
        );


        alert(
            "Product deleted."
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Could not delete the product."
        );

    }

}


// HTML ESCAPING

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


loadProducts();
