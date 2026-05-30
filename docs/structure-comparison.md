# Structure comparison — xenpachi vs comicsense vs EnteraVeil

Sourced via `scripts/structure-map-v2.mjs`. Raw data in
`docs/structure-map-v2.json`. EV section list reconstructed from the
home page composition in `apps/storefront/src/app/[countryCode]/(main)/page.tsx`
plus computed-style sweep.

---

## Side-by-side home walk

### xenpachi.com home (1440×900, 14 top-level sections, all left-aligned)

| # | section | height | %vh | kind | headline | density |
| - | --- | ---: | --: | --- | --- | --- |
| 0 | marquee | 26px | 3% | dark-blue ticker | _delays due to WAR_ | low |
| 1 | marquee | 26px | 3% | royal-blue ticker | _Buy 2 get 1 free_ | low |
| 2 | "Xen-Side" banner | 204px | 23% | testimonial-ish | Xen-Side | low |
| 3 | "Show-Runners" strip | 900px | **100%** | product-grid | Show-Runners | **high** (20 imgs / 32 links) |
| 4 | "New-Arrivals" strip | 900px | 100% | product-grid | New-Arrivals | medium |
| 5 | "Xen-Kimono" strip | 900px | 100% | product-grid | Xen-Kimono | medium |
| 6 | "Xen-Hoods" strip | 900px | 100% | product-grid | Xen-Hoods | medium |
| 7 | "Xen-Shirts" strip | 1374px | 153% | product-grid | Xen-Shirts | medium |
| 8 | "No-Restock Club" | 1374px | 153% | product-grid | No-Restock Club | **high** (22/34) |
| 9 | "Head-Gear" strip | 1350px | 150% | product-grid | Head-Gear | medium |
| 10 | "Xen-Drops" mega | 11630px | **1292%** | product-grid | Xen-Drops | **very high** (58/93) |
| 11 | "Real-Reviews" | 578px | 64% | reviews | Real-Reviews | medium |
| 12 | "Been There" | 580px | 64% | image-block | Been There — Done That | low |
| 13 | "Discord-é-Exclusives" | 540px | 60% | text-block | Discord-é-Exclusives: | low |
| 14 | (cta/spacer) | 562px | 62% | unknown | — | low |

**Take:** xenpachi has NO hero. Just thin marquees → tiny banner → 8 consecutive category-named product strips, each a full viewport tall. Strip after strip. ZERO "browse by collection" or "brand story" abstraction. The footer reviews + discord exclusives are tail content. Every strip is left-aligned.

### comicsense.store home (1440×900, ~8 substantive sections, mixed center/start)

| # | section | height | %vh | kind | headline | density |
| - | --- | ---: | --: | --- | --- | --- |
| 0 | marquee | 29px | 3% | deep-purple ticker | _Shop ₹1500-1999 free keychain_ | low |
| 1 | marquee | 29px | 3% | violet ticker | _₹4000+ free DIY Katana_ | low |
| 2 | **hero swiper** | 724px | **80%** | swiper carousel | _(rotating campaign)_ | medium (15 imgs) |
| 3 | "Tees" grid | 675px | 75% | product-grid | Tees | **high** (20 imgs / 31 links) |
| 4 | **giant "TEE" label** | 360px | 40% | text-block | TEE | low (Bungee 28.8px at 48% opacity) |
| 5 | "COSPLAY jersey" grid | 675px | 75% | product-grid | COSPLAY jersey | high (20/31) |
| 6 | (sub-grid) | 575px | 64% | product-grid | _no h3_ | medium |
| 7 | "tapestry" grid | 685px | 76% | product-grid | tapestry | high (20/31) |
| 8 | (more product grids continue) | — | — | — | — | — |

**Take:** comicsense has a real HERO (swiper, 80vh), then 4 product grids by category, each separated by ONE giant decorative category label (the "TEE" 48%-opacity Bungee word). No "shop by collection" abstraction, no lookbook, no brand banner. Hero + products + decorative labels + footer.

### EnteraVeil /in home (1440×900) — current

Reconstructed from `page.tsx` source + headline grep:

