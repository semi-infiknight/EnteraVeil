// Coherence audit — sweeps every storefront page, pulls computed styles
// for every interactive/typographic element, and writes a categorized
// inconsistency report to docs/coherence-audit.md.
//
// Run: node scripts/coherence-audit.mjs
//
// Ten dimensions audited:
//   1. type scale     2. spacing rhythm     3. color drift
//   4. border radius  5. animation timing   6. eyebrow patterns
//   7. button variants 8. card patterns    9. section headers
//   10. breakpoints

import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'
import { writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

const PAGES = [
  { name: 'home', path: '/in' },
  { name: 'shop', path: '/in/shop' },
  { name: 'pdp', path: '/in/products/shorts' },
  { name: 'cart', path: '/in/cart' },
  { name: 'account', path: '/in/account' },
  { name: 'lookbook', path: '/in/lookbook' },
  { name: 'about', path: '/in/about-us' },
  { name: 'faq', path: '/in/faq' },
  { name: 'blog', path: '/in/blog' },
  { name: 'results', path: '/in/results/shirt' },
  { name: 'categories', path: '/in/categories/shirts' },
  { name: '404', path: '/in/this-doesnt-exist' },
]

const BASE = 'http://localhost:8000'

const browser = await chromium.launch({ headless: true })

// ── Per-page snapshot ────────────────────────────────────────────────────────
async function snapshot(page, label) {
  return await page.evaluate((label) => {
    const css = (el) => getComputedStyle(el)

    // Helper: normalize a value (strip extra whitespace etc.)
    const norm = (v) => (v || '').toString().trim()

    // ── 1. TYPE SCALE ──────────────────────────────────────────────────────
    const typeSamples = []
    const seenSelectors = new Set()
    for (const sel of ['h1', 'h2', 'h3', 'h4', 'p', 'span', 'a']) {
      const els = document.querySelectorAll(sel)
      let captured = 0
      for (const el of els) {
        if (captured >= 4) break
        const cs = css(el)
        const sig = `${sel}|${cs.fontSize}|${cs.fontWeight}|${cs.lineHeight}|${cs.letterSpacing}|${cs.textTransform}|${cs.fontFamily.slice(0, 40)}`
        if (seenSelectors.has(sig)) continue
        seenSelectors.add(sig)
        // Capture a short text sample so we know what this is
        const text = (el.textContent || '').trim().slice(0, 50)
        if (!text) continue
        typeSamples.push({
          tag: sel,
          text,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          textTransform: cs.textTransform,
          fontFamily: cs.fontFamily.replace(/"/g, '').slice(0, 50),
        })
        captured++
      }
    }

    // ── 2. SPACING (section/container padding + gap) ──────────────────────
    const spacingSamples = []
    const containerEls = document.querySelectorAll(
      'main > div, main > section, section, [class*="container"], [class*="Container"]'
    )
    let cap = 0
    for (const el of containerEls) {
      if (cap >= 20) break
      const cs = css(el)
      const sig = `${cs.padding}|${cs.gap}|${cs.marginTop}|${cs.marginBottom}`
      if (sig === 'normal|normal|0px|0px' || sig === 'normal|normal|auto|auto') continue
      spacingSamples.push({
        tag: el.tagName,
        classes: (el.className || '').toString().slice(0, 80),
        padding: cs.padding,
        gap: cs.gap,
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
      })
      cap++
    }

    // ── 3. COLOR DRIFT ─────────────────────────────────────────────────────
    const colorBag = { bg: {}, text: {}, border: {} }
    document.querySelectorAll('*').forEach((el) => {
      const cs = css(el)
      const bg = cs.backgroundColor
      const tx = cs.color
      const bd = cs.borderColor
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        colorBag.bg[bg] = (colorBag.bg[bg] || 0) + 1
      }
      if (tx) colorBag.text[tx] = (colorBag.text[tx] || 0) + 1
      if (
        bd &&
        bd !== 'rgb(0, 0, 0)' &&
        bd !== 'rgba(0, 0, 0, 0)' &&
        bd !== 'transparent'
      ) {
        colorBag.border[bd] = (colorBag.border[bd] || 0) + 1
      }
    })

    // ── 4. BORDER RADIUS ───────────────────────────────────────────────────
    const radiusBag = {}
    document.querySelectorAll('*').forEach((el) => {
      const cs = css(el)
      const r = cs.borderRadius
      if (r && r !== '0px') radiusBag[r] = (radiusBag[r] || 0) + 1
    })

    // ── 5. TRANSITION / ANIMATION ──────────────────────────────────────────
    const durBag = {}
    const easeBag = {}
    document.querySelectorAll('*').forEach((el) => {
      const cs = css(el)
      const td = cs.transitionDuration
      const te = cs.transitionTimingFunction
      const ad = cs.animationDuration
      // Skip the default "0s"
      if (td && td !== '0s' && !td.startsWith('0s,')) {
        // Split comma-separated values
        td.split(',').forEach((d) => {
          const k = d.trim()
          if (k !== '0s') durBag[k] = (durBag[k] || 0) + 1
        })
      }
      if (te && te !== 'ease') {
        te.split(',').forEach((e) => {
          const k = e.trim()
          easeBag[k] = (easeBag[k] || 0) + 1
        })
      }
      if (ad && ad !== '0s' && !ad.startsWith('0s,')) {
        ad.split(',').forEach((d) => {
          const k = d.trim()
          if (k !== '0s') durBag[`anim:${k}`] = (durBag[`anim:${k}`] || 0) + 1
        })
      }
    })

    // ── 6. EYEBROW PATTERNS ────────────────────────────────────────────────
    // Any small uppercase wide-tracked element
    const eyebrowSamples = []
    const seenEyebrow = new Set()
    document.querySelectorAll('span, p, h3, h4, div, a').forEach((el) => {
      if (eyebrowSamples.length >= 30) return
      const cs = css(el)
      const fs = parseFloat(cs.fontSize)
      const tt = cs.textTransform
      const ls = parseFloat(cs.letterSpacing)
      // "eyebrow-ish" if uppercase and small and tracked
      if (tt === 'uppercase' && fs <= 14 && (ls >= 1 || cs.letterSpacing.includes('em'))) {
        const text = (el.textContent || '').trim().slice(0, 40)
        if (!text || text.length > 50) return
        const sig = `${fs}|${cs.fontWeight}|${cs.letterSpacing}|${cs.fontFamily.slice(0, 30)}|${cs.color}`
        if (seenEyebrow.has(sig)) return
        seenEyebrow.add(sig)
        eyebrowSamples.push({
          text,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          letterSpacing: cs.letterSpacing,
          fontFamily: cs.fontFamily.replace(/"/g, '').slice(0, 40),
          color: cs.color,
          classes: (el.className || '').toString().slice(0, 60),
        })
      }
    })

    // ── 7. BUTTONS ─────────────────────────────────────────────────────────
    const buttonSamples = []
    const seenButton = new Set()
    document
      .querySelectorAll('button, a[role="button"], [class*="btn"], [class*="ev-link"]')
      .forEach((el) => {
        if (buttonSamples.length >= 20) return
        const cs = css(el)
        const sig = `${cs.borderRadius}|${cs.padding}|${cs.fontSize}|${cs.fontWeight}|${cs.backgroundColor}|${cs.color}|${cs.textTransform}|${cs.border.slice(0, 40)}`
        if (seenButton.has(sig)) return
        seenButton.add(sig)
        const text = (el.textContent || '').trim().slice(0, 30)
        if (!text) return
        buttonSamples.push({
          text,
          borderRadius: cs.borderRadius,
          padding: cs.padding,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          backgroundColor: cs.backgroundColor,
          color: cs.color,
          textTransform: cs.textTransform,
          border: cs.border,
          height: cs.height,
        })
      })

    // ── 8. CARDS ──────────────────────────────────────────────────────────
    const cardSamples = []
    const seenCard = new Set()
    document
      .querySelectorAll(
        '[class*="card"], [data-testid*="tile"], [data-testid*="card"], article, figure'
      )
      .forEach((el) => {
        if (cardSamples.length >= 20) return
        const cs = css(el)
        const sig = `${cs.borderRadius}|${cs.padding}|${cs.backgroundColor}|${cs.boxShadow.slice(0, 60)}|${cs.border.slice(0, 40)}`
        if (seenCard.has(sig)) return
        seenCard.add(sig)
        cardSamples.push({
          tag: el.tagName,
          classes: (el.className || '').toString().slice(0, 80),
          backgroundColor: cs.backgroundColor,
          border: cs.border,
          borderRadius: cs.borderRadius,
          padding: cs.padding,
          boxShadow: cs.boxShadow.slice(0, 60),
        })
      })

    // ── 9. SECTION HEADERS (eyebrow + heading pairs) ──────────────────────
    const sectionHeaderSamples = []
    document
      .querySelectorAll('h1, h2, h3')
      .forEach((heading) => {
        if (sectionHeaderSamples.length >= 12) return
        // Look for a preceding eyebrow-ish sibling
        let prev = heading.previousElementSibling
        let depth = 0
        while (prev && depth < 3) {
          const pcs = css(prev)
          if (pcs.textTransform === 'uppercase' && parseFloat(pcs.fontSize) <= 14) {
            const hcs = css(heading)
            sectionHeaderSamples.push({
              eyebrowText: (prev.textContent || '').trim().slice(0, 40),
              eyebrowFontSize: pcs.fontSize,
              eyebrowLetterSpacing: pcs.letterSpacing,
              eyebrowColor: pcs.color,
              headingTag: heading.tagName,
              headingText: (heading.textContent || '').trim().slice(0, 50),
              headingFontSize: hcs.fontSize,
              headingFontFamily: hcs.fontFamily.replace(/"/g, '').slice(0, 40),
              headingLineHeight: hcs.lineHeight,
              gap: 'inferred from DOM order',
            })
            break
          }
          prev = prev.previousElementSibling
          depth++
        }
      })

    // ── 10. MEDIA QUERIES (from loaded stylesheets) ───────────────────────
    const breakpoints = new Set()
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.constructor.name === 'CSSMediaRule' || rule.type === 4) {
              const m = rule.media.mediaText
              // Extract the "(min-width: ...)" or "(max-width: ...)" values
              const matches = m.match(/\(\s*(?:min|max)-width:\s*([0-9]+)px\s*\)/g)
              if (matches) {
                matches.forEach((x) => breakpoints.add(x))
              }
            }
          }
        } catch (e) {
          // CORS — many stylesheets refuse access
        }
      }
    } catch {}

    return {
      page: label,
      typeSamples,
      spacingSamples,
      colorBag,
      radiusBag,
      durBag,
      easeBag,
      eyebrowSamples,
      buttonSamples,
      cardSamples,
      sectionHeaderSamples,
      breakpoints: Array.from(breakpoints).slice(0, 40),
    }
  }, label)
}

