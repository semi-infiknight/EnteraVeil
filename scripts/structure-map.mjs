// Walks the DOM tree of inspo sites + EnteraVeil pages and produces a
// section-by-section structural map. No screenshots ever land in
// context. Writes:
//   docs/pre-polish-hero.html      — EV hero HTML snapshot (mobile 390x844)
//   docs/structure-map-raw.json    — full DOM walk for both inspo + EV
//
// Run: node scripts/structure-map.mjs

import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'
import { writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

const TARGETS = [
  { label: 'xenpachi-home', url: 'https://www.xenpachi.com/', viewport: { width: 1440, height: 900 } },
  // Use a known product URL from comicsense menu — Tees category is likely most representative
  { label: 'comicsense-home', url: 'https://www.comicsense.store/', viewport: { width: 1440, height: 900 } },
  { label: 'ev-home-desktop', url: 'http://localhost:8000/in', viewport: { width: 1440, height: 900 } },
  { label: 'ev-home-mobile', url: 'http://localhost:8000/in', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { label: 'ev-pdp-desktop', url: 'http://localhost:8000/in/products/shorts', viewport: { width: 1440, height: 900 } },
  // PDP candidate: pick one product URL from each inspo. Try a Tees URL; fall back to homepage if it fails.
  { label: 'xenpachi-pdp', url: 'https://www.xenpachi.com/shop/', viewport: { width: 1440, height: 900 } },
  { label: 'comicsense-pdp', url: 'https://www.comicsense.store/product-category/tees/', viewport: { width: 1440, height: 900 } },
]

const browser = await chromium.launch({ headless: true })

// Section classifier — best-effort heuristic from class names + content
function classifySection(el) {
  const classes = (el.className || '').toString().toLowerCase()
  const tag = el.tagName
  const text = (el.textContent || '').toLowerCase().slice(0, 400)
  const imgCount = el.querySelectorAll('img').length
  const aCount = el.querySelectorAll('a').length
  const hCount = el.querySelectorAll('h1, h2, h3').length

  if (/marquee|ticker|gspb_marquee/i.test(classes)) return 'marquee'
  if (/hero/i.test(classes)) return 'hero'
  if (/footer/i.test(classes) || tag === 'FOOTER') return 'footer'
  if (/nav|header|menu/i.test(classes) || tag === 'HEADER' || tag === 'NAV') return 'nav'
  if (/lookbook/i.test(classes)) return 'lookbook'
  if (/banner|callout/i.test(classes) && imgCount > 0) return 'banner'
  if (/(carousel|slider|swiper|embla)/i.test(classes) && imgCount > 2) return 'carousel'
  if (/(featured|collection|category|categories)/i.test(classes) && imgCount > 0) return 'featured-grid'
  if (/(newsletter|subscribe|signup)/i.test(text) && el.querySelector('input')) return 'newsletter'
  if (/(testimonial|review|quote)/i.test(classes + text)) return 'testimonial'
  if (/blog|journal|article/i.test(classes + text)) return 'blog-strip'
  if (imgCount >= 4 && aCount >= 4) return 'product-grid'
  if (imgCount >= 1 && hCount >= 1) return 'image-text-block'
  if (hCount >= 1) return 'text-block'
  return 'unknown'
}

async function mapStructure(page, label) {
  return await page.evaluate((label) => {
    const css = (el) => getComputedStyle(el)
    const vh = window.innerHeight

    // Find primary container — main, body, or top-level wrapper
    const main =
      document.querySelector('main') ||
      document.querySelector('#main') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('.ct-container-full') ||
      document.body

    // First-pass: capture top-level children of main + their immediate
    // children if main is a thin wrapper.
    let topLevel = Array.from(main.children)

    // If main has only 1 child that contains everything, drill in
    while (topLevel.length === 1 && topLevel[0].children.length > 2) {
      topLevel = Array.from(topLevel[0].children)
    }

    // Also walk the body for elements ABOVE main (sticky nav, marquees)
    const aboveMain = []
    if (main !== document.body) {
      let cur = main.previousElementSibling
      while (cur) {
        aboveMain.unshift(cur)
        cur = cur.previousElementSibling
      }
      // Also include header at top of body
      const header = document.querySelector('body > header, body > nav')
      if (header && !aboveMain.includes(header)) aboveMain.unshift(header)
    }

    const allSections = [...aboveMain, ...topLevel]

    return allSections.map((el, i) => {
      const cs = css(el)
      const rect = el.getBoundingClientRect()
      const imgs = el.querySelectorAll('img')
      const links = el.querySelectorAll('a')
      const h1 = el.querySelectorAll('h1').length
      const h2 = el.querySelectorAll('h2').length
      const h3 = el.querySelectorAll('h3').length
      const buttons = el.querySelectorAll('button, [class*="btn"], [class*="button"], a[class*="cta"]').length
      const inputs = el.querySelectorAll('input, textarea, select').length

      // Find the dominant heading text
      let headlineText = ''
      const headEl = el.querySelector('h1, h2')
      if (headEl) headlineText = (headEl.textContent || '').trim().slice(0, 80)

      // Detect text alignment
      const allTextEls = el.querySelectorAll('h1, h2, h3, p')
      const alignments = {}
      allTextEls.forEach((te) => {
        const a = getComputedStyle(te).textAlign
        alignments[a] = (alignments[a] || 0) + 1
      })

      // Estimate grid columns from the first significant child
      const gridChild = Array.from(el.children).find((c) => c.children.length > 2)
      let gridCols = null
      if (gridChild) {
        const gc = getComputedStyle(gridChild)
        if (gc.display === 'grid') {
          gridCols = gc.gridTemplateColumns?.split(' ').length || null
        } else if (gc.display === 'flex' && gc.flexDirection === 'row') {
          gridCols = gridChild.children.length
        }
      }

      return {
        index: i,
        tag: el.tagName,
        classes: (el.className || '').toString().slice(0, 160),
        height: Math.round(rect.height),
        viewportHeightPct: Math.round((rect.height / vh) * 100),
        widthPct: Math.round((rect.width / window.innerWidth) * 100),
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        backgroundColor: cs.backgroundColor,
        textAlign: cs.textAlign,
        alignmentBreakdown: alignments,
        imgCount: imgs.length,
        linkCount: links.length,
        h1Count: h1,
        h2Count: h2,
        h3Count: h3,
        buttonCount: buttons,
        inputCount: inputs,
        gridColumns: gridCols,
        headlineText,
        // Short structural fingerprint
        innerHTMLLength: el.innerHTML.length,
      }
    })
  }, label)
}

const results = {}
const heroSnapshots = {}

for (const target of TARGETS) {
  console.log(`→ ${target.label}`)
  const ctx = await browser.newContext({
    viewport: target.viewport,
    isMobile: target.isMobile || false,
    hasTouch: target.hasTouch || false,
    userAgent: target.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
  })
  const page = await ctx.newPage()
  try {
    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)

    results[target.label] = await mapStructure(page, target.label)

    // For EV mobile hero, capture the first-section HTML so we have a
    // baseline to diff against later
    if (target.label === 'ev-home-mobile') {
      const heroHTML = await page.evaluate(() => {
        const heroEl =
          document.querySelector('main section:first-of-type') ||
          document.querySelector('main > section') ||
          document.querySelector('.ev-rise')?.closest('section') ||
          document.body.firstElementChild
        return heroEl ? heroEl.outerHTML : '(not found)'
      })
      heroSnapshots[target.label] = heroHTML
    }
  } catch (e) {
    console.log(`  ! ${e.message}`)
    results[target.label] = { error: e.message }
  }
  await ctx.close()
}

await browser.close()

await mkdir('docs', { recursive: true })

await writeFile(
  'docs/structure-map-raw.json',
  JSON.stringify(results, null, 2)
)
console.log(`wrote docs/structure-map-raw.json (${JSON.stringify(results).length} bytes)`)

if (heroSnapshots['ev-home-mobile']) {
  await writeFile('docs/pre-polish-hero.html', heroSnapshots['ev-home-mobile'])
  console.log('wrote docs/pre-polish-hero.html (mobile baseline)')
}
