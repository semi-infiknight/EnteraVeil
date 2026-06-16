// v3: longer wait, better tunnel debugging
import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'

const URL = process.argv[2] ?? 'http://localhost:8000/in'
const WAIT = parseInt(process.argv[3] ?? '4000')

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})
const page = await ctx.newPage()

const errors = []
const failedChunks = []
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('console', (m) => {
  const t = m.type()
  if (t === 'error' || t === 'warning') errors.push(`${t.toUpperCase()}: ${m.text()}`)
})
page.on('requestfailed', (r) => {
  const url = r.url()
  if (url.includes('_next')) failedChunks.push(`REQFAIL: ${r.failure()?.errorText} ${url}`)
})
page.on('response', (r) => {
  const url = r.url()
  if (r.status() >= 400 && url.includes('_next')) {
    failedChunks.push(`HTTP ${r.status()}: ${url}`)
  }
})

console.log(`→ ${URL} (${WAIT}ms wait)`)
await page.goto(URL, { waitUntil: 'load', timeout: 60_000 })

// Wait for JS to execute
await page.waitForTimeout(WAIT)

// Check if any _next chunks failed
console.log('\n--- Failed/4xx _next chunks ---')
console.log(failedChunks.join('\n') || '(none)')

// Count all interactive elements after hydration
const dom = await page.evaluate(() => ({
  buttons: document.querySelectorAll('button').length,
  mobileMenu: !!document.querySelector('[data-testid="mobile-menu"]'),
  mobileNav: !!document.querySelector('[data-testid="mobile-bottom-nav"]'),
  footerAccordions: document.querySelectorAll('footer button[aria-expanded]').length,
  reactFiber: !!document.querySelector('[data-reactroot]') ||
    Object.keys(window).some(k => k.startsWith('__react')),
  // check turbopack RSC boundary
  nextRouterReady: !!window.__NEXT_DATA__ || !!window.next?.router,
  bodyInnerHTMLSnippet: document.body.innerHTML.slice(0, 200),
}))
console.log('\n--- DOM after hydration ---')
console.log(JSON.stringify(dom, null, 2))

// Try to find mobile-menu with a looser selector
const hamburgerAlts = await page.evaluate(() => {
  const all = [...document.querySelectorAll('button')]
  return all
    .filter(b => {
      const txt = (b.textContent || '').toLowerCase()
      const aria = (b.getAttribute('aria-label') || '').toLowerCase()
      const cls = b.className || ''
      return aria.includes('menu') || aria.includes('nav') || cls.includes('bars') ||
        b.querySelector('svg') !== null
    })
    .slice(0, 5)
    .map(b => ({
      testid: b.getAttribute('data-testid'),
      ariaLabel: b.getAttribute('aria-label'),
      class: b.className.slice(0, 80),
      visible: b.getBoundingClientRect().width > 0,
    }))
})
console.log('\n--- Button candidates (may include hamburger) ---')
console.log(JSON.stringify(hamburgerAlts, null, 2))

console.log('\n--- Console errors ---')
const relevant = errors.filter(e =>
  !e.includes('strapi') && !e.includes('1337') && !e.includes('favicon')
)
console.log(relevant.slice(0, 30).join('\n') || '(none)')

await browser.close()
