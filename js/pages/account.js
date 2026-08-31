function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAccountDate(date) {
  try {
    return new Date(date).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "-";
  }
}

function renderAccountOrders(orders) {
  const container = document.getElementById("accountOrders");

  if (!orders.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-bag-shopping"></i>
        <h3>No orders yet</h3>
        <p>Your orders will appear here once you check out.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = orders
    .map((order) => {
      const items = (order.order_items || [])
        .map(
          (item) => `
            <div class="account-order-item">
              <span>${item.quantity} × ${escapeHTML(item.name)}</span>
              <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
          `,
        )
        .join("");

      return `
        <div class="account-order">
          <div class="account-order-header">
            <div>
              <div class="account-order-reference">${escapeHTML(order.reference)}</div>
              <div class="checkout-secure">${formatAccountDate(order.created_at)}</div>
            </div>
            <span class="account-order-status">${escapeHTML(order.status)}</span>
          </div>
          ${items}
          <div class="account-order-total">
            <span>Total</span>
            <span>${formatPrice(order.total)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

async function initAccountPage() {
  const session = await requireAccountSession("login.html");

  if (!session) {
    return;
  }

  if (session.profile.role === "admin") {
    window.location.replace("../admin/index.html");
    return;
  }

  const greeting = document.getElementById("accountGreeting");

  greeting.textContent = session.profile.full_name
    ? `Welcome back, ${session.profile.full_name}`
    : "Welcome back";

  document.getElementById("profileName").value = session.profile.full_name || "";
  document.getElementById("profilePhone").value = session.profile.phone || "";
  document.getElementById("profileEmail").value = session.profile.email || "";

  const profileForm = document.getElementById("profileForm");
  const profileMessage = document.getElementById("profileMessage");

  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("profileName").value.trim();
    const phone = document.getElementById("profilePhone").value.trim();

    const { error: updateError } = await session.client
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", session.profile.id);

    profileMessage.textContent = updateError
      ? "Could not save your changes. Please try again."
      : "Saved.";

    profileMessage.className = `account-message ${updateError ? "error" : "success"}`;

    if (!updateError) {
      greeting.textContent = fullName ? `Welcome back, ${fullName}` : "Welcome back";
    }
  });

  const { data: orders, error } = await session.client
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", session.profile.id)
    .order("created_at", { ascending: false });

  renderAccountOrders(error ? [] : orders);

  document.getElementById("accountLogout").addEventListener("click", async () => {
    await session.client.auth.signOut();
    window.location.replace("login.html");
  });
}

initAccountPage();
