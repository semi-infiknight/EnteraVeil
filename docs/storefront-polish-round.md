# Storefront polish round (historical) · 2026-05-30

Design pass grounded in xenpachi.com + comicsense.store reference audits.
Companion to [`storefront-qa-audit.md`](./storefront-qa-audit.md). Not a live deploy checklist — see [`PRODUCTION-STATE.md`](./PRODUCTION-STATE.md).

## Phase 1 — Reference capture + audit (foundation)

Three sibling docs written, all sourced via Playwright DOM evaluation
+ computed styles (no images read into context):

- **`docs/inspiration-notes.md`** — raw computed-style dump from both
  inspo sites + synthesis section with 8 named moves traced to
  evidence (Bungee third tier, background-scale category labels,
  promo-content marquees, sharp-rect CTAs, collapsed line-height
  display, second brand accent, save-heart per card, dismissible
  offer banner above marquee). Committed at `d849765`.

- **`docs/coherence-audit.md`** + raw JSON — 12-page sweep cataloguing
  drift in 10 dimensions (type / spacing / color / radius / animation
  / eyebrows / buttons / cards / section headers / breakpoints).
  Found 45 unique type signatures, 7 white-alpha sprawl in text, 5
  fast-duration cluster, 5 distinct eyebrow patterns, SectionHeading
  improvised on 5+ pages. Committed at `d6c88d0`.

- **`docs/structure-comparison.md`** — side-by-side walk of
  xenpachi home (14 sections, all left-aligned, 8+ product strips by
  category, NO chapter dividers, NO collection abstraction),
  comicsense home (8 sections: hero swiper + product grids
  interleaved with giant decorative category labels), and EV home
  (14 things on screen including 6 SectionDivider chapter marks +
  FeaturedCollections + FeaturedCategories + Lookbook + brand banner
  + blog strip + mid-marquee). Identifies 4 sections to drop, 2 to
  trim, 3 to add. Committed at `6f0a054`.

## Phase 2 — System consolidation · `4543f8f`

`apps/storefront/src/styles/globals.css` rewritten with exhaustive
design tokens at the top of the file:
- 5 duration tiers (`--ev-duration-fast/med/slow/image/rise`)
- 2 easing curves (`--ev-ease-standard/spring`)
- 4 spacing tiers
- text alpha system (primary 1.0 / secondary 0.75 / tertiary 0.55
  / muted 0.40)
- 5 surface tones (deep / primary / elevated / warm / scrim)
- gold + soft-alpha
- 3 radii (pill / 6px / 2px — anti-Claude bias toward sharp corners)

Global heading default applied: `h1 / h2 / h3 { font-family: var
(--font-display) ... }` — fixes the coherence audit Issue 1 critical
finding (shop / results / pdp / cart / faq h1-h2 were rendering in
Inter despite the system intending Bricolage).

Anti-Claude utilities defined: `.ev-rect` sharp-rect filled CTA,
`.ev-rect-outline` ghost variant, `.ev-arrow-link` text + arrow
secondary CTA, `.ev-display-collapsed` for hero line-height 0.74,
`.ev-chapter-mark` for translucent decorative category labels.

Marquee component updated: `font-heading tracking-[0.28em]` ->
`.ev-mono` (closes the eyebrow drift Issue 6). Marquee height trimmed
`py-2` -> `py-1.5` to match xenpachi/comicsense 26-29px (was 38px).

Top marquee copy rewritten from brand fluff to functional offers per
inspo synthesis Move 3 (comicsense uses promo codes in marquee).

## Phase 3 — Structural reorder · `fa2cde6`

Home page composition rewritten per `structure-comparison.md`
recommendation. 14 things on screen -> 7 content sections + the
existing chrome (nav + marquee + footer).

DROPPED:
- All 6 `SectionDivider` chapter marks (xenpachi/comicsense don't
  have these — they read as preamble, not content)
- `FeaturedCollections` (duplicates `FeaturedCategories` — both
  abstract-then-category-page; neither inspo site has this layer)
- Mid-page Marquee (visual repetition)
- Conditional Strapi blog strip (rarely renders)
- Lookbook end-card on home (kept on /lookbook directly)

TRIMMED:
- Lookbook: 6 asymmetric tiles -> 3 same-aspect tiles
- "Open the issue ->" pill button -> `.ev-arrow-link` in header

ADDED:
- `BrandQuote` (new component, modules/home/components/brand-quote):
  the full BrandBanner section (520px+) compressed to a 280-320px
  band. Eyebrow + display headline + sub-copy, no image, no buttons.
- `StatusStrip` (new, modules/home/components/status-strip):
  trust band above footer. 4 cells, mono labels above display values.
  bg-ev-warm so it visually pulls toward the warm-toned footer.
- Second `ProductCarousel` ("New this drop") below categories —
  xenpachi multi-strip pattern.

