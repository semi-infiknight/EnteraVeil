# Coherence audit · 2026-05-30

Sourced via `scripts/coherence-audit.mjs` (Playwright DOM evaluation
on 12 storefront pages at 1280×900). Raw data in
`docs/coherence-audit-raw.json`. **No code changes here — catalog only.**

Severity:
- 🔴 **critical** — visible cross-page inconsistency that reads as broken
- 🟠 **high** — system-level drift, fix in the consolidation pass
- 🟡 **medium** — fix during the relevant section's polish
- ⚪ **low** — by-design, negligible, or out-of-scope

---

## 1. Type scale 🔴

12 pages produced **45 distinct (tag/fontSize/lineHeight/fontWeight/letterSpacing/textTransform)** combinations. Coherent system should be 8–12. The drift is mostly headings rendered with the wrong font.

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🔴 **h1 on `/shop` and `/results` uses Inter 48px/56px w=400** ("All products"), not Bricolage Grotesque | shop, results | Either give those h1s `.ev-display-soft`, or set h1 default in globals.css to use `--font-display`. |
| 🔴 **h2 "Medusa Shorts" on PDP is Inter 32px/40px w=400** | pdp, faq | PDP product title should be at least `.ev-display-soft text-3xl`. FAQ h2 same fix. |
| 🔴 **h2 "Your shopping cart is empty" is Inter 24px/32px w=400** | cart, account | Adopt `.ev-display-soft` so the empty headlines read like the rest of the empty-state cards (Pass S already did this on order card / addresses / search — cart + account dropdown missed). |
| 🔴 **h3 "Collections" / "Categories" filters use Inter 16-24px w=400-500** | shop, results | Shop filter section headers should adopt the editorial eyebrow + h3 pattern, not bare Inter. |
| 🟠 **Three distinct hero/section h2 sizes — 48/56, 60/57, 115.2/99** | home (115.2/99 hero), home + about (60/57 brand), shop/cart/etc (48/56 section) | Lock to 3 named tiers: `.ev-display-hero`, `.ev-display-section`, `.ev-display-card`. Stop using ad-hoc `text-[clamp(3.25rem,9vw,9rem)]` per file. |
| 🟠 **Body `<p>` is 12px, 14px, AND 16px**, all w=400 | every page | Lock to **two** body sizes: `text-base` (16px) for primary copy and `text-sm` (14px) for secondary. Kill the 12px body except for legal/footnotes. |
| 🟡 **h3 "Description" PDP tab is Bricolage 16px w=700 ls=-0.56px** | pdp | Either bump to 18-20px so it reads as a tab title, or accept and document as an exception. |
| 🟡 **h1 hero clamp 9vw produces 115.2px on desktop, 0.86 LH** — wider tracking than any other display | home (`HeroFallback`) | Either codify this in `.ev-display-hero` or reduce to match `text-9xl` (a token in the new scale). |

### Why this matters
Eight of the audited pages have at least one heading rendering in Inter
instead of Bricolage. That's the single most visible source of "half-
baked" feeling — the same page has Bricolage in its hero and Inter in
its sidebar/filters. Reader notices.

---

## 2. Spacing rhythm 🟠

Pages use a mix of Tailwind defaults and ad-hoc paddings. No
documented spacing scale.

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🟠 Container padding ranges: 16px, 20px, 24px, 32px, 48px, 56px 48px, 96px | most pages | Adopt 4-token scale: `--ev-space-tight (16px)`, `-snug (24px)`, `-loose (48px)`, `-roomy (96px)`. Map Container variants to these. |
| 🟠 Section gaps: `gap-6`, `gap-8`, `gap-10`, `gap-12`, `gap-14` all coexist on home alone | home | Reduce to two: `gap-8` between in-section items, `gap-14` between major sections. |
| 🟠 Lookbook end-card padding: `56px 48px` is unique. Brand banner: `96px 80px`. Empty-state cards (Pass O-S): mostly `48px 24px`. | home, about, cart, account | Pick **one** "deluxe card" padding token and use it everywhere. |
| 🟡 Marquee strip vertical padding shifts between `py-2` (8px) and `py-3` (12px) | layout marquee vs hero scroll cue | Standardize on `py-2`. |
| ⚪ Per-section vertical padding is mostly consistent (`py-12 small:py-16`) — keep | home sections | OK. |

