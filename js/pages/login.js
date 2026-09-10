const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

function showLoginMessage(message, type = "error") {
  loginMessage.textContent = message;
  loginMessage.className = `account-message ${type}`;
}

function getNextPage() {
  const params = new URLSearchParams(window.location.search);

  return params.get("next") || "";
}

const authClient = getAuthClient();

if (!authClient) {
  showLoginMessage("Authentication is not configured for this environment.");
  loginForm.querySelector("button").disabled = true;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!authClient) {
    return;
  }

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  showLoginMessage("Signing in...", "success");

  const { error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showLoginMessage("Sign-in failed. Check your email and password.");
    return;
  }

  const profile = await getOwnProfile(authClient);

  if (profile?.role === "admin") {
    window.location.href = "../admin/index.html";
    return;
  }

  const next = getNextPage();

  window.location.href = next || "/account";
});
