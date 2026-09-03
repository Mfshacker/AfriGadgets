let checkoutSession = null;

const DEFAULT_SETTINGS = {
  bankName: "YOUR BANK NAME",
  accountHolder: "AFRIGADGETS",
  accountNumber: "0000000000",
  accountType: "Current / Cheque",
  payShap: "+27 XX XXX XXXX",
  deliveryFee: 99,
  storeName: "AfriGadgets",
  phone: "+27 XX XXX XXXX",
  email: "support@afrigadgets.co.za",
  paymentInstructions:
    "Please complete your bank transfer using the details provided and use your generated payment reference.",
};

// ========================================
// SETTINGS
// ========================================
let cachedStoreSettings = null;

async function loadStoreSettings(client) {
  const { data, error } = await client.from("store_settings").select("*").single();
  if (error ||!data) {
    cachedStoreSettings = {...DEFAULT_SETTINGS };
    return cachedStoreSettings;
  }
  cachedStoreSettings = {
    bankName: data.bank_name,
    accountHolder: data.account_holder,
    accountNumber: data.account_number,
    accountType: data.account_type,
    payShap: data.payshap,
    deliveryFee: Number(data.delivery_fee),
    storeName: data.store_name,
    phone: data.phone,
    email: data.email,
    paymentInstructions: data.payment_instructions,
  };
  return cachedStoreSettings;
}

function getStoreSettings() {
  return cachedStoreSettings || {...DEFAULT_SETTINGS };
}

// ========================================
// CART / INSTALLMENT CHECKOUT
// ========================================
function getInstallmentCheckout() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("installment") !== "1") return null;

  try {
    return JSON.parse(sessionStorage.getItem("afrigadgets-installment") || "null");
  } catch {
    return null;
  }
}

function getCheckoutCart() {
  const installment = getInstallmentCheckout();
  if (installment) {
    const product = getProductById(installment.productId);
    if (product) {
      return [{ ...product, quantity: 1 }];
    }
  }
  return JSON.parse(localStorage.getItem("afrigadgets-cart") || "[]");
}

// ========================================
// PRICE
// ========================================
function formatCheckoutPrice(price) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(Number(price) || 0);
}