---

## 3. Color drift 🟠

- **bg**: 14 distinct values (target ≤8)
- **text**: 21 distinct values (target ≤10)
- **border**: 13 distinct values (target ≤6)

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🟠 **Seven distinct white alphas in text colour**: `rgba(255,255,255, 0.4/0.55/0.65/0.7/0.75/0.8/0.85)` | every page | Collapse to four: `--ev-text-primary` (0.95-1.0), `--ev-text-secondary` (0.75), `--ev-text-tertiary` (0.55), `--ev-text-muted` (0.40). Sweep the JSX. |
| 🟠 **Five distinct dark alphas in background**: `rgba(10,10,10, 0.6/0.7/0.8/0.9/0.95)` | hero pill overlays, dropdown panels, sticky CTA | Collapse to three: solid (`bg-primary`), glassy (`bg-primary/85`), scrim (`bg-primary/40`). |
| 🟠 **Two parallel border systems**: `rgba(255,255,255,X)` and `rgba(245,245,244,X)` — same visual intent, different writeup | global | Pick one (recommend `255,255,255` for hairlines; `245,245,244` for solid). Sweep and convert. |
| 🟠 **Three distinct gold alphas in text**: `rgba(255,182,39, 0.8/0.85/0.9)` plus solid `rgb(255,182,39)` | sectionheading eyebrows, footer eyebrows, CTAs | Token: `--ev-gold-solid`, `--ev-gold-soft (0.8)`. Stop using `text-action-primary/85`, `/80`, `/90` interchangeably. |
| 🟡 `rgb(245,245,244)` (the design-system foreground/light) and `rgb(255,255,255)` (pure white) BOTH appear as text and bg | newsletter input bg, primary CTA bg, button text | Pick one. The system intended 245-245-244 for `bg-static`; pure white should not appear as a fill. |
| ⚪ `rgb(165,165,165)` and `rgb(108,108,108)` are text-secondary tokens — keep | various | OK. |

### Top accumulated colors (proof the system is mostly disciplined)

```
text:  245,245,244 (1987)  →  primary
       255,255,255 (1347)  →  alternative primary (split)
       255,182,39 (558)    →  gold accent
       255,255,255/.75 (283) → secondary
       10,10,10 (158)      →  inverse on light fills
       165,165,165 (54)    →  tertiary

bg:    10,10,10 (117)      →  --bg-primary (good)
       255,255,255/.1 (74) →  fg-secondary glass (good)
       245,245,244 (43)    →  filled CTA bg (split)
       26,26,26 (23)       →  --ev-elevated (good)
       21,21,21 (15)       →  --bg-secondary (semi-redundant w/ 26,26,26)

border: 255,255,255/.08 (4999) → divider hairline (dominant, good)
        228,228,231 (100)      → light-mode default (medusa-ui leak?)
        245,245,244/.2..0.5    → action-primary borders (5 alphas)
```

---

## 4. Border radius 🟡

| value | count | usage |
| --- | --- | --- |
| `9999px` | 337 | pill buttons + circular icon buttons + status pills |
| `24px` | 96 | medium-rounded buttons / chips |
| `16px` | 46 | input fields / inset chrome |
| `6px` | 2 | unknown (likely from a Medusa-UI input) |

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🟡 The `6px` value appears 2× only. Likely a Medusa-UI default that escaped. | unknown — grep for `rounded-md` or `rounded-[6px]` | Identify and either kill or replace with the 16px token. |
| ⚪ Otherwise: 3-token radius system (pill / 24 / 16) is healthy. | global | Token: `--ev-radius-pill`, `--ev-radius-md (24)`, `--ev-radius-sm (16)`. |

---

## 5. Transition / animation timings 🟠

