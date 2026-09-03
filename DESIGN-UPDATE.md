# AfriGadgets design update

## Colour system
The public storefront now uses a consistent black / white / gold visual system with solid colour fills. A master theme file is loaded last on storefront pages:

- `css/storefront/theme.css`

It overrides the older green storefront palette and removes translucent colour fills from the public storefront styles.

## Contact navigation fix
`pages/contact.html` now uses the same header, Shop All category dropdown, navigation and current-category bar structure as the other storefront pages. This prevents the category dropdown from using the old standalone contact-page positioning.

## Monthly installments
Eligible products are products priced above R2,000.

- Minimum deposit: **R2,000**
- Terms: **6, 12, 18 or 24 months**
- Estimate: `(cash price - R2,000) / selected months`
- The product cards and product detail page show a Monthly Installments button.
- The modal lets the customer choose a term and sends an enquiry to the existing AfriGadgets WhatsApp number.

This is an estimate/enquiry flow, not a credit approval or financing agreement. Final financing terms, fees and approval still need to be confirmed by the business.

### Installment code locations
- `js/shared/main.js` — installment calculation, modal, term selection and WhatsApp enquiry.
- `js/shared/products.js` — installment button on reusable product cards (home/related products).
- `js/pages/shop.js` — installment button on Shop cards.
- `js/pages/product.js` — installment button on the product detail page.
- `css/storefront/theme.css` — installment UI styling.
