# Coherence re-verification · post-Phases 2–4

Sourced via `scripts/coherence-audit.mjs` rerun against the same 12
pages at 1280×900 after Phase 2 token consolidation + Phase 3
structural reorder + Phase 4a/b anti-Claude polish.

## Headline metrics, before → after

| dimension | before | after | target | trend |
| --- | ---: | ---: | ---: | --- |
| unique type signatures | 45 | **43** | <12 | ↓ minimal (deferred sweep) |
| unique bg colors | 14 | **12** | <8 | ↓ small |
| unique text colors | 21 | **20** | <10 | ↓ minimal (deferred sweep) |
| unique border colors | 13 | **14** | — | ↑ 1 (new ev-gold border on carousel arrows) |
| unique radii | 4 | **4** | 2–3 | flat |
| unique durations | 15 | **13** | <8 | ↓ small |
| unique easings | 9 | **9** | 2 | flat |
| unique button signatures | 25 | **25** | 5–6 | flat |
| unique card signatures | 4 | **2** | 3 | ↓ ✓ good |
| unique eyebrow signatures | 5 | **4** | 2 | ↓ ✓ (Space Grotesk marquee gone) |

## Real wins

1. **Bricolage Grotesque heading default applied.** Bricolage usage
   on rendered nodes jumped from 34 → **50** (+47%). The global
   `h1/h2/h3 { font-family: var(--font-display)... }` rule in Phase 2
   propagated to pages that previously left h1s in Inter (shop,
   results, faq, cart empty state). The biggest visible-to-the-eye
   coherence fix from the audit.

2. **6px radius adoption.** Use of `border-radius: 6px` jumped from
   2 → **37**. Anti-Claude rule #2 is landing: the new `.ev-rect` +
   `Button variant="poster"` + carousel arrow buttons + newsletter
   input + mobile sticky CTA bar + PDP add-to-cart all use it.

3. **Card patterns collapsed.** 4 → **2**. The Pass-H `bg-ev-elevated`
   surface replaced ad-hoc `bg-secondary` on the lookbook end-card
   and the about-page card during the Phase 3 reorder.

4. **Marquee eyebrow drift removed.** The `Space Grotesk` 12px-eyebrow
   variant (10 callsites in the audit) is gone — Phase 2 marquee
   sweep replaced `font-heading tracking-[0.28em]` with `.ev-mono`,
   so the marquee is now JetBrains Mono like every other eyebrow.

5. **Marquee height trimmed.** 38px → 28px (matches xenpachi 26px /
   comicsense 29px). The "too dominant" feeling is resolved.

## Where drift remains

These items were flagged as deferred-to-section-polish in Phase 2's
commit message. Because Phase 4 polish was time-boxed and hero +
PDP + checkout were prioritized, several JSX-level sweeps are
incomplete:

| issue | residual count | proximate cause |
| --- | ---: | --- |
| **Inter heading nodes** | 72 | h3 / h4 inside chrome (cart line item names, sidebar links) inherits Inter because those `<h3>` elements have inline class overrides (`font-medium`, `text-md`) that still beat the global default. Targeted sweep needed in cart / account / nav files. |
| **White-alpha text spread** | still 7 distinct shades | `text-white/0.55` `text-static/0.7` etc remain inline on most components. The Phase 2 commit explicitly deferred this to per-section polish. The new `.text-ev-{primary,secondary,tertiary,muted}` tokens are defined but not adopted by the JSX yet. |
| **Duration cluster** | 13 distinct | `transition-all duration-200` / `duration-300` / `duration-150` etc remain inline on dozens of components. The new `--ev-duration-{fast,med,slow}` tokens exist but adoption requires either a sweep or a Tailwind plugin that maps `duration-fast` → `var(--ev-duration-fast)`. |
| **Button signatures** | 25 distinct | Footer link styles + nav items + ad-hoc `!h-12 !px-6` overrides still inflate the count beyond the 5-6 variants the cva exposes. Cosmetic, not blocking. |

## Diagnostic interpretation

The two biggest user-visible coherence wins (Bricolage on headings;
sharp 6px radius on primary CTAs) landed. The remaining drift is
mostly the kind that's invisible to a casual visitor — adjacent
white-alphas that look identical, transitions 200ms vs 220ms vs
240ms that don't read differently to a human.

A full token sweep would drop type signatures into the 12–15 range,
text colors to 10, durations to 5. That's a ~3-4 hour focused
search-and-replace pass. Worth doing as a follow-up but not blocking.

## What was already coherent and stayed that way

- `.ev-card-lift` hover treatment
- `.ev-rise` staggered fade-in on hero
- Mobile bottom nav layout (now sparse + right-aligned, 3 icons)
- Empty-state card pattern (cart-empty / 404 / search-empty / account
  -no-orders / addresses-empty all share bg-ev-elevated + ev-grain +
  gold-ring icon + eyebrow + display-soft + dual CTAs)
- Status pill tone helper on order card
- All cards `border-radius: 0` (sharp by design)

## Updated raw audit

Raw aggregated metrics in `docs/coherence-audit-raw.json` (overwritten
with the latest run; original baseline lives in git history at commit
`d6c88d0`).