// ========================================
// HELPER TO GET IMAGE URL - FIX
// ========================================
function getCheckoutImageUrl(item) {
  // Prefer the image saved in the cart, but repair old cart entries
  // that contain a filename or a path relative to /pages/.
  const filename = item?.image || (typeof resolveProductImage === "function" ? resolveProductImage(item) : null);
  if (!filename) return null;

  const value = String(filename).trim();
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  // Convert old ../images/products/foo.jpg values to the correct asset
  // path for both /checkout and /pages/checkout.html.
  const clean = value.replace(/^\.\.\//, "").replace(/^\//, "");
  if (clean.startsWith("images/products/")) {
    return typeof getStoreAssetUrl === "function"
      ? getStoreAssetUrl(clean)
      : `../${clean}`;
  }

  return typeof getStoreAssetUrl === "function"
    ? getStoreAssetUrl(`images/products/${clean}`)
    : `../images/products/${clean}`;
}

// ========================================
// RENDER CHECKOUT
// ========================================
function renderCheckout() {
  const cart = getCheckoutCart();
  const container = document.getElementById("checkoutItems");
  if (!container) return;
  if (!cart.length) {
    window.location.href = "/cart";
    return;
  }

  container.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const itemTotal = price * quantity;
    subtotal += itemTotal;

    const element = document.createElement("div");
    element.className = "checkout-item";

    const imgUrl = getCheckoutImageUrl(item);

    element.innerHTML = `
            <div class="checkout-item-image" style="width:70px; height:70px; background:#fff; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; position:relative;">
                ${
                  imgUrl
                   ? `<img src="${imgUrl}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><i class="fa-solid ${item.icon || "fa-box"}" style="display:none;"></i>`
                    : `<i class="fa-solid ${item.icon || "fa-box"}"></i>`
                }
                <span style="position:absolute; top:-6px; right:-6px; background:#000; color:#fff; font-size:11px; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${quantity}</span>
            </div>
            <div class="checkout-item-info">
                <strong>${item.name}</strong>
                <span>${formatCheckoutPrice(price)}</span>
            </div>
            <strong class="checkout-item-price">${formatCheckoutPrice(itemTotal)}</strong>
        `;
    container.appendChild(element);
  });

  const settings = getStoreSettings();
  const delivery = Number(settings.deliveryFee) || 0;
  const installment = getInstallmentCheckout();
  const installmentDeposit = installment ? Number(installment.deposit) || 2000 : 0;
  const installmentMonthly = installment ? Number(installment.monthly) || 0 : 0;
  const installmentTerm = installment ? Number(installment.term) || 0 : 0;
  // Installment checkout collects the minimum deposit plus delivery today.
  // The cash price remains visible so the customer can distinguish it from the amount due today.
  const installmentDueToday = installment ? Math.min(subtotal, installmentDeposit) + delivery : null;
  const installmentBalance = installment ? Math.max(0, subtotal - installmentDeposit) : null;
  const total = installment ? installmentDueToday : subtotal + delivery;

  const subtotalElement = document.getElementById("checkoutSubtotal");
  const deliveryElement = document.getElementById("checkoutDelivery");
  const totalElement = document.getElementById("checkoutTotal");

  if (subtotalElement) subtotalElement.textContent = formatCheckoutPrice(subtotal);
  if (deliveryElement) deliveryElement.textContent = formatCheckoutPrice(delivery);
  if (totalElement) totalElement.textContent = formatCheckoutPrice(total);
  const totalLabel = document.getElementById("checkoutTotalLabel");
  if (totalLabel) totalLabel.textContent = installment ? "Total Due Today" : "Total";
  const bankTransferLabel = document.querySelector(".transfer-amount span");
  if (bankTransferLabel) bankTransferLabel.textContent = installment ? "Deposit + Delivery Due Today" : "Total to Transfer";

  const existingInstallmentSummary = document.getElementById("installmentCheckoutAmounts");
  existingInstallmentSummary?.remove();
  if (installment) {
    const amountSummary = document.createElement("div");
    amountSummary.id = "installmentCheckoutAmounts";
    amountSummary.className = "checkout-installment-amounts";
    amountSummary.innerHTML = `
      <div><span>Cash price</span><strong>${formatCheckoutPrice(subtotal)}</strong></div>
      <div><span>Deposit due today</span><strong>${formatCheckoutPrice(installmentDeposit)}</strong></div>
      <div><span>Remaining balance</span><strong>${formatCheckoutPrice(installmentBalance)}</strong></div>
      <div><span>Monthly payment</span><strong>${formatCheckoutPrice(installmentMonthly)} × ${installmentTerm} months</strong></div>
      <small>Your bank transfer amount is the ${formatCheckoutPrice(installmentDeposit)} deposit plus the delivery fee shown above.</small>
    `;
    const summary = document.querySelector(".checkout-summary");
    const totalBlock = document.querySelector(".checkout-total");
    if (summary && totalBlock) summary.insertBefore(amountSummary, totalBlock);
  }

  const existingPlan = document.getElementById("installmentCheckoutPlan");
  existingPlan?.remove();
  if (installment) {
    const plan = document.createElement("div");
    plan.id = "installmentCheckoutPlan";
    plan.className = "checkout-installment-plan";
    plan.innerHTML = `
      <strong>Monthly Installment Plan</strong>
      <span>${installmentTerm} months · ${formatCheckoutPrice(installmentMonthly)} per month</span>
      <small>Deposit due today: ${formatCheckoutPrice(installmentDeposit)}. The remaining ${formatCheckoutPrice(installmentBalance)} is spread across the selected term. Delivery is added to the amount due today.</small>
    `;
    const summary = document.querySelector(".checkout-summary");
    const items = document.getElementById("checkoutItems");
    if (summary && items) summary.insertBefore(plan, items);
  }

  updateBankTransferTotal();
}

// ========================================
// BANK DETAILS
// ========================================
function loadBankDetails() {
  const settings = getStoreSettings();
  const fields = {
    bankName: settings.bankName,
    accountHolder: settings.accountHolder,
    accountNumber: settings.accountNumber,
    accountType: settings.accountType,
    payShap: settings.payShap,
  };
  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
  const instructions = document.querySelector(".reference-warning p");
  if (instructions) instructions.textContent = settings.paymentInstructions;
}

// ========================================
// TOTAL
// ========================================
function updateBankTransferTotal() {
  const total = document.getElementById("checkoutTotal");
  const bankTotal = document.getElementById("bankTransferTotal");
  if (total && bankTotal) bankTotal.textContent = total.textContent;
}

// ========================================
// REFERENCE
// ========================================
function generatePaymentReference() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `AFRI-${random}`;
}

function setupPaymentReference() {
  let reference = sessionStorage.getItem("afrigadgets-payment-reference");
  if (!reference) {
    reference = generatePaymentReference();
    sessionStorage.setItem("afrigadgets-payment-reference", reference);
  }
  const element = document.getElementById("paymentReference");
  if (element) element.textContent = reference;
}

// ========================================
// COPY REFERENCE
// ========================================
function copyPaymentReference() {
  const element = document.getElementById("paymentReference");
  if (!element) return;
  const reference = element.textContent;
  navigator.clipboard.writeText(reference).then(() => {
    showCheckoutMessage("Payment reference copied.", "success");
  }).catch(() => {
    const textarea = document.createElement("textarea");
    textarea.value = reference;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showCheckoutMessage("Payment reference copied.", "success");
  });
}

// ========================================
// POP UPLOAD
// ========================================
function setupPOPUpload() {
  const upload = document.getElementById("popUpload");
  const fileName = document.getElementById("popFileName");
  if (!upload) return;
  upload.addEventListener("change", () => {
    const file = upload.files[0];
    if (!file) {
      if (fileName) fileName.textContent = "No file selected";
      return;
    }
    if (fileName) fileName.textContent = file.name;
  });
}

// ========================================
// FIELD HELPER
// ========================================
function getFieldValue(id) {
  const element = document.getElementById(id);
  return element? element.value.trim() : "";
}

// ========================================
// VALIDATE CHECKOUT
// ========================================
function validateCheckout() {
  const requiredFields = ["firstName","lastName","email","phone","address","city","province","postalCode"];
  for (const id of requiredFields) {
    const field = document.getElementById(id);
    if (!field ||!field.value.trim()) {
      if (field) field.focus();
      showCheckoutMessage("Please complete all required customer information.", "error");
      return false;
    }
  }
  const terms = document.getElementById("terms");
  if (terms &&!terms.checked) {
    showCheckoutMessage("Please accept the Terms & Conditions.", "error");
    return false;
  }
  return true;
}

// ========================================
// MESSAGE
// ========================================
function showCheckoutMessage(message, type = "success") {
  const element = document.getElementById("checkoutMessage");
  if (!element) {
    alert(message);
    return;
  }
  element.textContent = message;
  element.className = `checkout-message ${type}`;
}

// ========================================
// CREATE ORDER
// ========================================
async function createOrder() {
  const cart = getCheckoutCart();
  const referenceElement = document.getElementById("paymentReference");
  const reference = referenceElement? referenceElement.textContent : generatePaymentReference();
  const popUpload = document.getElementById("popUpload");
  const popFile = popUpload && popUpload.files && popUpload.files.length? popUpload.files[0] : null;

  const { data: order, error } = await checkoutSession.client.rpc("create_order", {
    p_reference: reference,
    p_customer: {
      firstName: getFieldValue("firstName"),
      lastName: getFieldValue("lastName"),
      email: getFieldValue("email"),
      phone: getFieldValue("phone"),
      ...(getInstallmentCheckout() ? {
        installment: {
          term: Number(getInstallmentCheckout().term),
          deposit: Number(getInstallmentCheckout().deposit),
          monthly: Number(getInstallmentCheckout().monthly),
        },
      } : {}),
    },
    p_delivery: {
      address: getFieldValue("address"),
      city: getFieldValue("city"),
      province: getFieldValue("province"),
      postalCode: getFieldValue("postalCode"),
    },
    p_items: cart.map((item) => ({
      product_id: item.id,
      quantity: Number(item.quantity) || 1,
    })),
    p_pop_file_name: popFile? popFile.name : "",
  });

  if (error) return { error };
  return { order };
}

// ========================================
// PLACE ORDER
// ========================================
async function placeOrder() {
  if (!validateCheckout()) return;
  const popUpload = document.getElementById("popUpload");
  if (!popUpload ||!popUpload.files ||!popUpload.files.length) {
    showCheckoutMessage("Please upload your proof of payment.", "error");
    return;
  }
  showCheckoutMessage("Submitting your order...", "success");
  const { order, error } = await createOrder();
  if (error) {
    showCheckoutMessage("Could not submit your order. Please try again.", "error");
    return;
  }
  showCheckoutMessage(`Order ${order.reference} submitted successfully.`, "success");
  localStorage.removeItem("afrigadgets-cart");
  sessionStorage.removeItem("afrigadgets-installment");
  setTimeout(() => {
    window.location.href = `/order-success?reference=${encodeURIComponent(order.reference)}`;
  }, 1200);
}

// ========================================
// CART COUNT
// ========================================
function updateCheckoutCartCount() {
  const cart = getCheckoutCart();
  const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const element = document.getElementById("cartCount");
  if (element) element.textContent = count;
}

// ========================================
// CUSTOMER PREFILL
// ========================================
function prefillCustomerFields(profile) {
  const [firstName,...rest] = (profile.full_name || "").trim().split(" ");
  const fields = {
    firstName: firstName || "",
    lastName: rest.join(" "),
    email: profile.email || "",
    phone: profile.phone || "",
  };
  Object.entries(fields).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field &&!field.value) field.value = value;
  });
}

// ========================================
// INITIALISE
// ========================================
document.addEventListener("DOMContentLoaded", async () => {
  await window.productsReady;
  const session = await requireAccountSession(`/login?next=${encodeURIComponent("/checkout")}`);
  if (!session) return;
  checkoutSession = session;
  prefillCustomerFields(session.profile);
  await loadStoreSettings(session.client);
  loadBankDetails();
  renderCheckout();
  setupPaymentReference();
  setupPOPUpload();
  updateCheckoutCartCount();
  updateBankTransferTotal();
});