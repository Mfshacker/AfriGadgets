import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";


// COLLECTION NAME

const PRODUCTS_COLLECTION = "products";


// GET ALL PRODUCTS

export async function getProducts() {

    try {

        const snapshot = await getDocs(
            collection(db, PRODUCTS_COLLECTION)
        );

        const products = [];

        snapshot.forEach((document) => {

            products.push({
                id: document.id,
                ...document.data()
            });

        });

        return products;

    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

        return [];

    }
}


// GET FEATURED PRODUCTS

export async function getFeaturedProducts() {

    try {

        const productsQuery = query(
            collection(db, PRODUCTS_COLLECTION),
            where("featured", "==", true),
            limit(8)
        );

        const snapshot =
            await getDocs(productsQuery);

        const products = [];

        snapshot.forEach((document) => {

            products.push({
                id: document.id,
                ...document.data()
            });

        });

        return products;

    } catch (error) {

        console.error(
            "Error loading featured products:",
            error
        );

        return [];

    }
}


// GET PRODUCTS BY CATEGORY

export async function getProductsByCategory(
    category
) {

    try {

        const productsQuery = query(
            collection(db, PRODUCTS_COLLECTION),
            where("category", "==", category)
        );

        const snapshot =
            await getDocs(productsQuery);

        const products = [];

        snapshot.forEach((document) => {

            products.push({
                id: document.id,
                ...document.data()
            });

        });

        return products;

    } catch (error) {

        console.error(
            "Error loading category:",
            error
        );

        return [];

    }
}


// GET ONE PRODUCT

export async function getProduct(productId) {

    try {

        const productRef = doc(
            db,
            PRODUCTS_COLLECTION,
            productId
        );

        const snapshot =
            await getDoc(productRef);

        if (!snapshot.exists()) {
            return null;
        }

        return {
            id: snapshot.id,
            ...snapshot.data()
        };

    } catch (error) {

        console.error(
            "Error loading product:",
            error
        );

        return null;

    }
}
