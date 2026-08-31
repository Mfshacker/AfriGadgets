function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("trackOrderForm");
  const result = document.getElementById("trackingResult");
  if (!form || !result) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const reference = document.getElementById("trackReference").value.trim();
    if (!reference) return;

    result.innerHTML = `<div class="info-note">Checking your order...</div>`;

    if (typeof requireAccountSession !== "function") {
      result.innerHTML = `<div class="info-note">Please sign in to track an order.</div>`;
      return;
    }

    const session = await requireAccountSession(`login.html?next=${encodeURIComponent("track-order.html")}`);
    if (!session) return;

    const { data, error } = await session.client
      .from("orders")
      .select("reference,status,payment_status,created_at,total")
      .eq("reference", reference)
      .maybeSingle();

    if (error || !data) {
      result.innerHTML = `<div class="info-note">We couldn't find that order in your account. Check the reference and try again.</div>`;
      return;
    }

    const date = data.created_at ? new Date(data.created_at).toLocaleDateString("en-ZA", { dateStyle: "medium" }) : "—";
    const status = data.status || "Pending";
    const payment = data.payment_status || "Pending verification";
    const total = Number(data.total);
    const totalText = Number.isFinite(total) ? formatPrice(total) : "—";

    result.innerHTML = `
      <div class="service-grid" style="margin:20px 0 0;">
        <article class="service-card"><i class="fa-solid fa-box"></i><h3>Order status</h3><p>${escapeHTML(status)}</p></article>
        <article class="service-card"><i class="fa-solid fa-receipt"></i><h3>Payment</h3><p>${escapeHTML(payment)}</p></article>
        <article class="service-card"><i class="fa-solid fa-calendar"></i><h3>Placed</h3><p>${escapeHTML(date)}</p></article>
      </div>
      <div class="info-note"><strong>Reference:</strong> ${escapeHTML(data.reference)} &nbsp; <strong>Total:</strong> ${escapeHTML(totalText)}</div>`;
  });
});