const all = []
for (const p of PAGES) {
  console.log(`→ ${p.name} (${p.path})`)
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1200)
    all.push(await snapshot(page, p.name))
  } catch (e) {
    console.log(`  ! ${e.message}`)
    all.push({ page: p.name, error: e.message })
  }
  await ctx.close()
}
await browser.close()

// ── Aggregate ────────────────────────────────────────────────────────────────
const agg = {
  typeSignatures: new Map(),
  bgColors: new Map(),
  textColors: new Map(),
  borderColors: new Map(),
  radii: new Map(),
  durations: new Map(),
  easings: new Map(),
  buttonSigs: new Map(),
  cardSigs: new Map(),
  breakpoints: new Set(),
  eyebrowSigs: new Map(),
  fontFamilies: new Map(),
  byPage: {},
}

for (const snap of all) {
  if (snap.error) continue
  agg.byPage[snap.page] = {
    types: snap.typeSamples.length,
    eyebrows: snap.eyebrowSamples.length,
    buttons: snap.buttonSamples.length,
    radii: Object.keys(snap.radiusBag).length,
  }

  // Type signatures
  for (const t of snap.typeSamples) {
    const sig = `${t.tag}@${t.fontSize}/${t.lineHeight} w=${t.fontWeight} ls=${t.letterSpacing} tt=${t.textTransform}`
    if (!agg.typeSignatures.has(sig))
      agg.typeSignatures.set(sig, { count: 0, pages: new Set(), example: t })
    const e = agg.typeSignatures.get(sig)
    e.count++
    e.pages.add(snap.page)
    agg.fontFamilies.set(
      t.fontFamily,
      (agg.fontFamilies.get(t.fontFamily) || 0) + 1
    )
  }

  // Colors
  for (const [c, n] of Object.entries(snap.colorBag.bg)) {
    agg.bgColors.set(c, (agg.bgColors.get(c) || 0) + n)
  }
  for (const [c, n] of Object.entries(snap.colorBag.text)) {
    agg.textColors.set(c, (agg.textColors.get(c) || 0) + n)
  }
  for (const [c, n] of Object.entries(snap.colorBag.border)) {
    agg.borderColors.set(c, (agg.borderColors.get(c) || 0) + n)
  }

  // Radii
  for (const [r, n] of Object.entries(snap.radiusBag)) {
    agg.radii.set(r, (agg.radii.get(r) || 0) + n)
  }

  // Durations / easings
  for (const [d, n] of Object.entries(snap.durBag)) {
    agg.durations.set(d, (agg.durations.get(d) || 0) + n)
  }
  for (const [e, n] of Object.entries(snap.easeBag)) {
    agg.easings.set(e, (agg.easings.get(e) || 0) + n)
  }

  // Buttons
  for (const b of snap.buttonSamples) {
    const sig = `r=${b.borderRadius} p=${b.padding} fs=${b.fontSize}/${b.fontWeight} h=${b.height} bg=${b.backgroundColor}`
    if (!agg.buttonSigs.has(sig))
      agg.buttonSigs.set(sig, { count: 0, pages: new Set(), example: b })
    const e = agg.buttonSigs.get(sig)
    e.count++
    e.pages.add(snap.page)
  }

  // Cards
  for (const c of snap.cardSamples) {
    const sig = `r=${c.borderRadius} bg=${c.backgroundColor.slice(0, 30)} bord=${c.border.slice(0, 30)} pad=${c.padding} sh=${c.boxShadow.slice(0, 40)}`
    if (!agg.cardSigs.has(sig))
      agg.cardSigs.set(sig, { count: 0, pages: new Set(), example: c })
    const e = agg.cardSigs.get(sig)
    e.count++
    e.pages.add(snap.page)
  }

  // Breakpoints
  for (const bp of snap.breakpoints) agg.breakpoints.add(bp)

  // Eyebrows
  for (const e of snap.eyebrowSamples) {
    const sig = `fs=${e.fontSize} w=${e.fontWeight} ls=${e.letterSpacing} ff=${e.fontFamily.slice(0, 20)}`
    if (!agg.eyebrowSigs.has(sig))
      agg.eyebrowSigs.set(sig, { count: 0, pages: new Set(), example: e })
    const x = agg.eyebrowSigs.get(sig)
    x.count++
    x.pages.add(snap.page)
  }
}

