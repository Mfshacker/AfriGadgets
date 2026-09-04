# AfriGadgets Catalogue Update

This build includes:

- Installment button on the Shop page for eligible products (R2,000+), using the existing installment checkout flow.
- 70 additional catalogue products (IDs 1201–1270).
- New categories: Laptops, Gaming, Kitchen Appliances, Electric Cars, Tablets, Wearables, Networking, and Smart Home.
- New category links in the Shop All navigation, Shop sidebar, and Home category section.
- Image fallbacks for the new categories using existing product images in the project.
- `supabase/restore-all-recovered-products.sql` now upserts the original 118 recovered products plus the 70 new products (188 total).

## Important

Run `supabase/restore-all-recovered-products.sql` in the Supabase SQL Editor so the 70 new products are added to the database. The product IDs are unique and the script uses `ON CONFLICT (id) DO UPDATE`, so it is safe to re-run.

Prices for the new products are starter catalogue prices and can be changed from Admin → Products.
