# Accounts & Authentication

Customers and admins share one Supabase Auth setup and one sign-in page. A `role` column in the database — never anything in browser JavaScript — decides who can reach the admin dashboard. The storefront itself remains public.

## Files

- `js/shared/auth.js` creates the Supabase client and provides the session/role helpers every page below uses: `requireAccountSession()` (any signed-in account) and `requireAdminSession()` (signed in **and** `role = 'admin'`).
- `js/shared/auth-config.js` contains the public client configuration used by the deployed static site.
- `js/shared/auth-config.example.js` shows the configuration shape for local overrides.
- `js/shared/auth-config.local.js` is an optional ignored file for local overrides.
- `pages/login.html` is the one shared sign-in page for customers and admins.
- `pages/signup.html` creates a customer account (always `role = 'customer'`; nothing client-side can request `admin`).
- `pages/account.html` is a signed-in customer's own order history, guarded by `requireAccountSession()`.
- `admin/guard.js` checks for an active session **and** the admin role before the dashboard is shown.
- `admin/index.html` is the protected dashboard.

## Local setup

1. Create a Supabase project.
2. Enable email/password sign-in.
3. Confirm `js/shared/auth-config.js` contains the project's public URL and publishable/anon key.
4. Create `js/shared/auth-config.local.js` only if local values need to differ from the deployed values.
5. Sign up a normal customer account at `pages/signup.html` through Live Server.
6. To make an account an admin, run this once in the Supabase SQL editor (there is no self-serve way to become an admin):

   ```sql
   update public.profiles set role = 'admin' where email = 'owner@example.com';
   ```

Only the public Supabase URL and publishable/anon key belong in the browser. Never place a service-role key, database password, payment secret, honeypot value, or other private credential in any frontend configuration file.

## Data model

- `profiles` — one row per account (`id` matches `auth.users.id`), created automatically by a database trigger on signup. Holds `role` (`customer` or `admin`, defaults to `customer`), `full_name`, `phone`, `email`. An account created outside the normal signup form (for example, directly through the Supabase Admin API) can end up without a trigger-created row; `js/shared/auth.js` self-heals this on first access by creating the missing row itself, always as `role = 'customer'` — RLS only permits inserting your own `id`, and only ever with that role, so this path can never be used to self-grant admin.
- `orders` / `order_items` — created only through the `create_order()` database function (see below), readable later by that same customer or by an admin. There is no client-side insert path for these tables.
- `products` — the catalogue, publicly readable, writable only by an admin.
- `store_settings` — a single row of site-wide config (bank details, delivery fee, payment instructions), publicly readable, writable only by an admin.
- Row Level Security enforces all of this in Postgres: a customer can only ever read their own profile and orders, no matter what the browser JavaScript does. An `is_admin()` database function (checked against the caller's own `profiles.role`) is what admin-only policies key off — see the migrations for the exact policies.

**If you add a new table**, it also needs baseline `GRANT`s (`grant select on public.<table> to authenticated;`, plus `insert`/`update`/`delete` as needed) for `anon`/`authenticated`, in addition to its RLS policies. RLS only narrows access *within* a privilege a role already has — it doesn't grant the privilege itself. Supabase normally sets this up automatically for tables created through its own dashboard/CLI tooling; tables created through a raw migration (as all of the above were) don't get it for free, and a missing grant shows up as every request returning `403 Forbidden` regardless of how correct the RLS policies are.

## Order pricing

`orders` and `order_items` have no client-facing insert policy at all — the only way to create an order is `create_order(reference, customer, delivery, items, pop_file_name)`, a `security definer` database function. The client sends only `{product_id, quantity}` pairs; the function looks up real prices from `products` and the real delivery fee from `store_settings`, and computes `subtotal`/`total` itself. A browser can send any total it wants and the function will simply ignore it — this is what makes it safe to eventually charge a payment gateway based on `orders.total`, since that number was never client-supplied.

## Request flow

- A visitor opening `admin/index.html` is sent to `pages/login.html` unless there is an active session **and** that session's `profiles.role` is `admin`. A signed-in customer who navigates there is signed out and bounced — the same as an anonymous visitor.
- Checkout (`pages/checkout.js`) requires an account; a signed-out visitor is sent to `pages/login.html?next=checkout.html` and returned to checkout after signing in.
- After sign-in, `pages/login.html` reads the caller's own role and redirects: `admin` → `admin/index.html`, `customer` → `pages/account.html`.
- Sign out revokes the browser session and returns to the login page.
- Admin-managed products and store settings still use `localStorage` — accounts, orders, and order items do not.

## Decoy credentials

Do not put a decoy password in `js/pages/login.js`, `admin/guard.js`, or any other frontend file. Anyone can read browser JavaScript. A password trap would also create false confidence because it could not securely identify or notify an administrator.

If a honeypot is needed, implement it in a server-side Edge Function or API. That service can record the attempt, notify a private administrator channel, revoke the session, and return a generic sign-in failure. Keep the trap value and notification credentials on the server.

### Honeypot plan

1. Add a server-side-only decoy credential or hidden honeypot field to the authentication endpoint.
2. Compare the submitted value on the server, never in browser JavaScript.
3. Record the event with a timestamp, IP or request metadata where legally appropriate, and the attempted account identifier. Do not store the password itself.
4. Send a private alert to the administrators through an email, webhook, or monitoring service.
5. Revoke any session created by the attempt and return the same generic error used for other failed sign-ins.
6. Rate-limit repeated attempts and review the logs without exposing them in the public admin interface.
7. Test the alert and revoke path in a non-production Supabase project before enabling it in production.

## Before deployment

- Confirm email/password authentication is enabled in Supabase.
- Enable **Auth → Policies → Leaked password protection** in the Supabase dashboard (checked against HaveIBeenPwned; this is a dashboard toggle, not something a migration can set).
- Add the deployed site URL and `/pages/login.html` to Supabase redirect and URL settings.
- Add the deployed domain to the Supabase authentication allowed origins if that setting is enabled.
- Test customer signup, customer login, admin login, a customer attempting to open `admin/index.html`, session expiry, and sign out.
- Move admin-managed products, settings, and payment uploads to protected database/storage rules before treating the dashboard as production-ready — accounts and orders are already there.
