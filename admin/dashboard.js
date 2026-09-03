const SPARKLINE_DAYS = 14;

const ORDER_STATUS_COLORS = {
    "Paid": "#2eb85c",
    "Completed": "#2eb85c",
    "Processing": "#3399ff",
    "Shipped": "#3399ff",
    "Pending Payment Verification": "#f9b115",
    "Cancelled": "#e55353",
};

let salesTrendChart = null;


function buildDayLabels(days) {

    const labels = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        labels.push(day.toLocaleDateString("en-ZA", { month: "short", day: "numeric" }));
    }

    return labels;

}


function buildDailySeries(rows, days, valueFn) {

    const series = new Array(days).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    rows.forEach(row => {

        const rowDate = new Date(row.created_at);
        rowDate.setHours(0, 0, 0, 0);

        const dayIndex = days - 1 - Math.round((today - rowDate) / 86400000);

        if (dayIndex >= 0 && dayIndex < days) {
            series[dayIndex] += valueFn(row);
        }

    });

    return series;

}


function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}


function formatWeekDelta(current, previous) {

    if (previous === 0) {

        return current === 0
            ? { text: "vs last week: —", direction: "" }
            : { text: "vs last week: new", direction: "up" };

    }

    const change = ((current - previous) / previous) * 100;
    const direction = change > 0 ? "up" : change < 0 ? "down" : "";
    const arrow = change > 0 ? "▲" : change < 0 ? "▼" : "";

    return {
        text: `vs last week: ${arrow} ${Math.abs(change).toFixed(1)}%`,
        direction,
    };

}


function updateProgressBar(prefix, value, total) {

    const percent = total > 0 ? Math.round((value / total) * 100) : 0;

    const bar = document.getElementById(`${prefix}Bar`);
    const label = document.getElementById(`${prefix}Percent`);

    if (bar) bar.style.width = `${percent}%`;
    if (label) label.textContent = `${percent}%`;

}


function statusBadgeClass(status) {

    if (status === "Paid" || status === "Completed") return "status-active";
    if (status === "Processing" || status === "Shipped") return "status-info";
    if (status === "Cancelled") return "status-cancelled";

    return "status-pending";

}


function renderSparkline(canvasId, dataPoints) {

    const canvas = document.getElementById(canvasId);

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    new Chart(canvas, {
        type: "line",
        data: {
            labels: dataPoints.map((_, index) => index),
            datasets: [{
                data: dataPoints,
                borderColor: "rgba(255, 255, 255, 0.85)",
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                borderWidth: 1.5,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            scales: {
                x: { display: false },
                y: { display: false },
            },
        },
    });

}


function renderSalesTrendChart(labels, orderCounts, revenueValues) {

    const canvas = document.getElementById("salesTrendChart");

    if (!canvas || typeof Chart === "undefined") {
        return null;
    }

    return new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Orders",
                    data: orderCounts,
                    borderColor: "#3399ff",
                    backgroundColor: "rgba(51, 153, 255, 0.12)",
                    yAxisID: "yOrders",
                    tension: 0.35,
                    pointRadius: 0,
                    borderWidth: 2,
                },
                {
                    label: "Revenue (R)",
                    data: revenueValues,
                    borderColor: "#f9b115",
                    backgroundColor: "rgba(249, 177, 21, 0.12)",
                    yAxisID: "yRevenue",
                    tension: 0.35,
                    pointRadius: 0,
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { labels: { color: "#c6cbe0" } },
            },
            scales: {
                x: {
                    ticks: { color: "#868dab", maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                },
                yOrders: {
                    position: "left",
                    beginAtZero: true,
                    ticks: { color: "#868dab", precision: 0 },
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                },
                yRevenue: {
                    position: "right",
                    beginAtZero: true,
                    ticks: { color: "#868dab" },
                    grid: { display: false },
                },
            },
        },
    });

}