New home order:
```
HERO -> Best of the drop -> Categories -> New this drop ->
Lookbook strip (3 tiles + arrow) -> Brand quote band ->
Status strip -> Footer
```

## Phase 4 — Anti-Claude per-section polish

### 4a — Hero rewrite · `a57021c`

User-reported "looks so Claude" hero rewritten:
- Both rounded-3xl pill CTAs gone. Primary "Shop the drop ->" uses
  `.ev-rect` (6px filled gold + JetBrains Mono caps). Secondary
  "View the lookbook ->" uses `.ev-arrow-link` (text + arrow,
  hairline underline that lengthens on hover).
- "Live now" rounded-pill backdrop-blur badge replaced with inline
  `● LIVE — DROP 001 · SS26` (bullet + mono caps + hairline rule).
- Mobile metadata band promoted (was `hidden small:flex`). Phones
  now see 2 cells ("Numbered 01/200" + "From Bangalore") so the
  hero communicates real-shop, not template-hero.
- h1 switched from `.ev-display` (0.86 lh) to `.ev-display-collapsed`
  (0.74 lh) for xenpachi-style descenders-kissing collapsed type.
- Noise grain hidden on small screens (compute > visible benefit).
- Image column shrunk 52vh -> 48vh so type gets 60/40 weight.
- Anti-Claude rule #5 honored: left-aligned on every viewport, no
  text-center variant anywhere.

### 4b — Categories / carousel / mobile nav · `07b6a71`

