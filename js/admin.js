import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    db,
    auth
} from "./firebase.js";


// LOAD DASHBOARD STATISTICS

async function loadDashboard() {

    try {

        const productsSnapshot =
            await getDocs(
                collection(db, "products")
            );

        const ordersSnapshot =
            await getDocs(
                collection(db, "orders")
            );


        let pendingOrders = 0;


        ordersSnapshot.forEach(order => {

            const data = order.data();

            if (
                data.status === "pending"
            ) {
                pendingOrders++;
            }

        });


        const productCount =
            document.getElementById(
                "productCount"
            );

        const orderCount =
            document.getElementById(
                "orderCount"
            );

        const pendingCount =
            document.getElementById(
                "pendingCount"
            );


        if (productCount) {
            productCount.textContent =
                productsSnapshot.size;
        }


        if (orderCount) {
            orderCount.textContent =
                ordersSnapshot.size;
        }


        if (pendingCount) {
            pendingCount.textContent =
                pendingOrders;
        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// LOGOUT

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "../index.html";

            } catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );

            }

        }
    );

}


loadDashboard();
