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
                        title="View order"
                        onclick="viewAdminOrder('${order.id}')"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    ${order.pop_file_path ? `
                    <button
                        type="button"
                        class="table-action"
                        title="View proof of payment"
                        onclick="viewOrderPOP('${order.id}')"
                    >
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </button>` : ""}

                    <button
                        type="button"
                        class="table-action"
                        title="Resend confirmation email"
                        onclick="resendOrderConfirmation('${order.id}')"
                    >
                        <i class="fa-solid fa-envelope"></i>
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


async function viewOrderPOP(orderId) {
    const order = cachedAdminOrders.find(item => String(item.id) === String(orderId));
    if (!order || !order.pop_file_path) {
        alert("No proof of payment is attached to this order.");
        return;
    }

    const { data, error } = await window.adminAuthClient.storage
        .from("order-pop")
        .createSignedUrl(order.pop_file_path, 60 * 10);

    if (error || !data?.signedUrl) {
        alert("Could not open the proof of payment.");
        return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

async function resendOrderConfirmation(orderId) {
    const order = cachedAdminOrders.find(item => String(item.id) === String(orderId));
    if (!order) return;
    const { error } = await window.adminAuthClient.functions.invoke("send-order-confirmation", {
        body: { orderId: order.id },
    });
    if (error) {
        alert("Could not resend the confirmation email.");
        return;
    }
    alert(`Confirmation email sent to ${order.customer_email || "the customer"}.`);
}


function viewAdminOrder(orderId) {

    const order =
        cachedAdminOrders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );


    if (!order) return;


    const emailStatus = order.confirmation_email_sent_at
        ? `Confirmation email sent: ${formatOrderDate(order.confirmation_email_sent_at)}`
        : order.confirmation_email_error
        ? `Confirmation email error: ${order.confirmation_email_error}`
        : "Confirmation email: Not sent yet";

    alert(
        `${JSON.stringify(order, null, 2)}\n\n${emailStatus}`
    );

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    initAdminPage(renderAdminOrders);

});