- `FeaturedCategories`: "Pick your weapon." display H2 dropped. Mono
  eyebrow + arrow-link header. Decorative giant "CATEGORIES" word
  behind the grid via `.ev-chapter-mark` (inspo synthesis Move #2).
  Tile numerals are mono + bullet, not rounded chips. Mono "Shop
  {category} ->" sub-line per tile.
- `ProductCarousel`: "View all" pill -> arrow-link. Carousel
  arrow buttons rounded-full -> rounded-md (sharp 6px) with ev-gold/30
  border, hover lights to ev-gold.
- `MobileBottomNav`: 5-cell grid with labels -> 3 sparse icons right-
  aligned (search / account / cart). No labels. No homogeneous grid.
  Height 72px -> 56px. Anti-Claude rule #6 honored.
- (main) layout pb adjusted 72px -> 56px; PDP sticky CTA bottom
  offset matches.

### 4c — Poster variant adoption · `ac96cce`

Added `Button variant="poster"` to the cva (6px corners + bg-ev-gold
+ dark text + JetBrains Mono caps + 0.2em tracking + semibold).
Applied to:
- PDP "Add to cart" + "Out of stock" + "Select variant"
- PDP mobile sticky "Tap to add"
- Footer newsletter "Sign me up ->"
- Checkout SubmitButton default (so address / delivery / payment
  step submits all use it)

PDP mobile sticky CTA bar — rounded-full container -> rounded-md.
Footer newsletter input — rounded-full -> rounded-md, focus ring
shifted from action-primary to ev-gold.

## Phase 5 — Coherence re-verify · `docs/coherence-verified.md`

Re-ran `scripts/coherence-audit.mjs` on all 12 pages. Headline diffs:

| dimension | before | after | trend |
| --- | ---: | ---: | --- |
| type signatures | 45 | 43 | minor (deferred sweep) |
| bg colors | 14 | 12 | ↓ |
| text colors | 21 | 20 | minor (deferred sweep) |
| radii | 4 | 4 | flat |
| durations | 15 | 13 | ↓ |
| eyebrow signatures | 5 | **4** | ↓ ✓ (Space Grotesk variant gone) |
| card signatures | 4 | **2** | ↓ ✓ |
| **Bricolage h1/h2/h3 nodes** | 34 | **50** (+47%) | ↑ ✓ |
| **6px radius nodes** | 2 | **37** (+1750%) | ↑ ✓ |

The two biggest user-visible coherence wins (Bricolage on every
heading + sharp 6px on every primary CTA) landed. Residual drift
(white-alpha text spread, button signature count, duration cluster)
is invisible to a casual visitor and explicitly deferred to a future
focused search-and-replace pass.

## Phase 6 — Final wrap

Production build clean:
```
pnpm build  →  ✓ Compiled successfully
```

Storefront restarted in `next start` mode for the tunnel.

Playwright `tap-verify` on the tunnel
`https://poll-patrick-telling-webmaster.trycloudflare.com/in`:
- HAMBURGER -> dialog opened: **true** ✓
- ACCORDION expanded: **true** ✓
- SEARCH panel opened: **true** ✓
- non-HMR console errors: (none)

Page sweep (10 routes, desktop + mobile UA):
```
/in                        200 / 200
/in/shop                   200 / 200
/in/products/shorts        200 / 200
/in/cart                   200 / 200
/in/account                200 / 200
/in/lookbook               200 / 200
/in/about-us               200 / 200
/in/faq                    200 / 200
/in/blog                   200 / 200
/in/this-doesnt-exist      404 / 404
```

`pnpm typecheck` clean in both apps.

## Tunnel URLs (still live, no rotation needed)

- Storefront: https://poll-patrick-telling-webmaster.trycloudflare.com/in
- Admin: https://healthy-authorization-isolated-optical.trycloudflare.com/app/

Admin login: `admin@enteraveil.local` / `devpass123`.

## Commits this round (newest first)

```
ac96cce  design(buttons): adopt poster variant on PDP + checkout + newsletter
07b6a71  design(home,nav): anti-Claude polish on categories, carousel, bottom nav
a57021c  design(hero): anti-Claude rewrite — sharp CTA, hairline LIVE indicator
fa2cde6  design(structure): restructure /in home per inspo comparison
4543f8f  chore(tokens): consolidate design tokens + initial marquee sweep
6f0a054  chore: structural map + proposed reorder (xenpachi vs comicsense vs EV)
d6c88d0  chore: coherence audit — catalog drift across 12 storefront pages
d849765  chore: capture xenpachi + comicsense inspiration notes
```

## What changed for the user

When the user opens
`https://poll-patrick-telling-webmaster.trycloudflare.com/in`:

1. The marquee is **thinner** (~28px vs 38px) and reads as functional
   offers ("USE CODE DROP001 — 15% OFF · COD ACROSS INDIA") instead
   of brand chant.
2. The hero CTAs are **sharp gold rectangles**, not rounded pills. The
   "LIVE" indicator is a hairline + bullet + mono caps, no rounded
   pill border.
3. The "Beyond / the veil." headline is even more collapsed
   (0.74 line-height) — descenders kiss the next line, xenpachi-style.
4. On mobile, the hero shows **2 metadata cells** (Numbered + From)
   instead of nothing — the alignment stays left, not centered.
5. The home page **leads with products** ("Best of the drop")
   instead of abstract collection tiles — matches xenpachi /
   comicsense, both of which put merchandise above the fold.
6. The 6 numbered chapter dividers ("01 — Collections" etc) are
   **gone**. The page no longer reads as a stack of preambles.
7. The categories grid has a **decorative giant "CATEGORIES" word**
   behind it (Bricolage 800 at 6% opacity), the comicsense move.
8. **Two product carousels** ("Best of the drop" + "New this drop")
   replace the single carousel — xenpachi multi-strip pattern.
9. The lookbook is **trimmed to 3 looks** (was 6) with an
   `.ev-arrow-link` "Open the issue →" instead of a pill button.
10. The brand banner is a **slim 280px band** ("Small batch. Loud
    graphics.") instead of a 520px full section.
11. New **status strip** above the footer ("Ships from / Bangalore
    3-5 days · Payment / COD UPI cards · Returns / 7-day no-questions").
12. The mobile bottom nav is **3 sparse icons** right-aligned (was
    5 evenly-spaced labeled cells).
13. Every primary CTA across the site (PDP "Add to cart", footer
    "Sign me up", checkout "Proceed to delivery", etc) is the new
    **sharp-rect gold poster variant**.
14. Every heading on every page now defaults to **Bricolage Grotesque**
    (was Inter on shop / results / pdp / cart / faq).

## Honest deferrals

- Full white-alpha JSX sweep (Phase 2 explicitly skipped — deferred
  to a future focused pass)
- `Button` signature count still high (25) because ad-hoc
  `!h-12 !px-6` overrides pollute the visual count even after the
  poster variant landed
- Strapi off → BrandBanner fallback uses BrandQuote (slim) which
  is fine; if Strapi comes back with a `MidBanner` payload, the
  full editorial banner renders
- Razorpay + Resend still placeholder env (no creds)
- Per-page polish on /about-us, /faq, /lookbook, /blog content
  pages not addressed this round — they inherit the global heading
  fix and the new status strip + footer but didn't get a layout pass

## Next steps if the user wants more

1. **Full token sweep** — replace `text-white/0.X` with the new
   text-ev-* utilities across all 80+ component files. Drop button
   signature count + text color count.
2. **Bungee font integration** — currently absent. Inspo synthesis
   Move #1 calls for it as a 4th type tier for callouts
   (hero numerals, drop pills, 404 numeral, category section labels).
3. **Save-heart** per product tile (synthesis Move #7, comicsense
   pattern) — localStorage-backed, no backend.
4. **Dismissible offer banner above the marquee** (synthesis Move
   #8) — thin bg-ev-deep, ev-mono 10px, gold pulse dot, single
   rotating offer.
5. **PDP visual refinement** — gallery / variant pills / tabs got
   polish in earlier passes I-Q; would benefit from a fresh anti-
   Claude pass now that the system tokens exist.
