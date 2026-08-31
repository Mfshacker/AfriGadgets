// ========================================
// ORDERS
// ========================================

let cachedAdminOrders = [];


async function fetchAdminOrders() {

    const { data, error } =
        await window.adminAuthClient
            .from("orders")
            .select("*, order_items(*)")
            .order("created_at", { ascending: false });

    if (error) {
        return [];
    }

    return data;

}


async function renderAdminOrders() {

    const table =
        document.getElementById(
            "ordersTable"
        );

    if (!table) return;


    const orders =
        await fetchAdminOrders();

    cachedAdminOrders = orders;


    table.innerHTML = "";


    if (!orders.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center;padding:40px;"
                >

                    <div class="empty-state">

                        <i class="fa-solid fa-bag-shopping"></i>

                        <h3>
                            No orders yet
                        </h3>

                        <p>
                            Customer orders will appear here.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    orders.forEach(order => {

            const row =
                document.createElement("tr");


            const customer =
                `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim() ||
                "Unknown";


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(order.reference || order.id)}
                    </strong>

                    <div class="product-table-category">
                        ${formatOrderDate(order.created_at)}
                    </div>

                </td>


                <td>

                    <strong>
                        ${escapeHTML(customer)}
                    </strong>

                </td>


                <td>

                    <strong>
                        ${formatAdminPrice(order.total)}
                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        order.payment_status ||
                        "Pending"
                    )}

                </td>


                <td>

                    <select
                        onchange="updateOrderStatus('${order.id}', this.value)"
                    >

                        ${orderStatusOption(
                            "Pending Payment Verification",
                            order.status
                        )}

                        ${orderStatusOption(
                            "Paid",
                            order.status
                        )}

                        ${orderStatusOption(
                            "Processing",
                            order.status
                        )}

                        ${orderStatusOption(
                            "Shipped",
                            order.status
                        )}

                        ${orderStatusOption(
                            "Completed",
                            order.status
                        )}

                        ${orderStatusOption(
                            "Cancelled",
                            order.status
                        )}

                    </select>

                </td>


                <td>

                    <button
                        type="button"
                        class="table-action"
                        onclick="viewAdminOrder('${order.id}')"
                    >

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            `;


            table.appendChild(row);

        });

}


function orderStatusOption(
    value,
    current
) {

    return `

        <option
            value="${value}"
            ${value === current ? "selected" : ""}
        >

            ${value}

        </option>

    `;

}


async function updateOrderStatus(
    orderId,
    newStatus
) {

    const paymentStatus =
        [
            "Paid",
            "Processing",
            "Shipped",
            "Completed"
        ].includes(newStatus)
        ? "Payment Verified"
        : newStatus === "Cancelled"
        ? "Cancelled"
        : undefined;


    const update = { status: newStatus };

    if (paymentStatus) {
        update.payment_status = paymentStatus;
    }


    await window.adminAuthClient
        .from("orders")
        .update(update)
        .eq("id", orderId);


    renderAdminOrders();

}


function viewAdminOrder(orderId) {

    const order =
        cachedAdminOrders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );


    if (!order) return;


    alert(
        JSON.stringify(
            order,
            null,
            2
        )
    );

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    initAdminPage(renderAdminOrders);

});
