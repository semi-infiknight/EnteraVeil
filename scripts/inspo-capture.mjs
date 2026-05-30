// Reference capture — extracts typography/colors/layout primitives from
// inspiration sites via DOM evaluation only. No screenshots ever land in
// context. Writes findings to docs/inspiration-notes.md.
//
// Run: node scripts/inspo-capture.mjs

import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'
import { writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

const sites = [
  { name: 'xenpachi', url: 'https://www.xenpachi.com/' },
  { name: 'comicsense', url: 'https://www.comicsense.store/' },
]

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox'],
})

const findings = {}
for (const site of sites) {
  console.log(`→ ${site.name} (${site.url})`)
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  })
  const page = await ctx.newPage()

  try {
    await page.goto(site.url, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(2000)

    findings[site.name] = await page.evaluate(() => {
      const out = {}

      // ── Headings ───────────────────────────────────────────────────────────
      const headingTags = ['h1', 'h2', 'h3']
      out.headings = []
      for (const t of headingTags) {
        const els = document.querySelectorAll(t)
        const sample = Array.from(els).slice(0, 3)
        for (const el of sample) {
          const cs = getComputedStyle(el)
          out.headings.push({
            tag: t,
            text: (el.textContent || '').trim().slice(0, 70),
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            letterSpacing: cs.letterSpacing,
            lineHeight: cs.lineHeight,
            textTransform: cs.textTransform,
            color: cs.color,
          })
        }
      }

      // ── Body text ──────────────────────────────────────────────────────────
      const p = document.querySelector('p')
      if (p) {
        const cs = getComputedStyle(p)
        out.body = {
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          color: cs.color,
        }
      }

      // ── Colour usage frequency ────────────────────────────────────────────
      const colorCounts = {}
      const txtCounts = {}
      const borderCounts = {}
      document.querySelectorAll('*').forEach((el) => {
        const cs = getComputedStyle(el)
        const bg = cs.backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)') {
          colorCounts[bg] = (colorCounts[bg] || 0) + 1
        }
        const col = cs.color
        if (col) txtCounts[col] = (txtCounts[col] || 0) + 1
        const bcol = cs.borderColor
        if (bcol && bcol !== 'rgb(0, 0, 0)' && bcol !== 'rgba(0, 0, 0, 0)') {
          borderCounts[bcol] = (borderCounts[bcol] || 0) + 1
        }
      })
      const sortPairs = (obj) =>
        Object.entries(obj)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
      out.topBg = sortPairs(colorCounts)
      out.topText = sortPairs(txtCounts)
      out.topBorder = sortPairs(borderCounts)

      // ── Section primitives (top-level layout containers) ─────────────────
      const sectionEls = Array.from(
        document.querySelectorAll(
          'section, main > div, [class*="section"], [class*="hero"]'
        )
      ).slice(0, 12)
      out.sections = sectionEls.map((el, i) => {
        const cs = getComputedStyle(el)
        return {
          index: i,
          tag: el.tagName,
          classes: (el.className || '').toString().slice(0, 180),
          display: cs.display,
          gap: cs.gap,
          padding: cs.padding,
          minHeight: cs.minHeight,
          backgroundColor: cs.backgroundColor,
          textAlign: cs.textAlign,
        }
      })

      // ── Buttons / CTAs ────────────────────────────────────────────────────
      const btns = document.querySelectorAll(
        'button, a[class*="btn"], a[class*="cta"], a[class*="button"]'
      )
      out.buttons = Array.from(btns)
        .slice(0, 8)
        .map((el) => {
          const cs = getComputedStyle(el)
          return {
            text: (el.textContent || '').trim().slice(0, 50),
            bg: cs.backgroundColor,
            color: cs.color,
            padding: cs.padding,
            borderRadius: cs.borderRadius,
            fontWeight: cs.fontWeight,
            textTransform: cs.textTransform,
            letterSpacing: cs.letterSpacing,
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            border: cs.border,
          }
        })

      // ── Product cards (whatever-looks-like-a-card) ────────────────────────
      const cardCandidates = document.querySelectorAll(
        '[class*="product"], [class*="card"], article'
      )
      out.cards = Array.from(cardCandidates)
        .slice(0, 5)
        .map((el) => {
          const cs = getComputedStyle(el)
          return {
            tag: el.tagName,
            classes: (el.className || '').toString().slice(0, 160),
            backgroundColor: cs.backgroundColor,
            border: cs.border,
            borderRadius: cs.borderRadius,
            padding: cs.padding,
            transform: cs.transform,
            boxShadow: cs.boxShadow,
            // Text snippets from inside the card
            innerText: (el.textContent || '').trim().slice(0, 150),
          }
        })

      // ── Hero (best-guess) ─────────────────────────────────────────────────
      const hero = document.querySelector(
        'main section:first-of-type, header + section, [class*="hero"], #hero'
      )
      if (hero) {
        const cs = getComputedStyle(hero)
        out.hero = {
          classes: (hero.className || '').toString().slice(0, 200),
          display: cs.display,
          minHeight: cs.minHeight,
          padding: cs.padding,
          gap: cs.gap,
          backgroundColor: cs.backgroundColor,
          // First couple of nested headings inside the hero
          innerHeadings: Array.from(
            hero.querySelectorAll('h1, h2, h3')
          )
            .slice(0, 3)
            .map((h) => {
              const hcs = getComputedStyle(h)
              return {
                tag: h.tagName,
                text: (h.textContent || '').trim().slice(0, 80),
                fontSize: hcs.fontSize,
                fontFamily: hcs.fontFamily,
                fontWeight: hcs.fontWeight,
                letterSpacing: hcs.letterSpacing,
                lineHeight: hcs.lineHeight,
                textTransform: hcs.textTransform,
              }
            }),
          // HTML snippet (limited so we capture structure without dumping the whole page)
          innerHTML: hero.innerHTML.slice(0, 2000),
        }
      }

      // ── Marquees / tickers (very on-brand for streetwear) ────────────────
      const marqueeEls = document.querySelectorAll(
        'marquee, [class*="marquee"], [class*="ticker"], [class*="slider"]'
      )
      out.marquees = Array.from(marqueeEls)
        .slice(0, 4)
        .map((el) => ({
          tag: el.tagName,
          classes: (el.className || '').toString().slice(0, 160),
          innerText: (el.textContent || '').trim().slice(0, 200),
        }))

      // ── @font-face declarations from loaded stylesheets ──────────────────
      const fontFaces = new Set()
      try {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.constructor.name === 'CSSFontFaceRule' || rule.type === 5) {
                const fam = rule.style?.fontFamily
                const weight = rule.style?.fontWeight
                if (fam) fontFaces.add(`${fam} weight=${weight || '?'}`)
              }
            }
          } catch (e) {
            // CORS — some stylesheets refuse access
          }
        }
      } catch {}
      out.fontFaces = Array.from(fontFaces).slice(0, 12)

      // ── Body backdrop / brand colours ────────────────────────────────────
      const bodyCs = getComputedStyle(document.body)
      out.bodyDefaults = {
        backgroundColor: bodyCs.backgroundColor,
        color: bodyCs.color,
        fontFamily: bodyCs.fontFamily,
        fontSize: bodyCs.fontSize,
      }

      return out
    })
  } catch (e) {
    findings[site.name] = { error: e.message }
    console.log(`  ! error: ${e.message}`)
  }

  await ctx.close()
}

await browser.close()

// Write the raw findings
const outPath = 'docs/inspiration-notes.md'
await mkdir(dirname(outPath), { recursive: true })
const content =
  '# Inspiration capture\n\n' +
  '_Sourced via Playwright DOM evaluation against the live inspo sites._\n' +
  '_All measurements are computed styles; no screenshots were read._\n\n' +
  '```json\n' +
  JSON.stringify(findings, null, 2) +
  '\n```\n'
await writeFile(outPath, content)
console.log(`wrote ${outPath} (${content.length} bytes)`)