async function loadSalesTrend(days) {

    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const { data: orders } = await window.adminAuthClient
        .from("orders")
        .select("created_at, total, status")
        .gte("created_at", start.toISOString());

    const orderRows = orders || [];
    const paidOrderRows = orderRows.filter(order => order.status !== "Cancelled");

    const orderCountsByDay = buildDailySeries(orderRows, days, () => 1);
    const revenueByDay = buildDailySeries(paidOrderRows, days, order => Number(order.total) || 0);
    const dayLabels = buildDayLabels(days);

    const titleElement = document.getElementById("salesTrendTitle");
    if (titleElement) {
        titleElement.textContent = `Orders & Revenue — Last ${days} Days`;
    }

    if (salesTrendChart) {
        salesTrendChart.data.labels = dayLabels;
        salesTrendChart.data.datasets[0].data = orderCountsByDay;
        salesTrendChart.data.datasets[1].data = revenueByDay;
        salesTrendChart.update();
        return;
    }

    salesTrendChart = renderSalesTrendChart(dayLabels, orderCountsByDay, revenueByDay);

}


function setupPeriodToggle() {

    const container = document.getElementById("trendPeriodToggle");

    if (!container) return;

    container.querySelectorAll("button").forEach(button => {

        button.addEventListener("click", () => {

            container.querySelectorAll("button").forEach(other => {
                other.classList.remove("active");
            });

            button.classList.add("active");

            loadSalesTrend(Number(button.dataset.days));

        });

    });

}


function renderOrderStatusDonut(orders) {

    const canvas = document.getElementById("orderStatusDonut");
    const legend = document.getElementById("orderStatusLegend");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const counts = {};

    orders.forEach(order => {
        const status = order.status || "Pending Payment Verification";
        counts[status] = (counts[status] || 0) + 1;
    });

    const labels = Object.keys(counts);

    if (!labels.length) {
        return;
    }

    const values = labels.map(label => counts[label]);
    const colors = labels.map(label => ORDER_STATUS_COLORS[label] || "#868dab");

    new Chart(canvas, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: "#1b1d29",
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: { display: false },
            },
        },
    });

    if (legend) {

        legend.innerHTML = labels.map((label, index) => `
            <div class="donut-legend-item">
                <span class="donut-legend-swatch" style="background:${colors[index]}"></span>
                ${escapeHTML(label)} (${values[index]})
            </div>
        `).join("");

    }

}


function renderRecentOrdersTable(orders) {

    const table = document.getElementById("recentOrdersTable");

    if (!table) return;

    if (!orders.length) {

        table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;padding:40px;">
                    <div class="empty-state">
                        <i class="fa-solid fa-bag-shopping"></i>
                        <h3>No orders yet</h3>
                        <p>Customer orders will appear here.</p>
                    </div>
                </td>
            </tr>
        `;

        return;

    }

    table.innerHTML = orders.map(order => {

        const customer =
            `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim() ||
            "Unknown";

        return `
            <tr>
                <td>
                    <strong>${escapeHTML(order.reference || order.id)}</strong>
                    <div class="product-table-category">${formatOrderDate(order.created_at)}</div>
                </td>
                <td>${escapeHTML(customer)}</td>
                <td><strong>${formatAdminPrice(order.total)}</strong></td>
                <td><span class="status ${statusBadgeClass(order.status)}">${escapeHTML(order.status || "Pending")}</span></td>
            </tr>
        `;

    }).join("");

}