15 distinct durations across the audit. Clustering is the problem — five different "fast" values.

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🔴 **Five overlapping "fast" durations**: 150ms, 200ms, 220ms, 300ms, 320ms | scattered across Button cva, ev-card-lift, .ev-rise, prose links | Collapse to three: `--ev-duration-fast (150ms)`, `-med (240ms)`, `-slow (400ms)`. |
| 🟠 **`0.7s` (700ms)** appears 32× — image hover scale on product tiles + lookbook | product-tile, lookbook | Add `--ev-duration-image (700ms)` token; only used for image scale. |
| 🟠 **Nine distinct easings**: `ease`, `ease-in-out`, `cubic-bezier(0.4, 0, 0.2, 1)`, `cubic-bezier(0, 0, 0.2, 1)`, `cubic-bezier(0.22, 1, 0.36, 1)`, `ease-out` | global | Lock to two: `--ev-ease-standard` (cubic-bezier(0.4, 0, 0.2, 1)) and `--ev-ease-spring` (cubic-bezier(0.22, 1, 0.36, 1)). Kill the rest. |
| ⚪ Marquee animations: 28s + 60s — by design, keep | layout marquee | OK. |
| ⚪ ev-rise sequential fade-in: 520ms cubic-bezier(0.22, 1, 0.36, 1) — by design | hero | OK; document in tokens. |

---

## 6. Eyebrow patterns 🟠

5 distinct "small uppercase wide-tracked" signatures detected.

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🔴 **`.ev-eyebrow`** uses `fs=11px ls=3.52px JetBrains Mono`. **`.ev-mono`** uses `fs=11px ls=1.98px JetBrains Mono`. They're written as if they were the same thing but their letter-spacing differs by ~76%. | every page; `.ev-eyebrow` (24 callsites) and `.ev-mono` (24 callsites) | Decide: keep both but document — eyebrow = section label (wider track), mono = metadata strip (tighter track). Add a comment in `globals.css` clarifying intent. OR merge to one. |
| 🔴 **Old marquee text still uses `Space Grotesk 12px/3.36px ls`**, not the new JetBrains Mono `ev-eyebrow` | `apps/storefront/src/modules/common/components/marquee/index.tsx` line ~29 (`font-heading tracking-[0.28em]`) | Replace `font-heading tracking-[0.28em]` with `.ev-mono` class. |
| 🟡 Bottom-nav labels are `Inter 10px ls=1.6px` (mislabeled as ev-mono in audit but actually inline `text-[10px]`) | mobile-bottom-nav | Already uses `.ev-mono`. Audit just caught the inline override. OK. |
| 🟡 Product-tile "01" numeric badge uses `Inter 10px ls=1.6px` not JetBrains Mono | product-tile featured-categories | If we adopt Bungee as `--font-poster`, numerals like this go to Bungee. Until then, use `.ev-mono`. |

### Why two eyebrow widths?
The 3.52px tracking is wide enough that "SS26 · DROP 001" reads as a magazine masthead. The 1.98px is tight enough that "Hand-printed · Numbered · Small batch" reads as a continuous metadata strip. Both are correct for their purpose — but they need explicit documentation, otherwise designers (and Claude in three months) will mix them randomly.

---

## 7. Buttons 🟠

**25 distinct button signatures**. The `Button` cva has 4 variants (filled, ghost, tonal, text, destructive, icon) — but ad-hoc `!h-12 !px-6` overrides have multiplied the visible shape count.

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🟠 **Three distinct heights for "primary CTA"**: 44px, 48px, auto. | hero buttons (`!h-12`), section "View all" (default `h-12` = 48), shop arrows (`h-11 = 44`) | Standardize on `h-12 (48px)` for primary CTAs and `h-11 (44px)` for icon-only buttons. Remove the `!h-12` overrides — bake into the variant. |
| 🟠 **Four padding variants for "tonal" button**: `14px`, `12px 16px`, `12px 24px`, `5px 20px`-equivalent | various | Map to two: `--ev-btn-padding-icon (14px)`, `--ev-btn-padding-text (12px 24px)`. |
| 🟠 **`r=9999px`** (pill) and **`r=24px`** (md-rounded) BOTH appear for icon buttons. | nav cart button (9999px), nav profile (9999px), shop filter button (24px), carousel arrows (24px) | Pick one for icon buttons. Recommendation: pill (9999) when stand-alone, 24px when inline in a button group. Document. |
| 🟠 No "poster" variant yet (xenpachi/comicsense-style sharp 4-6px) — slated for future polish | hero primary CTA + cart checkout (planned) | Add `variant: 'poster'` per the inspo synthesis Move #4. |
| 🟡 Many "buttons" the audit caught are actually links (NavigationItem). Their `r=0px p=0px` signatures inflate the count. | footer, nav | Update the audit script to exclude `<a>` not styled as button. (Cosmetic — not a bug.) |

---

## 8. Cards 🟡

