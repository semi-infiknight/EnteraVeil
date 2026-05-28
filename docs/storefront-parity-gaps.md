# Storefront parity gaps vs. Solace demo

Captured 2026-05-28. Reference: `https://solace-medusa-starter.vercel.app/dk`. Ours: `https://tracked-clicks-properties-bloomberg.trycloudflare.com/in`. Screenshots: `C:\Labs\reference-screenshots\{solace,ours}\`.

## Homepage (`/`)

| # | Section | Solace | Ours | Action |
|---|---------|--------|------|--------|
| 1 | Hero background | Large photo (chair + side table) bleeding edge-to-edge, dark overlay, headline + CTA | Plain gradient (BRAND_BG → action-primary) | Add real photo background (Unsplash CDN), preserve "Shop now" CTA |
| 2 | Hero copy | "Redefine your space with exquisite designer furniture" | "EnteraVeil" wordmark only | Brand-appropriate streetwear headline |
| 3 | Collections strip | 3 photo tiles (Savannah / Ashton / Windsor) with overlays | None — Strapi-dependent block skipped when CMS down | Add hardcoded `<FeaturedCollections>` with 3 streetwear collection photos |
| 4 | "Shop by category" tiles | (does not exist in Solace) | 4 gradient tiles, text-only | Replace gradient with category photos (Unsplash) |
| 5 | Bestsellers carousel | Products with real images + INR/EUR prices | Products render but **price shows `—`** because INR not seeded for the IN region | Fix: hardcode placeholder INR prices in fallback OR seed INR prices |
| 6 | Brand banner ("10 years of inspiring interiors") | Full-width banner with image + headline + CTA | Missing entirely | Add `<BrandBanner>` with streetwear photo + "Born from the veil" headline + "Discover" CTA |
| 7 | "Get inspired" lookbook | 6+ Instagram-style photo tiles | Missing entirely | Add `<Lookbook>` grid with 6 Unsplash anime/streetwear shots |
| 8 | Footer | Identical structure | Identical | ✓ already matches |

## Shop / PLP (`/shop`)

| # | Item | Solace | Ours | Action |
|---|------|--------|------|--------|
| 1 | Product cards | Image + name + price | Skeleton placeholders only (4 products listed, but tiles empty in headless render — likely Suspense + price=null fallthrough) | Verify in real browser; if real bug, fix the tile to render even without price |
| 2 | Filter bar | "Collections / Product type / Price" 3 dropdowns | Just "Price" dropdown (no Collections/Product type) | Add Collections + Product type filters |
| 3 | Sort | "Sort by" dropdown — works | "Sort by" dropdown — empty (no options visible) | Populate sort options |
| 4 | Recommended products at bottom | (does not appear on Solace shop) | Present in ours | ✓ extra, OK |

## PDP (`/products/<slug>`)

| # | Item | Solace | Ours | Action |
|---|------|--------|------|--------|
| 1 | Title + price | Real values | Title yes; price **shows skeleton** | Render fallback price ("Coming soon") when calculated_price is null |
| 2 | Color/size swatches | 2 color swatches (Brown selected) | Empty skeleton blocks | Render variant options even when prices are null |
| 3 | Quantity selector | "1 ▾" stepper next to Add-to-Cart | Missing | Add quantity stepper |
| 4 | Add to cart | Full-width white button | Missing (replaced by skeleton) | Make sure button renders regardless of price |
| 5 | Accordions | Description / Dimensions / Design / Shipping & Returns | Description / Shipping & Returns only | Add Materials/Care + Size guide accordions |
| 6 | Complete the look | Related products with images + prices | Related products with images + `—` price | Same price fix as bestsellers |

## Cart (`/cart`) — empty state

| # | Item | Solace | Ours | Action |
|---|------|--------|------|--------|
| 1 | Empty state | Cart icon + "Your shopping cart is empty" + "Explore Home Page" | Identical | ✓ matches |
| 2 | "You may also like" | 2 products with full data | 3 products with images, no prices | Same price fallback fix |

## Sign in (`/account` redirects to login)

| # | Item | Solace | Ours | Action |
|---|------|--------|------|--------|
| 1 | Form structure | Email + Password + "Continue with email" + "Forgot password" + "Create account" | Identical layout — already in place | Verify form actually submits and creates session (click-test) |

## Header / nav

| # | Item | Solace | Ours | Action |
|---|------|--------|------|--------|
| 1 | Search icon (top-right) | Opens search modal that hits `/store/products` | Icon present but click does nothing | Wire to a search modal/page |
| 2 | User icon | Links to `/account` | Already links to `/account` | ✓ |
| 3 | Cart icon | Opens cart dropdown / links to `/cart` | Already wired | ✓ likely |
| 4 | Nav dropdowns (Shop/Collections/About) | Hover expands big mega menu with categories | Same structure visible in HTML | ✓ matches |

## Priority order (per user spec)

- **A. Homepage**: items 1, 2, 3, 4, 6, 7 above (hero photo, copy, collections strip, category photos, brand banner, lookbook). Plus item 5 (price fallback).
- **B. Search**: header icon → search modal querying `/store/products?q=`.
- **C. Sign in / sign up**: verify the existing `/account` login form actually authenticates against `/auth/customer/emailpass` and creates a session; verify "Create account" link goes somewhere functional.
- **D. Other dead buttons**: filter bar on `/shop`, accordions on PDP, etc. — sweep after A/B/C.
