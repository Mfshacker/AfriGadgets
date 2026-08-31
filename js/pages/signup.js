const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

function showSignupMessage(message, type = "error") {
  signupMessage.textContent = message;
  signupMessage.className = `account-message ${type}`;
}

const authClient = getAuthClient();

if (!authClient) {
  showSignupMessage("Authentication is not configured for this environment.");
  signupForm.querySelector("button").disabled = true;
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!authClient) {
    return;
  }

  const fullName = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value;

  showSignupMessage("Creating your account...", "success");

  const { data, error } = await authClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    showSignupMessage(error.message || "Could not create your account.");
    return;
  }

  if (data.session) {
    if (phone && data.user) {
      await authClient
        .from("profiles")
        .update({ phone })
        .eq("id", data.user.id);
    }

    window.location.href = "account.html";
    return;
  }

  showSignupMessage(
    "Account created. Check your email to confirm it, then sign in.",
    "success",
  );
});
