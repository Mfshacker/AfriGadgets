# Contributing

## Before changing files

- Check the README in the directory being changed.
- Keep public page paths working.
- Use the existing CSS and JavaScript structure.
- Do not commit credentials, customer information, or payment documents.
- Do not commit `js/shared/auth-config.local.js`; use `js/shared/auth-config.example.js` for local overrides.
- Read `docs/AUTHENTICATION.md` before changing sign-in, signup, or the session/role guards.

## Naming files

Use lowercase, descriptive names with the existing extensions. Keep customer pages in `pages/`, shared JavaScript in `js/shared/`, page JavaScript in `js/pages/`, shared styles in `css/storefront/`, and page styles in their matching stylesheet.

## Comments

Comments should explain intent or a non-obvious reason. A good comment answers “why” or records an important dependency. Avoid comments that merely restate the next line, large decorative separator blocks, personal notes, or temporary debugging messages.

## Shared code

Put values used across pages in the shared layer. Reuse the existing price, navigation, product, and cart helpers before adding another version of the same function. When changing a shared variable or selector, check the home, shop, product, cart, checkout, FAQ, and content pages.

## Page changes

Load page-specific CSS and JavaScript only on the page that uses them. Preserve the loading order: shared scripts must load before page scripts. Keep paths correct for files inside `pages/`.

## Checks

Before submitting a change:

```powershell
./tests/validate-project.ps1
git status
```

For navigation or asset changes, check the affected page in a browser using Live Server.