| # | section | height | %vh | kind | headline | density |
| - | --- | ---: | --: | --- | --- | --- |
| 0 | top marquee | **38px** | 4% | gold-bordered ticker | _Drop 001 / EnteraVeil / beyond the veil_ | low |
| 1 | sticky nav | 81px | 9% | header | — | low |
| 2 | **HeroFallback** | ~88vh | 88% | hero (split 7/5) | "Beyond / the veil." | low |
| 3 | SectionDivider 01 — Collections | ~50px | 6% | chapter divider | _01 — Collections_ | low |
| 4 | FeaturedCollections | ~720px | 80% | featured-grid (3 tiles) | "Born from the veil." | medium |
| 5 | SectionDivider 02 — Categories | ~50px | 6% | chapter divider | _02 — Categories_ | low |
| 6 | FeaturedCategories | ~480px | 53% | featured-grid (4 tiles) | "Pick your weapon." | medium |
| 7 | SectionDivider 03 — Best of the drop | ~50px | 6% | chapter divider | _03 — Best of the drop_ | low |
| 8 | ProductCarousel | ~600px | 67% | carousel | Best of the drop | medium |
| 9 | **mid marquee** | 38px | 4% | gold-bordered ticker | _Hand-printed / Numbered / Small batch_ | low |
| 10 | SectionDivider 04 — Brand notes | ~50px | 6% | chapter divider | — | low |
| 11 | BrandBanner | ~520px | 58% | image-text | "Small batch. Loud graphics." | low |
| 12 | SectionDivider 05 — Lookbook | ~50px | 6% | chapter divider | — | low |
| 13 | Lookbook (6 looks + end-card) | ~900px | 100% | image-grid | "How the crew wears it." | medium |
| 14 | (06 — Journal) | conditional | — | blog-strip | — | — |
| 15 | footer (newsletter + nav + legal) | 845px | 94% | footer | "First word on every drop." | medium |

**Total content sections (excluding nav/marquees/footer): 8 — plus 6 SectionDivider chapter marks = 14 things on screen.**

---

## What both inspo sites do that EV does NOT

| pattern | xenpachi | comicsense | EV today |
| --- | :-: | :-: | :-: |
| Lead with **products** above the fold | strip 0 = "Show-Runners" products | hero swiper of products | abstract hero, products at section 8 |
| Multiple **product grids by category** as primary home content | 8 strips | 4 grids | ONE carousel ("Best of the drop") |
| **Thin marquee** (26-29px) | ✓ | ✓ | ✗ (38px — 35% taller) |
| **Two stacked marquees** with different content tones (warning + offer) | ✓ | ✓ | ✗ (one at top, one mid-page) |
| **Functional promo copy** in marquee (codes, thresholds) | ✓ | ✓ | ✗ (brand fluff) |
| Giant background **category label as decoration** | ✗ | ✓ ("TEE" 28.8px at 48%) | ✗ |
| **No "collections" abstraction** | ✓ — categories directly | ✓ — categories directly | ✗ (FeaturedCollections + FeaturedCategories overlap) |
| **No "brand banner"** as separate full section | ✓ | ✓ | ✗ (BrandBanner is its own section) |
| **No "lookbook" on home** | ✓ | ✓ | ✗ (6-tile Lookbook on home) |
| **No chapter dividers** ("01 — X") between sections | ✓ | ✓ | ✗ (6 dividers on home alone) |
| **Final footer with column nav + legal + social** | ✓ | ✓ | ✓ (already aligned) |

## What EV does that both inspo sites do NOT

| pattern | EV today | xenpachi | comicsense | retain? |
| --- | :-: | :-: | :-: | --- |
| Editorial display headings (`.ev-display`) on every section | ✓ | ✗ (h3 plain category) | ✗ (h3 Bungee, smaller) | **retain — brand voice** |
| Dark mode (near-black bg) | ✓ | ✗ (light grey) | ✗ (white) | **retain — brand** |
| Asymmetric hero with metadata band | ✓ | ✗ | ✗ | **retain — Pass B move** |
| Mobile bottom nav (5 cells) | ✓ | ✗ | ✗ | **trim — see anti-Claude rule #6** |
| SectionDivider chapter marks | ✓ | ✗ | ✗ | **drop — none of inspo does this** |
| Brand banner mid-page | ✓ | ✗ | ✗ | **trim — merge into footer or hero** |
| Multi-tile Lookbook on home | ✓ | ✗ | ✗ | **trim to 3 + link to /lookbook** |
| FeaturedCollections (3 collection tiles) + FeaturedCategories (4 tiles) = TWO grids of aspirational imagery | ✓ | ✗ | ✗ | **DROP FeaturedCollections — duplicates Categories** |

