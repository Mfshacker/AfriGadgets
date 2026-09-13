# Full Product Recovery

Recovered **118 product image assets** from `AfriGadgets-main (6).zip`.

Every non-screenshot product image is represented in
`supabase/restore-all-recovered-products.sql`.

Known prices are retained where they could be recovered. All other products have
temporary prices so they immediately appear in the shop; edit them from Admin >
Products before taking real orders.

Temporary stock is 10 for each recovered item.

The ZIP is based on the working authentication-fixed project so your current
Supabase authentication configuration is retained.
