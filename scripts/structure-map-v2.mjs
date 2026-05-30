// v2: walks deeper into wrapper containers (.ct-container-full, .pb-*, etc)
// so xenpachi/comicsense top-level sections inside their WordPress page
// wrapper get itemized instead of swallowed into one giant 2500% vh box.

import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'
import { writeFile, mkdir } from 'fs/promises'

const TARGETS = [
  { label: 'xenpachi-home', url: 'https://www.xenpachi.com/', viewport: { width: 1440, height: 900 } },
  { label: 'comicsense-home', url: 'https://www.comicsense.store/', viewport: { width: 1440, height: 900 } },
  { label: 'ev-home-desktop', url: 'http://localhost:8000/in', viewport: { width: 1440, height: 900 } },
  { label: 'ev-home-mobile', url: 'http://localhost:8000/in', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { label: 'ev-pdp-desktop', url: 'http://localhost:8000/in/products/shorts', viewport: { width: 1440, height: 900 } },
  { label: 'xenpachi-shop', url: 'https://www.xenpachi.com/shop/', viewport: { width: 1440, height: 900 } },
  { label: 'comicsense-tees', url: 'https://www.comicsense.store/product-category/tees/', viewport: { width: 1440, height: 900 } },
]

const browser = await chromium.launch({ headless: true })

async function map(page) {
  return await page.evaluate(() => {
    const vh = window.innerHeight

    // Strategy: find the "page content host" — drill until we hit a
    // container that has 4+ visually substantial children.
    function drill(root) {
      let cur = root
      let safety = 8
      while (safety-- > 0) {
        const children = Array.from(cur.children).filter((c) => {
          const r = c.getBoundingClientRect()
          return r.height > 20 && r.width > 100
        })
        if (children.length >= 4) return children
        if (children.length === 0) return []
        // Drill into the tallest single child
        const tallest = children.sort(
          (a, b) =>
            b.getBoundingClientRect().height - a.getBoundingClientRect().height
        )[0]
        cur = tallest
      }
      return Array.from(cur.children)
    }

    const main =
      document.querySelector('main') ||
      document.querySelector('#main') ||
      document.querySelector('.ct-container-full') ||
      document.body

    const sections = drill(main)

    // Also include header + above-main marquees
    const above = []
    let cur = main.previousElementSibling
    while (cur) {
      const r = cur.getBoundingClientRect()
      if (r.height > 5) above.unshift(cur)
      cur = cur.previousElementSibling
    }
    const headerEl = document.querySelector('body > header, body > nav')
    if (headerEl && !above.includes(headerEl)) above.unshift(headerEl)

    const all = [...above, ...sections]

    return all.map((el, i) => {
      const cs = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      const imgs = el.querySelectorAll('img')
      const links = el.querySelectorAll('a')
      const headEl = el.querySelector('h1, h2, h3')
      const headlineText = headEl
        ? (headEl.textContent || '').trim().slice(0, 80)
        : ''

      // Classify
      const classes = (el.className || '').toString().toLowerCase()
      const tag = el.tagName
      const text = (el.textContent || '').toLowerCase().slice(0, 500)
      let kind = 'unknown'
      if (/marquee|ticker|gspb_marquee/.test(classes)) kind = 'marquee'
      else if (tag === 'HEADER' || /nav|header/.test(classes)) kind = 'header'
      else if (tag === 'FOOTER' || /footer/.test(classes)) kind = 'footer'
      else if (/hero/.test(classes) || (i < 3 && rect.height > vh * 0.6))
        kind = 'hero'
      else if (/lookbook/.test(classes)) kind = 'lookbook'
      else if (/(carousel|slider|swiper|embla)/.test(classes) && imgs.length > 2)
        kind = 'carousel'
      else if (
        /(featured|collection|category|categories)/.test(classes) &&
        imgs.length > 0
      )
        kind = 'featured-grid'
      else if (/(banner|callout|cta)/.test(classes) && imgs.length > 0)
        kind = 'banner'
      else if (
        /(newsletter|subscribe|signup|dispatch)/.test(text) &&
        el.querySelector('input')
      )
        kind = 'newsletter'
      else if (
        /(testimonial|review|quote)/.test(classes) ||
        /["“][^"”]{20,}["”]/.test(text)
      )
        kind = 'testimonial'
      else if (
        /(blog|journal|article|story|read)/.test(classes + text) &&
        imgs.length > 1
      )
        kind = 'blog-strip'
      else if (imgs.length >= 4 && links.length >= 4) kind = 'product-grid'
      else if (imgs.length >= 1 && headEl) kind = 'image-text'
      else if (headEl) kind = 'text-block'

      // Alignment dominant
      const alignBag = {}
      el.querySelectorAll('h1, h2, h3, p').forEach((te) => {
        const a = getComputedStyle(te).textAlign
        alignBag[a] = (alignBag[a] || 0) + 1
      })
      const dominantAlign =
        Object.entries(alignBag).sort((a, b) => b[1] - a[1])[0]?.[0] || 'start'

      // Grid columns guess
      let gridCols = null
      for (const child of el.children) {
        const ccs = getComputedStyle(child)
        if (ccs.display === 'grid') {
          gridCols = ccs.gridTemplateColumns?.split(' ').length || null
          if (gridCols && gridCols > 1) break
        }
        if (ccs.display === 'flex' && ccs.flexDirection === 'row') {
          const flexChildren = Array.from(child.children).filter((c) => {
            const r = c.getBoundingClientRect()
            return r.width > 50 && r.height > 50
          })
          if (flexChildren.length > 1) {
            gridCols = flexChildren.length
            break
          }
        }
      }

      return {
        i,
        kind,
        tag,
        classes: (el.className || '').toString().slice(0, 140),
        height: Math.round(rect.height),
        vh: Math.round((rect.height / vh) * 100),
        marginBottom: cs.marginBottom,
        paddingY: `${cs.paddingTop}/${cs.paddingBottom}`,
        bg: cs.backgroundColor,
        dominantAlign,
        alignBag,
        imgs: imgs.length,
        links: links.length,
        h: headEl ? headEl.tagName : null,
        headline: headlineText,
        gridCols,
        density:
          imgs.length + links.length > 50
            ? 'high'
            : imgs.length + links.length > 15
              ? 'medium'
              : 'low',
      }
    })
  })
}

const results = {}
for (const t of TARGETS) {
  console.log(`→ ${t.label}`)
  const ctx = await browser.newContext({
    viewport: t.viewport,
    isMobile: t.isMobile || false,
    hasTouch: t.hasTouch || false,
    userAgent: t.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
  })
  const page = await ctx.newPage()
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)
    results[t.label] = await map(page)
  } catch (e) {
    console.log(`  ! ${e.message}`)
    results[t.label] = { error: e.message }
  }
  await ctx.close()
}
await browser.close()

await mkdir('docs', { recursive: true })
await writeFile(
  'docs/structure-map-v2.json',
  JSON.stringify(results, null, 2)
)
console.log(`wrote docs/structure-map-v2.json`)
