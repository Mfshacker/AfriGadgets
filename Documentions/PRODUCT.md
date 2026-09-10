# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyday shoppers in South Africa buying gadgets, electronics, appliances, and power equipment (solar, generators) for home or personal use — both individual purchases and households outfitting a home with backup power alongside consumer tech. Price-conscious, comfortable buying online, tolerant of a manual bank-transfer checkout with proof-of-payment upload rather than instant card payment. *(Inferred from the catalog composition, ZAR pricing, and the manual-verification checkout flow already built; not separately confirmed with the user.)*

## Product Purpose

An online storefront where customers browse a catalogue spanning cellphones, gadgets, smart TVs, solar, generators, fridges, audio, and other accessories, create an account, check out, and upload proof of a bank transfer. Success is a completed, attributable order that store staff can verify and fulfill through the admin dashboard.

## Positioning

One-stop breadth: phones, everyday gadgets, and home power equipment (solar panels, inverters, generators) under one storefront — an unusual combination competitors typically split across separate categories or separate retailers. *(User-confirmed.)*

## Operating Context

Checkout is bank-transfer only today, verified manually by an admin against an uploaded proof-of-payment file and a generated payment reference — there is no live payment gateway yet (a real payment-gateway integration was investigated this session and intentionally deferred pending server-side price validation, which is now in place). Store staff manage the catalogue, orders, customers, and site-wide settings (bank details, delivery fee, payment instructions) through a separate admin dashboard, itself gated by account role. The public storefront and the admin dashboard are visually and technically distinct areas.

## Capabilities and Constraints

- Static HTML/CSS/JS site, no build step, no package manager — every page must keep working when opened as a plain file or served via Live Server.
- Backend is Supabase (Postgres + Auth): accounts, the product catalogue, store settings, and orders are all stored there now; only the shopping cart remains browser-local (`localStorage`).
- Deployed on GitHub Pages at a custom domain; no server runtime beyond what Supabase provides.
- Catalogue is currently ~110 products across 8 categories, seeded from a prior static list; product photography is incomplete (some items fall back to an icon rather than a real photo) — undecided whether/when full photography will be available.
- Real business details (bank name, account number, contact phone/email shown at checkout) are still placeholder values pending the store owner filling them in via the admin Settings page.

## Brand Commitments

Name: **AfriGadgets** (styled as "Afri" + "Gadgets" in a two-tone wordmark). The current implemented look (white background, green `#0b7a53` primary, amber `#f5b400` accent, Inter typeface, documented in `docs/STYLE-GUIDE.md`) is the *incumbent* identity, not a locked commitment — the user has asked for a homepage redesign toward a dark, subtle, minimal aesthetic in the spirit of Apple's product pages, with smooth animation, superseding that light palette as the direction for this work. Whether the green/amber brand colors carry forward as an accent, or the palette moves to something new entirely, is a visual-world decision for new-work, not settled here.

## Evidence on Hand

- Real hero photography exists for three lifestyle scenes (phone repair, a gaming PC, an electric ride-on car) in `images/hero/`.
- Per-product photography is partial; many catalogue entries have no image file yet and render an icon placeholder instead.
- No customer testimonials, case studies, press mentions, or third-party trust badges exist — none should be fabricated.
- No payment gateway is live; "Secure Checkout" language already on the site refers to the account/RLS security work, not payment processing, and should not be strengthened into a payment-security claim it hasn't earned yet.

## Product Principles

1. Breadth over specialization — the value proposition is having phones, everyday gadgets, and home power equipment in one place, not being the cheapest or fastest in any one category.
2. Trust has to be earned through clarity, not decoration — checkout is manual and asks a real person to wait for verification; the experience should feel deliberate and credible rather than papered over with generic "secure/trusted" badging.
3. Mobile-first — South African e-commerce traffic skews heavily mobile; layouts and interactions must hold up as well on a phone as on desktop.
4. No invented authority — don't claim scale, reviews, or guarantees the business doesn't yet have.

## Accessibility & Inclusion

No project-specific accessibility requirement has been established beyond ordinary good practice (the account/checkout work already done this session uses labeled form fields and escaped dynamic content). No formal standard (e.g. WCAG level) has been confirmed as a target.
