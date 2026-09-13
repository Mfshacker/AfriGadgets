const authConfig = window.AFRIGADGETS_AUTH;

let cachedAuthClient;

function getAuthClient() {
  if (cachedAuthClient !== undefined) {
    return cachedAuthClient;
  }

  if (!authConfig?.supabaseUrl || !authConfig?.supabaseAnonKey) {
    cachedAuthClient = null;
    return cachedAuthClient;
  }

  if (
    authConfig.supabaseUrl.includes("your-project") ||
    authConfig.supabaseAnonKey === "your-public-anon-key"
  ) {
    cachedAuthClient = null;
    return cachedAuthClient;
  }

  cachedAuthClient = window.supabase.createClient(
    authConfig.supabaseUrl,
    authConfig.supabaseAnonKey,
  );

  return cachedAuthClient;
}

async function getOwnProfile(client) {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await client
    .from("profiles")
    .select("id, email, full_name, phone, role")
    .eq("id", user.id)
    .single();

  if (data) {
    return data;
  }

  // No profile row yet — the signup trigger only fires for a normal INSERT
  // into auth.users, so an account created another way (e.g. the Admin API)
  // can reach here without one. Create the missing row ourselves; RLS only
  // allows inserting our own id and only ever with role "customer", so this
  // can never be used to self-grant admin access.
  const { data: created } = await client
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
    })
    .select("id, email, full_name, phone, role")
    .single();

  return created || null;
}

// Redirects to `redirectTo` if there is no signed-in customer/admin account.
// Returns the Supabase client and the caller's own profile row otherwise.
async function requireAccountSession(redirectTo) {
  const client = getAuthClient();

  if (!client) {
    window.location.replace(redirectTo);
    return null;
  }

  const profile = await getOwnProfile(client);

  if (!profile) {
    window.location.replace(redirectTo);
    return null;
  }

  return { client, profile };
}

// Same as requireAccountSession, but also requires the admin role.
// A signed-in customer is signed out and bounced, never shown the dashboard.
async function requireAdminSession(redirectTo) {
  const session = await requireAccountSession(redirectTo);

  if (!session) {
    return null;
  }

  if (session.profile.role !== "admin") {
    await session.client.auth.signOut();
    window.location.replace(redirectTo);
    return null;
  }

  return session;
}