Only **4 unique card signatures** — this is healthy.

| pattern | bg | border | radius | padding | usage |
| --- | --- | --- | --- | --- | --- |
| transparent + lift | `transparent` | `0` | 0 | 0 | product tile, collection tile, lookbook tile |
| skeleton bg + lift | `rgb(44,43,42)` | `0` | 0 | 0 | lookbook tile (during image load) |
| elevated card | `transparent` (via bg-class) | `1px solid 245,245,244/0.25` | 0 | `56px 48px` | lookbook end-card |
| about-page card | `rgb(21,21,21)` | `1px solid 245,245,244/0.2` | 0 | `24px` | about |

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🟡 Lookbook end-card has UNIQUE padding `56px 48px` not used elsewhere | lookbook | Adopt the new "deluxe card" spacing token from Issue #2. |
| 🟡 About-page card uses `bg-secondary` (rgb 21,21,21) while empty-state cards use `bg-ev-elevated` (rgb 26,26,26). Same intent, different rgb. | about, vs. cart-empty / 404 / order-card | Pick one elevated bg. Recommend `bg-ev-elevated` (26,26,26) since it's the newer convention from Pass H. Sweep `bg-secondary` → `bg-ev-elevated` for card surfaces. |
| ⚪ All cards `r=0px` (no rounded corners) — by design, on-brand. Keep. | global | OK. |

---

## 9. Section header patterns 🟠

Two pattern systems coexist:

**Pattern A** (`SectionHeading` component — used in `FeaturedCategories`, `FeaturedCollections`, `Lookbook`, `BrandBanner`):
```
[eyebrow + gold rule strip] (optional)
[ev-display-soft heading at 36-60px]
[secondary copy 16px]
[optional right-action]
```

**Pattern B** (`SectionDivider` component — used as standalone band between sections):
```
[ev-num 24px] [ev-mono — Label] [gold rule fills remainder]
```

**Pattern C** (improvised inline — used in checkout, account, search, results templates):
- Heading rendered directly with `text-xl small:text-2xl` Inter
- No eyebrow
- No rule

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🔴 **At least 5 pages render section headings inline as `<h1>` or `<h2>` Inter** instead of using `SectionHeading`/`SectionDivider`: shop ("All products"), results ("Search results for"), faq ("Frequently asked questions"), cart ("Your shopping cart"), account-page parents | shop, results, faq, cart, account | Refactor each page to wrap its primary heading in `SectionHeading` with an eyebrow + display title. Single source of truth. |
| 🟠 `SectionHeading` itself has TWO modes (with/without `index` numeral) which paint differently. Document this in JSDoc with screenshots. | section-heading/index.tsx | Just doc; no code change. |
| 🟡 `SectionDivider` index labels go `01..06` on home but the same component could be used on shop ("01 — All drops") and results ("01 — Search results"). Currently each page invents its own opener. | global | Adopt `SectionDivider` on every top-level page. |

---

## 10. Breakpoints 🔴

Audit detected **seven** distinct breakpoint values across loaded stylesheets:

```
(max-width: 600px)
(min-width: 355px)
(min-width: 640px)   ← tailwind sm
(min-width: 768px)   ← tailwind md
(min-width: 900px)
(min-width: 1100px)
(min-width: 1700px)
```

### Issues

