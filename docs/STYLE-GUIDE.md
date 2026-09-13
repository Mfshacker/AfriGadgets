# AfriGadgets Style Guide

These are the styles already used by the site. Contributors can use them when adding or updating pages.

## Main storefront

The storefront uses a near-black background, light text, green actions, and amber highlights.

Colours are defined in `css/storefront/foundation.css`:

| Name             | Value     |
| ---------------- | --------- |
| Primary green    | `#0b7a53` |
| Lighter green (hover) | `#0f9c6b` |
| Amber            | `#f5b400` |
| Heading text     | `#f3f4f6` |
| Body text        | `#c7cdd6` |
| Muted text       | `#8b93a1` |
| Elevated surface | `#101218` |
| Section surface  | `#16181f` |
| Border           | `#262a33` |
| Page background  | `#0b0c10` |

`--primary-dark` (the hover/active shade for green buttons) is intentionally *lighter* than `--primary`, not darker — a hover state needs to get brighter, not darker, on a dark background.

`content.css` (loaded on every page — see CSS files below) redeclares this same token set in its own `:root` block rather than reading `foundation.css`'s. Keep the two in sync by hand if either changes; see the note in `CLAUDE.md`.

The Contact page uses its own black-and-gold colours in `css/pages/contact.css`. The admin dashboard uses its own dark indigo-violet (CoreUI-inspired) palette in `css/admin/admin.css`. Both are maintained independently of the storefront tokens above, even though all three now happen to be dark.

## Type

Use `Inter`, loaded from Google Fonts. Body text is normally `14-17px`. Navigation and controls use medium or semibold weight. Headings, prices, and the logo use bold weight. Small labels are often uppercase with modest letter spacing.

## CSS files

`css/storefront/style.css` is an import manifest. Keep it limited to imports. It `@import`s every file below unconditionally, so every page that loads `style.css` gets all of them, not just the one matching that page — don't add a page-scoped `:root` block to one of the page stylesheets, since it would win on every page, not just its own.

- `foundation.css` - reset, variables, and base element rules
- `shared.css` - shared layout and storefront components
- `overrides.css` - global rules that need to load late
- `storefront/pages/shop.css` - shop page
- `storefront/pages/product.css` - product page
- `storefront/pages/cart.css` - cart page
- `storefront/pages/checkout.css` - checkout page
- `storefront/pages/faq.css` - FAQ page
- `storefront/pages/content.css` - About and content pages
- `storefront/pages/account.css` - login, signup, and account pages
- `css/pages/contact.css` - Contact page
- `css/admin/admin.css` - admin dashboard

Shared changes belong in `foundation.css` or `shared.css`. A rule used by one page belongs in that page's stylesheet.

## Components

Use the existing green primary button, green outline button, bordered input, amber cart badge, and Font Awesome icons. Product cards include the category, name, price, image or icon fallback, and Add to Cart action.

Use the existing `.container` layout on storefront pages. Keep product grids, forms, and checkout panels usable on small screens. Existing responsive breakpoints are around `800px`, `768px`, `700px`, and `500px`.

The footer (`.footer`), where present, is a rounded, centered card (not full-bleed) with a soft radial glow and a thin highlight line at its top edge, each column fading/blurring in on scroll (`[data-footer-reveal]`). A `.radial-fab` floating action button — a central toggle that fans a few nav links out along a quarter-circle arc on click — appears on the admin dashboard and the customer account page only, not the main storefront nav; `js/shared/radial-fab.js` drives both, styled independently per system.

## Images and icons

Font Awesome 6.5.2 is the current icon library. Hero images go in `images/hero/`; catalogue images go in `images/products/`. Use meaningful alt text and keep the icon fallback when a product image is missing.

## Writing UI text

Use short, specific labels. Say what an action does: `Add to Cart`, `Continue Shopping`, or `Contact Us`. Avoid filler copy and do not use a placeholder as the only form label.

## Accessibility

Keep headings in order, label form controls, make buttons and links keyboard usable, and maintain readable contrast in each theme. Status messages should use text as well as colour or icons.

## Code comments and naming

Use descriptive names for files, functions, variables, classes, and data fields. Keep comments short and explain why a non-obvious decision exists. Do not comment every line or repeat what the code already says. Remove temporary notes, personal remarks, and unfinished debugging comments before committing.

Use the existing folder names for new files: shared code belongs in `js/shared/`, page code in `js/pages/`, shared styles in `css/storefront/`, and page-only styles in the matching page stylesheet.

## JavaScript loading

Shared scripts in `js/shared/` load before the matching script in `js/pages/`. The site uses browser localStorage and has no backend. Do not put credentials or private customer data in the frontend.