// Sort helpers
const topN = (m, n = 20) =>
  Array.from(m.entries())
    .sort((a, b) => {
      const ac = typeof a[1] === 'number' ? a[1] : a[1].count
      const bc = typeof b[1] === 'number' ? b[1] : b[1].count
      return bc - ac
    })
    .slice(0, n)

const out = {
  pagesAudited: Object.keys(agg.byPage),
  perPage: agg.byPage,
  uniqueTypeSignatures: agg.typeSignatures.size,
  topTypeSignatures: topN(agg.typeSignatures, 30).map(([sig, v]) => ({
    sig,
    count: v.count,
    pages: Array.from(v.pages),
    example: v.example,
  })),
  uniqueFontFamilies: Array.from(agg.fontFamilies.entries()).sort(
    (a, b) => b[1] - a[1]
  ),
  uniqueBgColors: agg.bgColors.size,
  topBgColors: topN(agg.bgColors, 20),
  uniqueTextColors: agg.textColors.size,
  topTextColors: topN(agg.textColors, 20),
  uniqueBorderColors: agg.borderColors.size,
  topBorderColors: topN(agg.borderColors, 20),
  uniqueRadii: agg.radii.size,
  allRadii: topN(agg.radii, 50).map(([r, n]) => ({ radius: r, count: n })),
  uniqueDurations: agg.durations.size,
  allDurations: topN(agg.durations, 50).map(([d, n]) => ({
    duration: d,
    count: n,
  })),
  uniqueEasings: agg.easings.size,
  allEasings: topN(agg.easings, 30).map(([e, n]) => ({ easing: e, count: n })),
  uniqueButtonSigs: agg.buttonSigs.size,
  topButtons: topN(agg.buttonSigs, 12).map(([sig, v]) => ({
    sig,
    count: v.count,
    pages: Array.from(v.pages),
    example: v.example,
  })),
  uniqueCardSigs: agg.cardSigs.size,
  topCards: topN(agg.cardSigs, 12).map(([sig, v]) => ({
    sig,
    count: v.count,
    pages: Array.from(v.pages),
    example: v.example,
  })),
  uniqueEyebrowSigs: agg.eyebrowSigs.size,
  topEyebrows: topN(agg.eyebrowSigs, 10).map(([sig, v]) => ({
    sig,
    count: v.count,
    pages: Array.from(v.pages),
    example: v.example,
  })),
  breakpoints: Array.from(agg.breakpoints).sort(),
}

const outPath = 'docs/coherence-audit-raw.json'
await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, JSON.stringify(out, null, 2))
console.log(`wrote ${outPath} (${JSON.stringify(out).length} bytes)`)