| Issue | Where | Fix |
| --- | --- | --- |
| 🔴 **Non-Tailwind breakpoints `355px`, `600px`, `900px`, `1100px`, `1700px`** are coming from the Medusa UI preset (`@medusajs/ui-preset`) and from Strapi-related plugins. | `tailwind.config.js` preset chain | Either accept (the JSX uses `xsmall:`, `small:`, `medium:`, `large:`, `xl:` etc — which map to these) OR override in our preset to pull everything to standard Tailwind breakpoints. The fact that the JSX uses `small:`, `medium:`, `large:` (Medusa preset names) all over the codebase means the codebase is bound to the Medusa system. **Recommendation: document the mapping, don't fight it.** |
| 🟠 Site uses BOTH `(max-width: 600px)` and `(min-width: 640px)` — a 40px deadzone where neither rule fires (technically there's `xsmall: 355px` filling part of it, but the boundaries are confusing). | medusa-ui preset | Audit which components rely on the 600px max-width vs which on 640+. Probably nothing — the rules likely just don't overlap. But worth a grep. |

### Breakpoint mapping (Medusa preset)
For polish prompts to use:
```
xsmall  →  355px  (small phones)
small   →  640px  (standard sm)
medium  →  768px  (standard md)
large   →  1024px (standard lg — wait, this isn't in the detected list... need to grep)
xl      →  1280px (standard xl)
2xl     →  1536px
```
(Need to confirm `large` value — audit found 900px and 1100px instead of 1024. Recommendation: grep `tailwind.config` and the preset to confirm and document in `docs/breakpoints.md` before any polish prompt that touches responsiveness.)

---

## Cross-cutting summary

The audit confirms the user's intuition. The biggest sources of "half-baked, glued-together" feeling are:

1. **Heading font drift** — half the page-level h1/h2 still render in Inter despite the system intending Bricolage Grotesque. (Issue #1, 5 critical rows)
2. **Color alpha sprawl** — 7 white-alpha text shades + 5 dark-alpha bg shades, written ad-hoc per file. (Issue #3)
3. **Animation timing cluster** — 5 close-but-different "fast" durations between 150 and 320ms. (Issue #5)
4. **Section headers improvised on 5+ pages** — `SectionHeading` exists, isn't adopted everywhere. (Issue #9, critical)
5. **Two-system eyebrow** without documentation — `.ev-eyebrow` (3.52px ls) vs `.ev-mono` (1.98px ls) used interchangeably in JSX. (Issue #6)

These five issues are what the consolidation pass (Step 2) should target. Everything else (radius 4/4 tokens, card 4-pattern set, breakpoint mapping) is healthy or just needs documentation.

---

## What's already coherent (don't break)

- **`.ev-card-lift`** transition pattern — used 32× across product tiles, lookbook, brand banner, end-cards. Consistent.
- **Marquee** strips — 2 marquees, 28s and 60s durations, edge-fade mask, consistent.
- **`.ev-rise` + delay tier** — sequential fade-in on hero. Consistent.
- **Status-pill tone helper** (`statusToneClass` from Pass S) — uses the gold/grey/red pattern from Issue #3 cleanly.
- **Card radius — all 0px** — sharp-cornered cards, on-brand for streetwear.
- **Mobile bottom nav** — uses `.ev-mono`, `safe-area-inset-bottom`, single source.
- **Empty-state card pattern** (Pass O-S) — `bg-ev-elevated + ev-grain + ev-eyebrow + ev-display-soft + dual CTA` — appears identically in cart-empty, account-no-orders, no-addresses, search-empty, 404. ✓

---

## Recommended next step (Step 2 from the brief)

Land token consolidation in this order (each step independently
testable):

1. **Color tokens** — `--ev-text-{primary,secondary,tertiary,muted}` and `--ev-bg-{primary,elevated,deep,warm,scrim}` and `--ev-gold-{solid,soft}`. Sweep JSX to replace `text-white/0.75` etc. (Issue #3)
2. **Animation tokens** — `--ev-duration-{fast,med,slow,image}` + `--ev-ease-{standard,spring}`. Sweep `duration-200`, `duration-300`, `transition-all` overrides. (Issue #5)
3. **Type tokens** — fix the h1/h2/h3 default font-family in `globals.css` so `<h1>`, `<h2>`, `<h3>` ALL default to Bricolage Grotesque + a hierarchy size scale. (Issue #1)
4. **Eyebrow doc** — comment in `globals.css` differentiating `.ev-eyebrow` (3.5px ls) and `.ev-mono` (2px ls). Replace the marquee component's `font-heading` with `.ev-mono`. (Issue #6)
5. **SectionHeading adoption** — refactor shop, results, faq, cart, account-dashboard top headings to use `SectionHeading`. (Issue #9)
6. **Spacing tokens** — `--ev-space-{tight,snug,loose,roomy}` and sweep container paddings + section gaps. (Issue #2)
7. **Card surface unification** — `bg-secondary` → `bg-ev-elevated` for elevated cards; deluxe-card padding token for lookbook end-card. (Issue #8)

Total touch surface: ~20-25 files. Should land in one well-tested
commit per token category, with `pnpm typecheck` + the `tap-verify`
probe + a re-run of `coherence-audit.mjs` showing the unique counts
dropping. Target: <12 type signatures, <8 bg colors, <10 text colors,
<3 duration buckets after sweep.