---

## PDP comparison (above the fold)

### xenpachi shop page
The walk surfaced **12 product cards** at 78% vh each, side-by-side image + text. Not a PDP per se — xenpachi appears to take you to an individual product page on click (didn't capture that here).

### comicsense category page (tees)
Header (100px) + product grid below (not captured fully). Standard category-page convention.

### EV PDP (/in/products/shorts) — current
- Sticky nav (81px)
- Product template (1974px = 219vh total):
  - Breadcrumb strip
  - Side-by-side: image gallery (left, on large) + product info (right, sticky on large)
  - ProductInfo: title, price, options, add-to-cart, tabs
  - "Complete the look" carousel below

**Assessment:** EV PDP layout is fine — gallery + sticky info on desktop is the convention both inspo sites use. No restructure needed here. Polish moves: variant pills (Pass Q sketched but Bungee/sharp-rect treatment not yet applied), gallery polish (Pass I already shipped).

---

## Proposed restructure for EV home

**Core thesis:** the home page has **too many kinds of sections**. Inspo sites have one hero + several product grids + footer. We have hero + collections + categories + 1 product carousel + brand banner + 6-tile lookbook + blog + footer = 8 different kinds. That's the "half-baked" feeling — each section feels like a different person's contribution.

### Sections to DROP

| section | why | replacement |
| --- | --- | --- |
| All 6 `SectionDivider` chapter marks (01-06) | Adds noise, neither inspo site does this | Just use the section's own H2 as the start — no preamble |
| `FeaturedCollections` (3 collection tiles) | Duplicates `FeaturedCategories`. Both are "browse abstract group → category page". User doesn't need both. | Cut. Keep Categories only. |
| Mid-page `Marquee` | Visual repetition; inspo only marquees at top | Cut (top marquee carries the brand chant) |
| Conditional blog strip ("06 — Journal") | Only renders when Strapi is up; usually off | Cut from home; keep on /blog directly |

### Sections to KEEP but TRIM/RESTRUCTURE

| section | move |
| --- | --- |
| Top marquee | Trim height 38px → ~28px (match inspo). Rewrite copy to functional offers (free-ship threshold, COD, return policy) per inspo synthesis Move #3 |
| Hero | Already split-asymmetric (Pass B). Hold. Anti-Claude pass: ensure CTAs are sharp-rect not pill |
| `FeaturedCategories` (4 tiles) | Keep — this is the closest equivalent to xenpachi's category strips. Polish: drop the "Pick your weapon." display headline, use H3 category name only (xenpachi pattern: each tile IS the category) |
| `ProductCarousel` "Best of the drop" | KEEP and PROMOTE to position 4 (right under hero — lead with products like both inspo sites). Anti-Claude pass: cards left-aligned, sharp arrows |
| `BrandBanner` (Small batch / Loud graphics) | Trim from full 520px section to a 280-320px slim band. Or merge as a quote block above the footer |
| `Lookbook` (6 looks + end-card) | Trim 6 tiles → 3 horizontal-scrollable looks + "Open the issue →" arrow link. Lookbook PAGE keeps the full grid |

### Sections to ADD

| section | inspired by | implementation |
| --- | --- | --- |
| **Second category strip** (e.g. "Sweats", "Hoodies") after the first product carousel | xenpachi (multiple category strips one after another) | Use existing `ProductCarousel` component with `category_id` filter. Adds depth without inventing a new component |
| **Decorative giant category label** above one of the grids | comicsense ("TEE" 28.8px Bungee 48% opacity) | Single use: above the Categories grid. Bungee font (from inspo synthesis Move #1) — depends on Phase 2 tokens shipping first |
| **Status strip** (3 small cells: shipping / payment / returns) above footer | xenpachi-style trust strip | Mono labels + display values: "ships from Bangalore · COD across India · 7-day returns" |

### Proposed final order

```
─── above main ───
0.  Top marquee (28px, functional copy)
0.5 Nav (sticky)

─── main ───
1.  HERO (left-asym, oversized type, edge-bleed image, sharp-rect CTAs)
2.  PRODUCT CAROUSEL "Best of the drop" (lead with products)
3.  CATEGORIES grid (4 tiles, no display headline above)
4.  Decorative giant category label "EnteraVeil" or "DROP 001" (CSS-only)
5.  Second PRODUCT CAROUSEL (different category — "Sweats" or "Best sellers")
6.  LOOKBOOK STRIP (3 looks horizontal-scroll + "Open the issue →" link)
7.  BRAND quote band (slim 200-280px, "Small batch. Loud graphics." inline)
8.  STATUS strip (ships / pays / returns / contact in 3-4 cells)

─── below main ───
9.  Footer (newsletter + nav + legal — already aligned with inspo)
```

**Net effect:** 7 content sections (down from 8 + 6 dividers = 14 things). Same brand voice. More product-led. No abstract-then-abstract sequence. No chapter dividers. One thin marquee.

---

## Polish/redesign moves per section (anti-Claude pass)

These apply on top of the restructure:

### Hero
- Anti-Claude rule #1 violated: existing hero already left-aligned ✓
- Anti-Claude rule #2: replace primary CTA pill with sharp-rect filled + tonal text-link
- Anti-Claude rule #3: replace "Live now" pill with thin gold rule + "● LIVE — DROP 001" eyebrow
- Anti-Claude rule #4: hero composition is already split-asymmetric ✓
- Anti-Claude rule #5: hero alignment must STAY left on mobile (no `text-center md:text-left`). Currently OK — verify.

### Product carousels (Best of drop, Sweats, etc.)
- Section header: left-aligned, H3 Bricolage size-soft, NOT centered ✓
- "View all" affordance: text+arrow link, NOT button. e.g. `Shop all bestsellers →`
- Arrow nav buttons: 44×44 sharp-rect with thin gold border (already 24px-rounded — make 4-6px or 0)
- Card hover: existing `.ev-card-lift` ✓

### Categories grid
- Drop the "Pick your weapon." display H2 — let the tiles speak
- Each tile: category name as H3 Bricolage, sharp corners (cards already r=0 ✓), gold rule + numeral top-left
- Mobile: 2-column grid persists (don't center stack)

### Lookbook strip
- 3 looks horizontally scrollable
- Each look: image + poster numeral (01/02/03) + caption
- Below: `Open the issue →` text+arrow link, NOT button
- Drop the lookbook end-card from home (keep on /lookbook page)

### Brand quote band
- Single line: 60-80px tall
- Mono eyebrow + 36-48px display "Small batch. Loud graphics." + thin gold rule on left/right
- No image, no buttons

### Status strip
- 3-4 cells, mono labels + display-soft values
- "SHIPS FROM" / "Bangalore" — "PAYMENT" / "COD · UPI · cards" — "RETURNS" / "7-day no-questions"

### Footer
- Already restructured in Pass P. Hold; one tweak: change "Sign me up →" pill button to a sharp-rect filled rectangle to match anti-Claude rule #2

### Mobile bottom nav (anti-Claude rule #6)
- 5 cells = generic. Trim to 3: Search, Cart (with badge), Account. Hamburger lives in nav. Or remove entirely (nav already has the hamburger + cart/profile icons accessible).
- If kept: right-aligned, thin top rule only, no labels (icons only)

---

## What inspo also teaches us about page-level mechanics

| inspo move | applied? |
| --- | --- |
| Marquee height capped at ~28px | TODO |
| Marquee content = functional/promotional (not brand fluff) | TODO |
| H3 category name + product grid as the dominant repeating pattern | TODO (Phase 3) |
| Decorative giant category label between strips | TODO (Phase 3+4 — depends on Bungee font token) |
| Hero as a swiper / rotating campaign | EV's hero is static; this is a future consideration not a now-move |
| **Footer = the one piece that's already aligned with inspo** | ✓ from Pass P |

---

## Phase ordering implications

The structural restructure (Phase 3 in the overnight plan) should happen BEFORE the per-section polish (Phase 4) — otherwise we polish sections we're about to delete.

Ordered implementation:

1. **Phase 2** — token consolidation (foundation, no visual changes user can see)
2. **Phase 3a** — drop dividers + FeaturedCollections + mid-marquee + blog strip + lookbook end-card (subtractive, lowers entropy)
3. **Phase 3b** — add second product carousel + status strip + brand quote band (additive, raises product-focus)
4. **Phase 4** — anti-Claude per-section polish on what survives + the new sections

That's the structural plan. No code changes here — proceed to Phase 2 next.
