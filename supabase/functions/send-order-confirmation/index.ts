import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const money = (value: unknown) => new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
}).format(Number(value) || 0);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Authentication required.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const fromEmail = Deno.env.get("FROM_EMAIL")!;
    const fromName = Deno.env.get("FROM_NAME") || "AfriGadgets";

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid authentication session.");

    const { orderId } = await req.json();
    if (!orderId) throw new Error("Order ID is required.");

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) throw new Error("Order not found.");
    if (order.user_id !== userData.user.id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      if (profile?.role !== "admin") throw new Error("You are not allowed to send this order confirmation.");
    }

    if (!order.customer_email) throw new Error("The order has no customer email address.");

    const items = (order.order_items || []).map((item: any) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">${escapeHtml(item.name)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${Number(item.quantity) || 1}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${money(item.price)}</td>
      </tr>
    `).join("");

    const customer = order.customer || {};
    const delivery = order.delivery || {};
    const installment = customer.installment || null;
    const installmentHtml = installment ? `
      <div style="margin-top:18px;padding:14px;background:#faf7ed;border:1px solid #e5d8a8;border-radius:8px;">
        <strong>Installment plan</strong><br>
        ${escapeHtml(installment.term)} months · Deposit ${money(installment.deposit)} · Monthly ${money(installment.monthly)}
      </div>
    ` : "";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#171717;">
        <div style="padding:22px;background:#0b0b0b;color:#fff;border-radius:10px 10px 0 0;">
          <div style="font-size:12px;letter-spacing:2px;font-weight:700;">AFRIGADGETS</div>
          <h1 style="margin:8px 0 0;font-size:24px;">Order Confirmation</h1>
        </div>
        <div style="padding:24px;border:1px solid #eee;border-top:0;border-radius:0 0 10px 10px;">
          <p>Hi ${escapeHtml(customer.firstName || order.customer_first_name)},</p>
          <p>Thank you for your order. We have received your order details and proof of payment.</p>
          <div style="padding:14px;background:#f7f7f7;border-radius:8px;margin:18px 0;">
            <strong>Order reference:</strong> ${escapeHtml(order.reference)}<br>
            <strong>Status:</strong> ${escapeHtml(order.status)}
          </div>
          <h2 style="font-size:18px;">Order summary</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead><tr><th style="text-align:left;padding-bottom:8px;">Product</th><th style="padding-bottom:8px;">Qty</th><th style="text-align:right;padding-bottom:8px;">Price</th></tr></thead>
            <tbody>${items}</tbody>
          </table>
          <div style="margin-top:18px;text-align:right;line-height:1.8;">
            Subtotal: <strong>${money(order.subtotal)}</strong><br>
            Delivery: <strong>${money(order.delivery_fee)}</strong><br>
            <span style="font-size:18px;">Total: <strong>${money(order.total)}</strong></span>
          </div>
          ${installmentHtml}
          <div style="margin-top:22px;padding:14px;background:#f7f7f7;border-radius:8px;">
            <strong>Delivery address</strong><br>
            ${escapeHtml(delivery.address)}<br>
            ${escapeHtml(delivery.city)}, ${escapeHtml(delivery.province)} ${escapeHtml(delivery.postalCode)}
          </div>
          <p style="margin-top:22px;color:#666;font-size:13px;">Your payment will be verified before the order is processed. Please keep your reference ${escapeHtml(order.reference)} for your records.</p>
        </div>
      </div>
    `;

    const textItems = (order.order_items || []).map((item: any) =>
      `- ${item.name} x${Number(item.quantity) || 1}: ${money(item.price)}`
    ).join("\n");

    const text = [
      `AfriGadgets Order Confirmation`,
      `Order reference: ${order.reference}`,
      `Status: ${order.status}`,
      ``,
      `Order summary`,
      textItems,
      ``,
      `Subtotal: ${money(order.subtotal)}`,
      `Delivery: ${money(order.delivery_fee)}`,
      `Total: ${money(order.total)}`,
      ``,
      `Delivery address`,
      `${delivery.address}`,
      `${delivery.city}, ${delivery.province} ${delivery.postalCode}`,
      ``,
      `Your payment will be verified before the order is processed.`,
      `Please keep your reference ${order.reference} for your records.`,
    ].join("\n");

    const resend = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [order.customer_email],
        subject: `AfriGadgets Order Confirmation — ${order.reference}`,
        html,
      }),
    });

    const resendBody = await resend.json().catch(() => ({}));
    if (!resend.ok) throw new Error(resendBody?.message || "Email provider rejected the message.");

    await admin.from("orders").update({
      confirmation_email_sent_at: new Date().toISOString(),
      confirmation_email_error: "",
    }).eq("id", order.id);

    return new Response(JSON.stringify({ ok: true, id: resendBody?.id || null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send confirmation email.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
