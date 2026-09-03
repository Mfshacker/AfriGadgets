// ========================================
// CUSTOMERS
// ========================================

async function renderAdminCustomers() {

    const table =
        document.getElementById(
            "customersTable"
        );

    if (!table) return;


    const [{ data: customers }, { data: orders }] =
        await Promise.all([
            window.adminAuthClient
                .from("profiles")
                .select("id, full_name, email, phone")
                .eq("role", "customer")
                .order("created_at", { ascending: false }),
            window.adminAuthClient
                .from("orders")
                .select("user_id, total")
        ]);


    table.innerHTML = "";


    if (!customers || !customers.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:40px;"
                >

                    <div class="empty-state">

                        <i class="fa-solid fa-users"></i>

                        <h3>
                            No customers yet
                        </h3>

                        <p>
                            Customer accounts will appear here.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    customers.forEach(customer => {

        const customerOrders =
            (orders || []).filter(
                order => order.user_id === customer.id
            );


        const totalSpent =
            customerOrders.reduce(
                (total, order) => total + (Number(order.total) || 0),
                0
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(customer.full_name || "Unknown")}
                </strong>
            </td>

            <td>
                ${escapeHTML(customer.email || "-")}
            </td>

            <td>
                ${escapeHTML(customer.phone || "-")}
            </td>

            <td>
                ${customerOrders.length}
            </td>

            <td>
                <strong>
                    ${formatAdminPrice(totalSpent)}
                </strong>
            </td>

        `;


        table.appendChild(row);

    });

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    initAdminPage(renderAdminCustomers);

});
