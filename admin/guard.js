window.adminSessionReady = protectAdminPage();

async function protectAdminPage() {
  const session = await requireAdminSession("../pages/login.html");

  if (!session) {
    return;
  }

  window.adminAuthClient = session.client;
  window.adminProfile = session.profile;
  document.documentElement.classList.add("admin-authenticated");

  const logoutButton = document.getElementById("adminLogout");

  logoutButton?.addEventListener("click", async () => {
    await session.client.auth.signOut();
    window.location.replace("../pages/login.html");
  });
}