async function loadDashboardStats() {

    const productCountElement = document.getElementById("productCount");
    const orderCountElement = document.getElementById("orderCount");
    const revenueElement = document.getElementById("revenue");
    const customerCountElement = document.getElementById("customerCount");

    const sparklineStart = new Date();
    sparklineStart.setDate(sparklineStart.getDate() - (SPARKLINE_DAYS - 1));
    sparklineStart.setHours(0, 0, 0, 0);
    const sparklineStartIso = sparklineStart.toISOString();


    const [
        { count: productCount },
        { data: orders },
        { count: customerCount },
        { data: recentOrders },
        { data: recentCustomers },
        { data: recentProducts },
        { data: productStock },
        { data: recentOrdersDetail },
    ] = await Promise.all([

        window.adminAuthClient
            .from("products")
            .select("id", { count: "exact", head: true }),

        window.adminAuthClient
            .from("orders")
            .select("total, status"),

        window.adminAuthClient
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "customer"),

        window.adminAuthClient
            .from("orders")
            .select("created_at, total, status")
            .gte("created_at", sparklineStartIso),

        window.adminAuthClient
            .from("profiles")
            .select("created_at")
            .eq("role", "customer")
            .gte("created_at", sparklineStartIso),

        window.adminAuthClient
            .from("products")
            .select("created_at")
            .gte("created_at", sparklineStartIso),

        window.adminAuthClient
            .from("products")
            .select("stock, in_stock"),

        window.adminAuthClient
            .from("orders")
            .select("id, reference, customer_first_name, customer_last_name, total, status, created_at")
            .order("created_at", { ascending: false })
            .limit(6),

    ]);


    if (productCountElement) {
        productCountElement.textContent = productCount ?? 0;
    }


    const orderList = orders || [];


    if (orderCountElement) {
        orderCountElement.textContent = orderList.length;
    }


    let totalRevenue = 0;

    orderList.forEach(order => {

        if (order.status !== "Cancelled") {
            totalRevenue += Number(order.total) || 0;
        }

    });


    if (revenueElement) {
        revenueElement.textContent = formatAdminPrice(totalRevenue);
    }


    if (customerCountElement) {
        customerCountElement.textContent = customerCount ?? 0;
    }


    // Real 14-day daily trends - no placeholder data. Also doubles as the
    // this-week-vs-last-week comparison window (days 7-13 vs days 0-6).
    const orderRows = recentOrders || [];
    const paidOrderRows = orderRows.filter(order => order.status !== "Cancelled");

    const orderCountsByDay = buildDailySeries(orderRows, SPARKLINE_DAYS, () => 1);
    const revenueByDay = buildDailySeries(paidOrderRows, SPARKLINE_DAYS, order => Number(order.total) || 0);
    const customerCountsByDay = buildDailySeries(recentCustomers || [], SPARKLINE_DAYS, () => 1);
    const productCountsByDay = buildDailySeries(recentProducts || [], SPARKLINE_DAYS, () => 1);

    renderSparkline("productSparkline", productCountsByDay);
    renderSparkline("orderSparkline", orderCountsByDay);
    renderSparkline("revenueSparkline", revenueByDay);
    renderSparkline("customerSparkline", customerCountsByDay);


    const ordersThisWeek = sum(orderCountsByDay.slice(7, 14));
    const ordersLastWeek = sum(orderCountsByDay.slice(0, 7));
    const revenueThisWeek = sum(revenueByDay.slice(7, 14));
    const revenueLastWeek = sum(revenueByDay.slice(0, 7));

    const ordersThisWeekElement = document.getElementById("ordersThisWeek");
    if (ordersThisWeekElement) {
        ordersThisWeekElement.textContent = ordersThisWeek;
    }

    const revenueThisWeekElement = document.getElementById("revenueThisWeek");
    if (revenueThisWeekElement) {
        revenueThisWeekElement.textContent = formatAdminPrice(revenueThisWeek);
    }

    const ordersDeltaInfo = formatWeekDelta(ordersThisWeek, ordersLastWeek);
    const ordersDeltaElement = document.getElementById("ordersDelta");
    if (ordersDeltaElement) {
        ordersDeltaElement.textContent = ordersDeltaInfo.text;
        ordersDeltaElement.className = `week-compare-delta${ordersDeltaInfo.direction ? ` is-${ordersDeltaInfo.direction}` : ""}`;
    }

    const revenueDeltaInfo = formatWeekDelta(revenueThisWeek, revenueLastWeek);
    const revenueDeltaElement = document.getElementById("revenueDelta");
    if (revenueDeltaElement) {
        revenueDeltaElement.textContent = revenueDeltaInfo.text;
        revenueDeltaElement.className = `week-compare-delta${revenueDeltaInfo.direction ? ` is-${revenueDeltaInfo.direction}` : ""}`;
    }


    const stockRows = productStock || [];
    const totalStockRows = stockRows.length;

    const inStockCount = stockRows.filter(row => row.in_stock && Number(row.stock) > 0).length;
    const outOfStockCount = stockRows.filter(row => !row.in_stock || Number(row.stock) <= 0).length;
    const lowStockCount = stockRows.filter(row => row.in_stock && Number(row.stock) > 0 && Number(row.stock) < 10).length;

    updateProgressBar("inStock", inStockCount, totalStockRows);
    updateProgressBar("lowStock", lowStockCount, totalStockRows);
    updateProgressBar("outOfStock", outOfStockCount, totalStockRows);


    renderOrderStatusDonut(orderList);

    renderRecentOrdersTable(recentOrdersDetail || []);


    setupPeriodToggle();

    loadSalesTrend(30);

}


document.addEventListener("DOMContentLoaded", () => {

    initAdminPage(loadDashboardStats);

});
